import datetime
import uuid
import logging
from boto3.dynamodb.conditions import Key
from core.db import get_table

logger = logging.getLogger(__name__)

def _update_conversation_record(tenant_id: str, customer_phone: str, text: str, timestamp: str, direction: str):
    """
    Updates or creates the Conversation summary record.
    Increments unreadCount only for INBOUND messages.
    """
    table = get_table()
    try:
        inc = 1 if direction == "INBOUND" else 0
        table.update_item(
            Key={
                "PK": f"TENANT#{tenant_id}",
                "SK": f"CONVERSATION#{customer_phone}"
            },
            UpdateExpression="SET customerPhone = :phone, lastMessage = :msg, lastMessageAt = :ts ADD unreadCount :inc",
            ExpressionAttributeValues={
                ":phone": customer_phone,
                ":msg": text,
                ":ts": timestamp,
                ":inc": inc
            }
        )
    except Exception as e:
        logger.error(f"Failed to update conversation record for {customer_phone}: {e}")
        raise

def persist_inbound_message(tenant_id: str, customer_phone: str, text: str, message_id: str, timestamp: str = None):
    """
    Persists an inbound message and updates the conversation summary.
    """
    if not timestamp:
        timestamp = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
        
    table = get_table()
    
    # 1. Put message record
    table.put_item(
        Item={
            "PK": f"TENANT#{tenant_id}#CONVERSATION#{customer_phone}",
            "SK": f"MESSAGE#{timestamp}#{message_id}",
            "direction": "INBOUND",
            "messageId": message_id,
            "type": "text",
            "text": text,
            "timestamp": timestamp,
            "status": "RECEIVED"
        }
    )
    
    # 2. Update conversation summary
    _update_conversation_record(tenant_id, customer_phone, text, timestamp, "INBOUND")
    
def persist_outbound_message(tenant_id: str, customer_phone: str, text: str, timestamp: str = None):
    """
    Persists an outbound message and updates the conversation summary.
    """
    if not timestamp:
        timestamp = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
        
    message_id = str(uuid.uuid4())
    table = get_table()
    
    # 1. Put message record
    table.put_item(
        Item={
            "PK": f"TENANT#{tenant_id}#CONVERSATION#{customer_phone}",
            "SK": f"MESSAGE#{timestamp}#{message_id}",
            "direction": "OUTBOUND",
            "type": "text",
            "text": text,
            "timestamp": timestamp,
            "status": "SENT"
        }
    )
    
    # 2. Update conversation summary
    _update_conversation_record(tenant_id, customer_phone, text, timestamp, "OUTBOUND")

def list_conversations(tenant_id: str):
    """
    Returns a list of conversation summaries for a tenant.
    """
    table = get_table()
    response = table.query(
        KeyConditionExpression=Key("PK").eq(f"TENANT#{tenant_id}") & Key("SK").begins_with("CONVERSATION#")
    )
    
    conversations = []
    for item in response.get("Items", []):
        phone = item.get("customerPhone")
        name = item.get("customerName", phone or "Unknown Customer")
        conversations.append({
            "id": phone,
            "customer": {
                "id": phone,
                "name": name,
                "phone": phone,
                "status": "Active"
            },
            "messages": [],
            "unreadCount": int(item.get("unreadCount", 0)),
            "updatedAt": item.get("lastMessageAt")
        })
        
    # Sort by updatedAt descending
    conversations.sort(key=lambda x: x["updatedAt"] or "", reverse=True)
    return conversations

def get_conversation_messages(tenant_id: str, customer_phone: str):
    """
    Returns the message history for a specific conversation.
    """
    table = get_table()
    response = table.query(
        KeyConditionExpression=Key("PK").eq(f"TENANT#{tenant_id}#CONVERSATION#{customer_phone}") & Key("SK").begins_with("MESSAGE#")
    )
    
    messages = []
    for item in response.get("Items", []):
        status_val = item.get("status", "sent").lower()
        if status_val == "received":
            status_val = "read" # For inbound messages, no status icon usually, or read

        messages.append({
            "id": item.get("SK").split("#")[-1],
            "content": item.get("text"),
            "timestamp": item.get("timestamp"),
            "sender": "wbos" if item.get("direction") == "OUTBOUND" else "customer",
            "status": status_val
        })
        
    # Sort messages chronologically
    messages.sort(key=lambda x: x["timestamp"])

    return {
        "id": customer_phone,
        "customer": {
            "id": customer_phone,
            "name": customer_phone,
            "phone": customer_phone,
            "status": "Active"
        },
        "messages": messages
    }
