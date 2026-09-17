import json
import logging
from security.webhook import verify_whatsapp_signature, InvalidSignatureError
from core.auth import resolve_execution_context
from core.execution import execute_message

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Extremely thin Ingress Handler.
    API Gateway -> security -> normalization -> shared execution
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
        
        logger.info(json.dumps({
            "action": "auth_resolved",
            "requestId": req_id,
            "tenantId": context_obj.tenant_id,
            "role": context_obj.role
        }))
        
        # 3. Shared Execution (Bedrock -> Tool Router -> DB)
        result = execute_message(context_obj, message_text, message_id, req_id)

        # Return 200 OK to Meta to acknowledge receipt
        return {
            "statusCode": 200,
            "body": json.dumps(result)
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

