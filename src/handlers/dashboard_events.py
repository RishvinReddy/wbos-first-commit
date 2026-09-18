import json
import logging
import datetime
import uuid
from core.db import get_client, config

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Dashboard Event Consumer
    Listens to ALL EventBridge events matching source wbos.*
    and persists them to DynamoDB for the Web Command Center event stream.
    """
    try:
        source = event.get("source", "unknown")
        event_type = event.get("detail-type", "UnknownEvent")
        detail = event.get("detail", {})
        tenant_id = detail.get("tenantId")

        if not tenant_id:
            logger.warning(f"Event {event_type} missing tenantId. Skipping.")
            return

        timestamp = event.get("time", datetime.datetime.now(datetime.UTC).isoformat() + "Z")
        event_id = event.get("id", str(uuid.uuid4()))

        client = get_client()

        # PK = TENANT#{tenant_id}#EVENTS
        # SK = TIME#{timestamp}#{event_id}
        client.put_item(
            TableName=config.DYNAMODB_TABLE,
            Item={
                "PK": {"S": f"TENANT#{tenant_id}#EVENTS"},
                "SK": {"S": f"TIME#{timestamp}#{event_id}"},
                "entityType": {"S": "EVENT"},
                "tenantId": {"S": tenant_id},
                "eventType": {"S": event_type},
                "source": {"S": source},
                "timestamp": {"S": timestamp},
                "data": {"S": json.dumps(detail.get("data", {}))}
            }
        )

        logger.info(f"Persisted event {event_type} for tenant {tenant_id}")
        return {"status": "success"}

    except Exception as e:
        logger.error(f"Error persisting event: {e}")
        raise
