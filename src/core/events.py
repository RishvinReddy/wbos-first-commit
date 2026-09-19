import os
import json
import uuid
import datetime
import logging
from typing import Dict, Any
from .config import config

logger = logging.getLogger(__name__)

# EventBridge client initialized globally for reuse in Lambda environment
import boto3
_events_client = None

def get_events_client():
    global _events_client
    if _events_client is None:
        _events_client = boto3.client("events", region_name=config.AWS_REGION)
    return _events_client

def publish(event_type: str, tenant_id: str, data: Dict[str, Any], source: str, automation_depth: int = 0):
    """
    Publishes an event to the WBOS EventBridge Event Bus.
    Constructs the standard Event Envelope.
    """
    event_bus = os.environ.get("EVENT_BUS_NAME", "wbos-events")
    now = datetime.datetime.now(datetime.UTC).isoformat() + "Z"

    envelope = {
        "eventId": str(uuid.uuid4()),
        "eventType": event_type,
        "version": "1.0",
        "tenantId": tenant_id,
        "timestamp": now,
        "source": source,
        "automation_depth": automation_depth,
        "data": data
    }

    try:
        client = get_events_client()
        response = client.put_events(
            Entries=[
                {
                    "Source": source,
                    "DetailType": event_type,
                    "Detail": json.dumps(envelope),
                    "EventBusName": event_bus
                }
            ]
        )
        if response.get("FailedEntryCount", 0) > 0:
            logger.error(f"Failed to publish event {event_type}: {response}")
        else:
            logger.info(f"Successfully published {event_type} event to {event_bus}")
    except Exception as e:
        logger.error(f"Error publishing event {event_type}: {e}")
        # In MVP, log failure and continue so the transaction succeeds.
        # In a real system, we would use the Outbox Pattern.
