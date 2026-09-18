import json
import logging
from core.auth import ExecutionContext
from core.execution import execute_message

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Processes incoming messages from SQS queue.
    Invokes Intent Engine -> DB -> EventBridge
    """
    for record in event.get('Records', []):
        try:
            body = json.loads(record['body'])

            tenant_id = body.get('tenant_id')
            actor_id = body.get('actor_id')
            role = body.get('role')
            channel = body.get('channel')
            customer_phone = body.get('customer_phone')
            message_text = body.get('message_text')
            message_id = body.get('message_id')
            req_id = body.get('req_id')

            logger.info(json.dumps({
                "action": "execution_started",
                "messageId": message_id,
                "requestId": req_id
            }))

            exec_context = ExecutionContext(
                tenant_id=tenant_id,
                actor_id=actor_id,
                role=role,
                channel=channel
            )

            # Note: We pass customer_phone so business logic can use it for order creation
            # We can attach it to the exec_context temporarily for L4
            exec_context.customer_phone = customer_phone

            # Shared WBOS execution pipeline
            result = execute_message(exec_context, message_text, message_id, req_id)

            logger.info(json.dumps({
                "action": "execution_completed",
                "messageId": message_id,
                "result": result
            }))

        except Exception as e:
            logger.error(json.dumps({
                "action": "execution_failed",
                "error": str(e),
                "record": record
            }))
            # Raise exception to trigger SQS retry / DLQ
            raise e
