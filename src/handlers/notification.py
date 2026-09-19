import os
import json
import logging
import boto3
from services.whatsapp import send_whatsapp_text_message
from services.conversations import persist_outbound_message

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

    tenant_id = detail.get("tenantId")

    if event_type == "InvoiceGenerated":
        order_id = data.get("orderId")
        invoice_url = data.get("invoiceUrl")
        customer_phone = data.get("customerPhone")

        if customer_phone and tenant_id:
            message = f"Your order {order_id} has been confirmed!\nDownload your invoice here: {invoice_url}"
            try:
                wamid = send_whatsapp_text_message(customer_phone, message)
                if not wamid:
                    raise RuntimeError("Meta WhatsApp API rejected the outbound message")
                persist_outbound_message(tenant_id, customer_phone, message, wamid)
            except Exception as e:
                logger.error(f"Failed to send/persist WhatsApp message: {e}")
        else:
            logger.warning(f"Missing customerPhone or tenantId in InvoiceGenerated event for order {order_id}")

    elif event_type == "OrderCreated":
        order_id = data.get("orderId")
        customer_phone = data.get("customerPhone")

        if customer_phone and tenant_id:
            message = f"We have received your order {order_id}. We will process it shortly!"
            try:
                wamid = send_whatsapp_text_message(customer_phone, message)
                if not wamid:
                    raise RuntimeError("Meta WhatsApp API rejected the outbound message")
                persist_outbound_message(tenant_id, customer_phone, message, wamid)
            except Exception as e:
                logger.error(f"Failed to send/persist WhatsApp message: {e}")
        else:
            logger.warning(f"Missing customerPhone or tenantId in OrderCreated event for order {order_id}")

    elif event_type == "LowStockDetected":
        # Alert the owner
        product_id = data.get("productId")
        logger.warning(f"Low stock detected for {product_id}. Skipping WhatsApp alert until Tenant Config is implemented.")

    elif event_type == "CustomerReplyRequested":
        customer_phone = data.get("customerPhone")
        message = data.get("message")

        if customer_phone and message and tenant_id:
            try:
                wamid = send_whatsapp_text_message(
                    customer_phone,
                    message
                )

                if not wamid:
                    raise RuntimeError(
                        "Meta WhatsApp API rejected the outbound message"
                    )

                persist_outbound_message(
                    tenant_id,
                    customer_phone,
                    message,
                    wamid
                )

                logger.info(
                    f"Outbound WhatsApp message persisted for {customer_phone}"
                )

            except Exception as e:
                logger.error(
                    f"Failed to send/persist WhatsApp message: {e}"
                )
                raise

        else:
            logger.warning(
                "Missing customerPhone, message, or tenantId "
                "in CustomerReplyRequested event"
            )

    return {"status": "success"}
