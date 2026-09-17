import json
import logging
import datetime
import os
from botocore.exceptions import ClientError
from core.db import get_client
from core.config import config
from core.tool_router import handle_tool_use

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def execute_message(context_obj, message_text: str, message_id: str, req_id: str):
    """
    Shared execution layer for processing a message through Bedrock and the tool router.
    Used by both the production Meta webhook and the demo simulator.
    """
    tenant_id = context_obj.tenant_id
    
    # 1. Idempotency Check
    client = get_client()
    now = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
    try:
        client.put_item(
            TableName=config.DYNAMODB_TABLE,
            Item={
                "PK": {"S": f"IDEMPOTENCY#{tenant_id}"},
                "SK": {"S": f"MESSAGE#{message_id}"},
                "status": {"S": "PROCESSED"},
                "createdAt": {"S": now}
            },
            ConditionExpression="attribute_not_exists(PK)"
        )
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            logger.info(json.dumps({
                "action": "duplicate_message",
                "requestId": req_id,
                "messageId": message_id
            }))
            return {"status": "duplicate"}
        raise
    
    # 2. Adapter Selection
    execution_mode = os.environ.get("WBOS_EXECUTION_MODE", "live").lower()
    
    if execution_mode == "live":
        from core.bedrock_adapter import BedrockAdapter
        adapter = BedrockAdapter()
        logger.info(json.dumps({"action": "execution_mode", "mode": "live", "requestId": req_id}))
    else:
        from core.demo_adapter import DemoAdapter
        adapter = DemoAdapter()
        logger.info(json.dumps({"action": "execution_mode", "mode": "demo", "requestId": req_id}))
    
    # Construct conversational history
    messages = [{
        "role": "user",
        "content": [{"text": message_text}]
    }]
    
    system_prompt = (
        f"You are WBOS. You are talking to a user with role {context_obj.role}. "
        "Use the provided tools to search products, check inventory, and create orders. "
        "If they are an OWNER, you can use analytics tools to summarize store performance. "
        "Never make up prices or stock."
    )
    
    # Call Adapter
    bedrock_response = adapter.converse(messages, system_prompt)
    
    # 3. Tool Router
    # Bedrock response might contain toolUse blocks
    results = []
    if "content" in bedrock_response:
        for block in bedrock_response["content"]:
            if "toolUse" in block:
                tool_use = block["toolUse"]
                logger.info(json.dumps({
                    "action": "tool_routing",
                    "requestId": req_id,
                    "tool": tool_use["name"]
                }))
                
                # 4. Domain Service & DB
                result = handle_tool_use(context_obj, tool_use)
                results.append({
                    "tool": tool_use["name"],
                    "result": result
                })
                
    logger.info(json.dumps({
        "action": "bedrock_processed",
        "requestId": req_id,
        "tenantId": tenant_id,
        "status": "success"
    }))
    
    return {"status": "success", "operations": results}
