import datetime
import uuid
import logging
import json
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
    
def persist_outbound_message(tenant_id: str, customer_phone: str, text: str, meta_message_id: str = None, timestamp: str = None):
    """
    Persists an outbound message and updates the conversation summary.
    """
    if not timestamp:
        timestamp = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
        
    message_id = str(uuid.uuid4())
    table = get_table()
    
    # 1. Put message record
    item = {
        "PK": f"TENANT#{tenant_id}#CONVERSATION#{customer_phone}",
        "SK": f"MESSAGE#{timestamp}#{message_id}",
        "direction": "OUTBOUND",
        "type": "text",
        "text": text,
        "timestamp": timestamp,
        "status": "SENT"
    }
    if meta_message_id:
        item["metaMessageId"] = meta_message_id
        
    table.put_item(Item=item)
    
    # 2. Update conversation summary
    _update_conversation_record(tenant_id, customer_phone, text, timestamp, "OUTBOUND")

def persist_outbound_failure(tenant_id: str, customer_phone: str, text: str, error_title: str, timestamp: str = None):
    """
    Persists an outbound message attempt that immediately failed at the API layer.
    """
    if not timestamp:
        timestamp = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
        
    message_id = str(uuid.uuid4())
    table = get_table()
    
    item = {
        "PK": f"TENANT#{tenant_id}#CONVERSATION#{customer_phone}",
        "SK": f"MESSAGE#{timestamp}#{message_id}",
        "direction": "OUTBOUND",
        "type": "text",
        "text": text,
        "timestamp": timestamp,
        "status": "FAILED",
        "metaErrorTitle": error_title
    }
        
    table.put_item(Item=item)
    
    # Update conversation summary so the failed message shows up as latest
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
            "status": status_val,
            "errorTitle": item.get("metaErrorTitle"),
            "errorCode": item.get("metaErrorCode")
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

def update_message_status_by_meta_id(tenant_id: str, customer_phone: str, meta_message_id: str, new_status: str, error_info: dict = None):
    """
    Updates an outbound message's status monotonically using its Meta wamid.
    """
    import boto3
    table = get_table()
    
    # Query for the message by metaMessageId using FilterExpression
    response = table.query(
        KeyConditionExpression=Key("PK").eq(f"TENANT#{tenant_id}#CONVERSATION#{customer_phone}") & Key("SK").begins_with("MESSAGE#"),
        FilterExpression=boto3.dynamodb.conditions.Attr("metaMessageId").eq(meta_message_id)
    )
    items = response.get("Items", [])
    if not items:
        logger.warning(f"Message with metaMessageId {meta_message_id} not found.")
        return
        
    msg = items[0]
    current_status = msg.get("status", "SENT")
    
    status_rank = {"SENT": 1, "DELIVERED": 2, "READ": 3, "FAILED": 99}
    curr_rank = status_rank.get(current_status, 0)
    new_rank = status_rank.get(new_status, 0)
    
    # Only advance if new_rank > curr_rank or if it's FAILED. 
    # If it's already FAILED, we might just be getting another update, ignore it unless it's new error info.
    if new_rank <= curr_rank and new_status != "FAILED":
        logger.info(f"Ignoring out-of-order status {new_status} for {meta_message_id} (current: {current_status})")
        return
        
    update_expr = "SET #st = :st, statusUpdatedAt = :ts"
    expr_names = {"#st": "status"}
    expr_vals = {
        ":st": new_status,
        ":ts": datetime.datetime.now(datetime.UTC).isoformat() + "Z"
    }
    
    if new_status == "FAILED" and error_info:
        update_expr += ", metaErrorCode = :ec, metaErrorTitle = :et"
        expr_vals[":ec"] = error_info.get("code")
        expr_vals[":et"] = error_info.get("title")
        
    table.update_item(
        Key={
            "PK": msg["PK"],
            "SK": msg["SK"]
        },
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_vals
    )
    logger.info(f"Updated status of {meta_message_id} to {new_status}")

def set_conversation_state(tenant_id: str, customer_phone: str, context: dict):
    """
    Stores conversational workflow context onto the summary record with a TTL.
    Context is serialized to JSON.
    """
    table = get_table()
    now = datetime.datetime.now(datetime.UTC)
    expires_at = int((now + datetime.timedelta(hours=2)).timestamp())
    
    update_expr = "SET pendingState = :ps, stateUpdatedAt = :ts, stateExpiresAt = :exp"
    expr_vals = {
        ":ps": json.dumps(context),
        ":ts": now.isoformat() + "Z",
        ":exp": expires_at
    }
    
    try:
        table.update_item(
            Key={
                "PK": f"TENANT#{tenant_id}",
                "SK": f"CONVERSATION#{customer_phone}"
            },
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_vals
        )
    except Exception as e:
        logger.error(f"Failed to set conversation state for {customer_phone}: {e}")

def get_conversation_state(tenant_id: str, customer_phone: str) -> dict:
    """
    Retrieves and parses the pending conversation context.
    Returns empty dict if no active state or if expired.
    """
    table = get_table()
    try:
        response = table.get_item(
            Key={
                "PK": f"TENANT#{tenant_id}",
                "SK": f"CONVERSATION#{customer_phone}"
            }
        )
        item = response.get("Item")
        if not item or "pendingState" not in item:
            return {}
            
        expires_at = item.get("stateExpiresAt", 0)
        if expires_at and expires_at < int(datetime.datetime.now(datetime.UTC).timestamp()):
            # Expired
            return {}
            
        state_json = item.get("pendingState")
        return json.loads(state_json) if state_json else {}
        
    except Exception as e:
        logger.error(f"Failed to get conversation state for {customer_phone}: {e}")
        return {}

def clear_conversation_state(tenant_id: str, customer_phone: str):
    """
    Removes the pending workflow context from the conversation record.
    """
    table = get_table()
    try:
        table.update_item(
            Key={
                "PK": f"TENANT#{tenant_id}",
                "SK": f"CONVERSATION#{customer_phone}"
            },
            UpdateExpression="REMOVE pendingState, stateUpdatedAt, stateExpiresAt"
        )
    except Exception as e:
        logger.error(f"Failed to clear conversation state for {customer_phone}: {e}")

