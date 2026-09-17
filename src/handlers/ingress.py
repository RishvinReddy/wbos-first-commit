import json
import logging
from security.webhook import verify_whatsapp_signature, InvalidSignatureError
from core.bedrock_adapter import BedrockAdapter
from core.tool_router import handle_tool_use
from core.auth import resolve_execution_context
from core.db import get_client
from core.config import config
import datetime
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Extremely thin Ingress Handler.
    API Gateway -> security -> normalization -> Bedrock -> tool router
    """
    try:
        # P6.4 Structured observability
        req_id = context.aws_request_id if context else "local"
        logger.info(json.dumps({
            "action": "webhook_received",
            "requestId": req_id
        }))

        # 1. Security: HMAC Validation
        headers = event.get("headers", {})
        signature = headers.get("x-hub-signature-256") or headers.get("X-Hub-Signature-256")
        body = event.get("body", "")
        
        # Will raise if invalid
        verify_whatsapp_signature(body, signature)
        
        # 2. Message Normalization (Parse Meta Webhook format)
        payload = json.loads(body)
        
        # Verify challenge for webhook setup
        if event.get("routeKey") == "GET /webhook" or event.get("httpMethod") == "GET":
            qs = event.get("queryStringParameters", {})
            if qs.get("hub.mode") == "subscribe" and qs.get("hub.verify_token") == "WBOS_VERIFY_TOKEN":
                return {"statusCode": 200, "body": qs.get("hub.challenge")}
                
        # Parse incoming message (simplified for vertical slice)
        # Assuming a direct text message for the MVP
        # In real WhatsApp payload, this is deeply nested
        message_text = "I need 2 kg basmati rice" # Fallback if not found properly
        customer_phone = "+919347761153"
        message_id = "mock_wamid_" + str(hash(body))
        
        try:
            entry = payload["entry"][0]
            change = entry["changes"][0]["value"]
            message = change["messages"][0]
            customer_phone = "+" + message["from"]
            message_text = message["text"]["body"]
            message_id = message["id"]
        except (KeyError, IndexError):
            # If payload is mock or malformed, continue with defaults for local testing
            pass
            
        # 2b. Identity Resolution
        context_obj = resolve_execution_context(customer_phone)
        tenant_id = context_obj.tenant_id
        customer_id = context_obj.actor_id
        
        logger.info(json.dumps({
            "action": "auth_resolved",
            "requestId": req_id,
            "tenantId": tenant_id,
            "role": context_obj.role
        }))
        
        # 3. Idempotency Check
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
                return {"statusCode": 200, "body": json.dumps({"status": "duplicate"})}
            raise
        
        # 4. Bedrock Adapter
        bedrock = BedrockAdapter()
        
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
        
        # Call Bedrock
        bedrock_response = bedrock.converse(messages, system_prompt)
        
        # 4. Tool Router
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
                    
                    # 5. Domain Service & DB
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

        # Return 200 OK to Meta to acknowledge receipt
        return {
            "statusCode": 200,
            "body": json.dumps({"status": "success", "operations": results})
        }
        
    except InvalidSignatureError as e:
        logger.warning(json.dumps({
            "action": "signature_verification_failed",
            "requestId": req_id if 'req_id' in locals() else "local",
            "error": str(e)
        }))
        return {"statusCode": 401, "body": "Unauthorized"}
    except Exception as e:
        req_id = req_id if 'req_id' in locals() else "local"
        logger.error(json.dumps({
            "action": "webhook_error",
            "requestId": req_id,
            "error": str(e)
        }))
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
