import datetime
import uuid
from core.db import get_client, config
from core import events

def create_support_ticket(tenant_id: str, customer_phone: str, customer_id: str = "UNKNOWN"):
    """
    Creates a support ticket in DynamoDB and emits an EventBridge event.
    """
    client = get_client()
    ticket_id = f"SUP_{uuid.uuid4().hex[:6].upper()}"
    now = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
    
    ticket_item = {
        "PK": {"S": f"TENANT#{tenant_id}#TICKET#{ticket_id}"},
        "SK": {"S": "META"},
        "GSI1PK": {"S": f"TENANT#{tenant_id}#CUS#{customer_id}"},
        "GSI1SK": {"S": f"TICKET#{now}#{ticket_id}"},
        "entityType": {"S": "SUPPORT_TICKET"},
        "tenantId": {"S": tenant_id},
        "ticketId": {"S": ticket_id},
        "customerPhone": {"S": customer_phone},
        "customerId": {"S": customer_id},
        "status": {"S": "OPEN"},
        "createdAt": {"S": now}
    }
    
    client.put_item(
        TableName=config.DYNAMODB_TABLE,
        Item=ticket_item
    )
    
    events.publish(
        event_type="SupportTicketCreated",
        tenant_id=tenant_id,
        source="wbos.support",
        data={
            "ticketId": ticket_id,
            "customerPhone": customer_phone,
            "status": "OPEN"
        }
    )
    
    return ticket_id

def get_faq_response(tenant_id: str) -> str:
    """
    Returns deterministic FAQ text.
    """
    return (
        "Here are some frequently asked questions:\n\n"
        "1. What are your delivery hours?\n"
        "   - We deliver from 8 AM to 8 PM daily.\n\n"
        "2. Do you charge for delivery?\n"
        "   - Delivery is free for orders over $50.\n\n"
        "3. How do I cancel an order?\n"
        "   - You can cancel via WhatsApp by selecting 'Cancel an order' from the main menu."
    )
