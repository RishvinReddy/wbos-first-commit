import os
import json
import logging
import boto3
from services.whatsapp import send_whatsapp_text_message

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Handles EventBridge InvoiceGenerated and other notification events.
    """
    logger.info(f"Received event: {json.dumps(event)}")

    detail = event.get("detail", {})
    event_type = detail.get("eventType")
    data = detail.get("data", {})

    if event_type == "InvoiceGenerated":
        order_id = data.get("orderId")
        invoice_url = data.get("invoiceUrl")
        customer_phone = data.get("customerPhone")

        if customer_phone:
            message = f"Your order {order_id} has been confirmed!\nDownload your invoice here: {invoice_url}"
            send_whatsapp_text_message(customer_phone, message)
        else:
            logger.warning(f"No customerPhone provided in InvoiceGenerated event for order {order_id}")

    elif event_type == "OrderCreated":
        order_id = data.get("orderId")
        customer_phone = data.get("customerPhone")

        if customer_phone:
            message = f"We have received your order {order_id}. We will process it shortly!"
            send_whatsapp_text_message(customer_phone, message)
        else:
            logger.warning(f"No customerPhone provided in OrderCreated event for order {order_id}")

    elif event_type == "LowStockDetected":
        # Alert the owner
        product_id = data.get("productId")
        logger.warning(f"Low stock detected for {product_id}. Skipping WhatsApp alert until Tenant Config is implemented.")

    return {"status": "success"}
