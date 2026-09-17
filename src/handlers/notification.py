import os
import json
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# In a real system, we'd use secrets manager for the Meta Token
# For MVP, we'll assume it's in the environment or fetched from SecretsManager

def send_whatsapp_message(to_phone: str, text: str):
    """
    Mocks sending a WhatsApp message via Meta Cloud API.
    """
    logger.info(f"Sending WhatsApp to {to_phone}: {text}")
    # mock implementation
    return True

def lambda_handler(event, context):
    """
    Handles EventBridge InvoiceGenerated and other notification events.
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    detail = event.get("detail", {})
    event_type = detail.get("eventType")
    data = detail.get("data", {})
    
    # In a real app we'd query the DB to get the customer's phone number based on customerId
    # For MVP vertical slice we hardcode the target phone
    target_phone = "+919347761153"
    
    if event_type == "InvoiceGenerated":
        order_id = data.get("orderId")
        invoice_url = data.get("invoiceUrl")
        
        message = f"Your order {order_id} has been confirmed!\nDownload your invoice here: {invoice_url}"
        send_whatsapp_message(target_phone, message)
        
    elif event_type == "OrderCreated":
        # Additional order confirmation if needed, but usually we just send invoice
        pass
        
    elif event_type == "LowStockDetected":
        # Alert the owner
        product_id = data.get("productId")
        owner_phone = "+919347761153"
        message = f"ALERT: Product {product_id} is running low on stock."
        send_whatsapp_message(owner_phone, message)
    
    return {"status": "success"}
