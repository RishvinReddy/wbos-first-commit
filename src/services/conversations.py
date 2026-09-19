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
        conversations.append({
            "id": item.get("customerPhone"),
            "customerPhone": item.get("customerPhone"),
            "customerName": item.get("customerName"),
            "lastMessage": item.get("lastMessage"),
            "lastMessageAt": item.get("lastMessageAt"),
            "unreadCount": int(item.get("unreadCount", 0))
        })
        
    # Sort by lastMessageAt descending
    conversations.sort(key=lambda x: x["lastMessageAt"], reverse=True)
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
        messages.append({
            "id": item.get("SK").split("#")[-1],
            "direction": item.get("direction"),
            "type": item.get("type"),
            "text": item.get("text"),
            "timestamp": item.get("timestamp"),
            "status": item.get("status")
        })
        
    return {
        "id": customer_phone,
        "customerPhone": customer_phone,
        "messages": messages
    }
