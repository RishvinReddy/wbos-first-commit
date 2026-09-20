import os
import json
import logging
import boto3
from services.whatsapp import send_whatsapp_text_message
from services.conversations import persist_outbound_message, persist_outbound_failure

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

STATUS_MESSAGES = {
    "OrderConfirmed": "Your order {order_id} is confirmed! We'll start preparing it shortly.",
    "OrderPreparationStarted": "We've started preparing your order {order_id}.",
    "OrderPreparationCompleted": "Your order {order_id} is ready for dispatch.",
    "OrderDispatched": "Your order {order_id} is out for delivery!",
    "OrderDelivered": "Your order {order_id} has been delivered. Enjoy!",
    "OrderCancelled": "Your order {order_id} has been cancelled."
}

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
                if wamid:
                    persist_outbound_message(tenant_id, customer_phone, message, wamid)
                else:
                    persist_outbound_failure(tenant_id, customer_phone, message, "Meta WhatsApp API rejected the outbound message")
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
                if wamid:
                    persist_outbound_message(tenant_id, customer_phone, message, wamid)
                else:
                    persist_outbound_failure(tenant_id, customer_phone, message, "Meta WhatsApp API rejected the outbound message")
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

                if wamid:
                    persist_outbound_message(
                        tenant_id,
                        customer_phone,
                        message,
                        wamid
                    )
                    logger.info(
                        f"Outbound WhatsApp message persisted for {customer_phone}"
                    )
                else:
                    persist_outbound_failure(
                        tenant_id,
                        customer_phone,
                        message,
                        "Meta WhatsApp API rejected the outbound message"
                    )
                    logger.warning(f"Persisted outbound failure for {customer_phone}")

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

    elif event_type in STATUS_MESSAGES:
        order_id = data.get("orderId")
        customer_phone = data.get("customerPhone")

        if customer_phone and tenant_id:
            message = STATUS_MESSAGES[event_type].format(order_id=order_id)
            try:
                wamid = send_whatsapp_text_message(customer_phone, message)
                if wamid:
                    persist_outbound_message(tenant_id, customer_phone, message, wamid)
                else:
                    persist_outbound_failure(tenant_id, customer_phone, message, "Meta WhatsApp API rejected the outbound message")
            except Exception as e:
                logger.error(f"Failed to send/persist WhatsApp message for {event_type}: {e}")
        else:
            logger.warning(f"Missing customerPhone or tenantId in {event_type} event for order {order_id}")

    return {"status": "success"}
