import datetime
import uuid
import json
from boto3.dynamodb.conditions import Key
from core.db import get_client, config

def generate_id():
    return f"AUTO_{uuid.uuid4().hex[:8].upper()}"

def _now():
    return datetime.datetime.now(datetime.UTC).isoformat() + "Z"

def create_automation(tenant_id: str, payload: dict):
    auto_id = generate_id()
    now = _now()
    
    item = {
        "PK": {"S": f"TENANT#{tenant_id}"},
        "SK": {"S": f"AUTOMATION#{auto_id}"},
        "entityType": {"S": "AUTOMATION"},
        "tenantId": {"S": tenant_id},
        "automationId": {"S": auto_id},
        "name": {"S": payload.get("name", "New Automation")},
        "description": {"S": payload.get("description", "")},
        "status": {"S": "DRAFT"},
        "version": {"N": "1"},
        "trigger": {"S": json.dumps(payload.get("trigger", {}))},
        "conditions": {"S": json.dumps(payload.get("conditions", []))},
        "actions": {"S": json.dumps(payload.get("actions", []))},
        "createdAt": {"S": now},
        "updatedAt": {"S": now}
    }
    
    client = get_client()
    client.put_item(
        TableName=config.DYNAMODB_TABLE,
        Item=item
    )
    
    return _parse_automation(item)

def update_automation(tenant_id: str, auto_id: str, payload: dict):
    client = get_client()
    
    # Fetch existing
    res = client.get_item(
        TableName=config.DYNAMODB_TABLE,
        Key={"PK": {"S": f"TENANT#{tenant_id}"}, "SK": {"S": f"AUTOMATION#{auto_id}"}}
    )
    if "Item" not in res:
        raise ValueError("Automation not found")
        
    existing = res["Item"]
    current_status = existing.get("status", {}).get("S", "DRAFT")
    
    now = _now()
    
    # Updates to apply
    name = payload.get("name", existing.get("name", {}).get("S", ""))
    description = payload.get("description", existing.get("description", {}).get("S", ""))
    trigger = payload.get("trigger") or json.loads(existing.get("trigger", {}).get("S", "{}"))
    conditions = payload.get("conditions") or json.loads(existing.get("conditions", {}).get("S", "[]"))
    actions = payload.get("actions") or json.loads(existing.get("actions", {}).get("S", "[]"))
    
    version = int(existing.get("version", {}).get("N", "1"))
    
    if current_status == "ACTIVE":
        # If it's active, we should technically spawn a DRAFT version.
        # But for Phase B MVP, we'll demote it to DRAFT, increment version, and drop from GSI3 until republished.
        status = "DRAFT"
        version += 1
    else:
        status = current_status
        
    update_expr = "SET #nm = :name, description = :desc, #st = :status, version = :ver, #trg = :trigger, conditions = :cond, actions = :actions, updatedAt = :now REMOVE GSI3PK, GSI3SK"
    
    client.update_item(
        TableName=config.DYNAMODB_TABLE,
        Key={"PK": {"S": f"TENANT#{tenant_id}"}, "SK": {"S": f"AUTOMATION#{auto_id}"}},
        UpdateExpression=update_expr,
        ExpressionAttributeNames={
            "#nm": "name",
            "#st": "status",
            "#trg": "trigger"
        },
        ExpressionAttributeValues={
            ":name": {"S": name},
            ":desc": {"S": description},
            ":status": {"S": status},
            ":ver": {"N": str(version)},
            ":trigger": {"S": json.dumps(trigger)},
            ":cond": {"S": json.dumps(conditions)},
            ":actions": {"S": json.dumps(actions)},
            ":now": {"S": now}
        }
    )
    
    return get_automation(tenant_id, auto_id)

def validate_flow(trigger: dict, conditions: list, actions: list):
    if not trigger or "type" not in trigger:
        raise ValueError("A valid trigger is required")
        
    if not actions or len(actions) == 0:
        raise ValueError("At least one action is required")
        
    for action in actions:
        if "type" not in action:
            raise ValueError("All actions must have a type")

def activate_automation(tenant_id: str, auto_id: str):
    client = get_client()
    res = client.get_item(
        TableName=config.DYNAMODB_TABLE,
        Key={"PK": {"S": f"TENANT#{tenant_id}"}, "SK": {"S": f"AUTOMATION#{auto_id}"}}
    )
    if "Item" not in res:
        raise ValueError("Automation not found")
        
    item = res["Item"]
    trigger = json.loads(item.get("trigger", {}).get("S", "{}"))
    conditions = json.loads(item.get("conditions", {}).get("S", "[]"))
    actions = json.loads(item.get("actions", {}).get("S", "[]"))
    
    # 1. Validate Flow
    validate_flow(trigger, conditions, actions)
    
    trigger_type = trigger["type"]
    
    # 2. Activate and Index in GSI3
    now = _now()
    client.update_item(
        TableName=config.DYNAMODB_TABLE,
        Key={"PK": {"S": f"TENANT#{tenant_id}"}, "SK": {"S": f"AUTOMATION#{auto_id}"}},
        UpdateExpression="SET #st = :status, updatedAt = :now, GSI3PK = :gsi3pk, GSI3SK = :gsi3sk",
        ExpressionAttributeNames={"#st": "status"},
        ExpressionAttributeValues={
            ":status": {"S": "ACTIVE"},
            ":now": {"S": now},
            ":gsi3pk": {"S": f"TENANT#{tenant_id}#TRIGGER#{trigger_type}"},
            ":gsi3sk": {"S": f"AUTOMATION#{auto_id}"}
        }
    )
    
    return get_automation(tenant_id, auto_id)

def pause_automation(tenant_id: str, auto_id: str):
    client = get_client()
    now = _now()
    client.update_item(
        TableName=config.DYNAMODB_TABLE,
        Key={"PK": {"S": f"TENANT#{tenant_id}"}, "SK": {"S": f"AUTOMATION#{auto_id}"}},
        UpdateExpression="SET #st = :status, updatedAt = :now REMOVE GSI3PK, GSI3SK",
        ExpressionAttributeNames={"#st": "status"},
        ExpressionAttributeValues={
            ":status": {"S": "PAUSED"},
            ":now": {"S": now}
        }
    )
    return get_automation(tenant_id, auto_id)

def list_automations(tenant_id: str):
    client = get_client()
    res = client.query(
        TableName=config.DYNAMODB_TABLE,
        KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues={
            ":pk": {"S": f"TENANT#{tenant_id}"},
            ":sk": {"S": "AUTOMATION#"}
        }
    )
    return [_parse_automation(item) for item in res.get("Items", [])]

def get_automation(tenant_id: str, auto_id: str):
    client = get_client()
    res = client.get_item(
        TableName=config.DYNAMODB_TABLE,
        Key={"PK": {"S": f"TENANT#{tenant_id}"}, "SK": {"S": f"AUTOMATION#{auto_id}"}}
    )
    if "Item" not in res:
        raise ValueError("Automation not found")
    return _parse_automation(res["Item"])

def _parse_automation(item: dict):
    return {
        "id": item.get("automationId", {}).get("S"),
        "name": item.get("name", {}).get("S"),
        "description": item.get("description", {}).get("S", ""),
        "status": item.get("status", {}).get("S"),
        "version": int(item.get("version", {}).get("N", "1")),
        "trigger": json.loads(item.get("trigger", {}).get("S", "{}")),
        "conditions": json.loads(item.get("conditions", {}).get("S", "[]")),
        "actions": json.loads(item.get("actions", {}).get("S", "[]")),
        "createdAt": item.get("createdAt", {}).get("S"),
        "updatedAt": item.get("updatedAt", {}).get("S")
    }

def get_executions(tenant_id: str, limit: int = 50):
    # Executions are stored as PK = TENANT#{tenant_id}#AUTOMATION_EXECUTION, SK = TIME#{timestamp}#{exec_id}
    client = get_client()
    res = client.query(
        TableName=config.DYNAMODB_TABLE,
        KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues={
            ":pk": {"S": f"TENANT#{tenant_id}#AUTOMATION_EXECUTION"},
            ":sk": {"S": "TIME#"}
        },
        ScanIndexForward=False, # Descending (newest first)
        Limit=limit
    )
    executions = []
    for item in res.get("Items", []):
        executions.append({
            "executionId": item.get("executionId", {}).get("S"),
            "automationId": item.get("automationId", {}).get("S"),
            "automationName": item.get("automationName", {}).get("S", "Unknown"),
            "status": item.get("status", {}).get("S"),
            "triggerEvent": item.get("triggerEvent", {}).get("S"),
            "trace": json.loads(item.get("trace", {}).get("S", "[]")),
            "startedAt": item.get("startedAt", {}).get("S"),
            "completedAt": item.get("completedAt", {}).get("S")
        })
    return executions
