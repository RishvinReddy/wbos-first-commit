import json
import logging
import datetime
import uuid
from boto3.dynamodb.conditions import Key
from core.db import get_client, config
from core.evaluator import evaluate_all
from core.actions import execute_action

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

MAX_DEPTH = 3

def _now():
    return datetime.datetime.now(datetime.UTC).isoformat() + "Z"

def write_execution_record(tenant_id, auto_id, auto_name, trigger_event, status, trace, started_at, completed_at):
    client = get_client()
    exec_id = f"EXEC_{uuid.uuid4().hex[:8].upper()}"
    client.put_item(
        TableName=config.DYNAMODB_TABLE,
        Item={
            "PK": {"S": f"TENANT#{tenant_id}#AUTOMATION_EXECUTION"},
            "SK": {"S": f"TIME#{started_at}#{exec_id}"},
            "entityType": {"S": "AUTOMATION_EXECUTION"},
            "executionId": {"S": exec_id},
            "automationId": {"S": auto_id},
            "automationName": {"S": auto_name},
            "status": {"S": status},
            "triggerEvent": {"S": trigger_event},
            "trace": {"S": json.dumps(trace)},
            "startedAt": {"S": started_at},
            "completedAt": {"S": completed_at}
        }
    )

def lambda_handler(event, context):
    """
    Core Automation Engine Lambda.
    Triggered by EventBridge for specific domain events.
    """
    try:
        source = event.get("source", "unknown")
        event_type = event.get("detail-type", "UnknownEvent")
        detail = event.get("detail", {})
        tenant_id = detail.get("tenantId")
        
        if not tenant_id:
            logger.warning("Event missing tenantId. Skipping.")
            return

        depth = detail.get("automation_depth", 0)
        if depth >= MAX_DEPTH:
            logger.warning(f"Automation execution loop guard triggered (depth={depth}) for tenant {tenant_id}")
            return
            
        client = get_client()
        
        # Fast query for matching active automations
        res = client.query(
            TableName=config.DYNAMODB_TABLE,
            IndexName="GSI3",
            KeyConditionExpression="GSI3PK = :pk",
            ExpressionAttributeValues={
                ":pk": {"S": f"TENANT#{tenant_id}#TRIGGER#{event_type}"}
            }
        )
        items = res.get("Items", [])
        
        if not items:
            logger.info(f"No active automations found for trigger {event_type} in tenant {tenant_id}")
            return

        # Fetch full automation objects to execute
        automations = []
        for item in items:
            auto_id = item["automationId"]["S"]
            auto_res = client.get_item(
                TableName=config.DYNAMODB_TABLE,
                Key={"PK": {"S": f"TENANT#{tenant_id}"}, "SK": {"S": f"AUTOMATION#{auto_id}"}}
            )
            if "Item" in auto_res:
                automations.append(auto_res["Item"])
                
        for auto in automations:
            started_at = _now()
            auto_id = auto["automationId"]["S"]
            auto_name = auto.get("name", {}).get("S", "Unknown")
            conditions = json.loads(auto.get("conditions", {}).get("S", "[]"))
            actions = json.loads(auto.get("actions", {}).get("S", "[]"))
            
            trace = [{
                "step": "Trigger",
                "detail": event_type,
                "status": "SUCCESS"
            }]
            
            logger.info(f"Evaluating automation {auto_name} ({auto_id}) for {event_type}")
            
            # Evaluate Conditions
            cond_pass = True
            for cond in conditions:
                from core.evaluator import evaluate_condition
                passed = evaluate_condition(detail.get("data", {}), cond)
                trace.append({
                    "step": "Condition",
                    "detail": f"{cond.get('field')} {cond.get('operator')} {cond.get('value')}",
                    "status": "SUCCESS" if passed else "SKIPPED"
                })
                if not passed:
                    cond_pass = False
                    break
                    
            if not cond_pass:
                logger.info(f"Automation {auto_id} conditions not met (skipped).")
                write_execution_record(tenant_id, auto_id, auto_name, event_type, "SKIPPED", trace, started_at, _now())
                continue
                
            # Execute Actions
            action_failed = False
            for action in actions:
                # Execution layer
                result = execute_action(tenant_id, action, detail.get("data", {}))
                trace.append(result)
                if result.get("status") == "FAILED":
                    action_failed = True
                    break
                    
            final_status = "FAILED" if action_failed else "SUCCESS"
            logger.info(f"Automation {auto_id} completed with status {final_status}")
            write_execution_record(tenant_id, auto_id, auto_name, event_type, final_status, trace, started_at, _now())

        return {"status": "success"}

    except Exception as e:
        logger.error(f"Error executing automation engine: {e}")
        raise
