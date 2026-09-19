import json
import logging
import boto3
import urllib.parse
from botocore.exceptions import ClientError
from security.webhook import verify_whatsapp_signature, InvalidSignatureError
from core.auth import resolve_execution_context
from core.config import config, get_meta_secrets
from core.db import get_table
from services.conversations import persist_inbound_message

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

sqs = boto3.client('sqs', region_name=config.AWS_REGION)

def lambda_handler(event, context):
    """
    Ingress Handler for Meta Webhooks.
    API Gateway -> security -> normalization -> SQS ExecutionQueue
    """
    try:
        req_id = context.aws_request_id if context else "local"
        logger.info(json.dumps({
            "action": "webhook_received",
            "requestId": req_id
        }))

        # 1. Handle Webhook Verification (GET)
        if event.get("routeKey") == "GET /webhook" or event.get("httpMethod") == "GET":
            qs = event.get("queryStringParameters", {})
            secrets = get_meta_secrets()
            verify_token = secrets.get("META_VERIFY_TOKEN")

            if qs.get("hub.mode") == "subscribe" and qs.get("hub.verify_token") == verify_token:
                logger.info("Webhook verification successful")
                return {"statusCode": 200, "body": qs.get("hub.challenge")}
            return {"statusCode": 403, "body": "Verification failed"}

        # 2. Handle Message (POST)
        headers = event.get("headers", {})
        # API Gateway converts headers to lowercase in HTTP APIs
        signature = headers.get("x-hub-signature-256") or headers.get("X-Hub-Signature-256")
        body = event.get("body", "")

        # If API Gateway passes base64 encoded body
        if event.get("isBase64Encoded"):
            import base64
            body = base64.b64decode(body).decode('utf-8')

        # Will raise if invalid
        verify_whatsapp_signature(body, signature)

        # 3. Message Normalization (Parse Meta Webhook format)
        payload = json.loads(body)

        # Meta might batch changes
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})

                # Check if it is a message event
                if "messages" in value:
                    for message in value["messages"]:
                        # Only process text messages for now
                        if message.get("type") == "text":
                            customer_phone = "+" + message.get("from", "")
                            message_text = message["text"]["body"]
                            message_id = message.get("id")

                            # Resolve Identity
                            context_obj = resolve_execution_context(customer_phone)
                            tenant_id = context_obj.tenant_id

                            logger.info(json.dumps({
                                "action": "auth_resolved",
                                "requestId": req_id,
                                "tenantId": tenant_id,
                                "role": context_obj.role
                            }))

                            # 4. Idempotency Check
                            table = get_table()
                            try:
                                table.put_item(
                                    Item={
                                        "PK": f"TENANT#{tenant_id}#MESSAGE#{message_id}",
                                        "SK": "META",
                                        "phone": customer_phone,
                                        "text": message_text
                                    },
                                    ConditionExpression="attribute_not_exists(PK)"
                                )
                            except ClientError as e:
                                if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                                    logger.info(f"Duplicate message ignored: {message_id}")
                                    continue
                                else:
                                    raise

                            # 4.5. Persist Conversation History
                            try:
                                persist_inbound_message(tenant_id, customer_phone, message_text, message_id)
                            except Exception as e:
                                logger.error(f"Failed to persist inbound message {message_id}: {e}")
                                # Continue execution even if persistence fails to avoid dropping the webhook processing

                            # 5. Push to ExecutionQueue
                            queue_url = config.EXECUTION_QUEUE_URL
                            if queue_url:
                                sqs.send_message(
                                    QueueUrl=queue_url,
                                    MessageBody=json.dumps({
                                        "tenant_id": context_obj.tenant_id,
                                        "actor_id": context_obj.actor_id,
                                        "role": context_obj.role,
                                        "channel": context_obj.channel,
                                        "customer_phone": customer_phone,
                                        "message_text": message_text,
                                        "message_id": message_id,
                                        "req_id": req_id
                                    })
                                )
                                logger.info(f"Message {message_id} queued for execution")
                            else:
                                logger.warning("EXECUTION_QUEUE_URL not set")

        # Return 200 OK to Meta to acknowledge receipt immediately
        return {
            "statusCode": 200,
            "body": "OK"
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
        return {"statusCode": 500, "body": json.dumps({"error": "Internal Error"})}
