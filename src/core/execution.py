import json
import logging
import datetime
import os
from botocore.exceptions import ClientError
from core.db import get_client
from core.config import config
from core import events

from intent.classifier import IntentClassifier
from intent.intents import Intent
from services.products import search_products
from services.orders import create_order

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def execute_message(context_obj, message_text: str, message_id: str, req_id: str):
    """
    Shared execution layer for processing a message through the Intent Engine.
    """
    tenant_id = context_obj.tenant_id

    # 1. Idempotency Check
    client = get_client()
    now = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
    try:
        client.put_item(
            TableName=config.DYNAMODB_TABLE,
            Item={
                "PK": {"S": f"IDEMPOTENCY#{tenant_id}"},
                "SK": {"S": f"MESSAGE#{message_id}"},
                "status": {"S": "PROCESSED"},
                "createdAt": {"S": now}
            },
            ConditionExpression="attribute_not_exists(PK)"
        )
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            logger.info(json.dumps({
                "action": "duplicate_message",
                "requestId": req_id,
                "messageId": message_id
            }))
            return {"status": "duplicate"}
        raise

    logger.info(json.dumps({"action": "execution_mode", "mode": "intent_engine", "requestId": req_id}))

    classifier = IntentClassifier()
    result = classifier.classify(message_text)
    
    logger.info(json.dumps({
        "action": "intent_classified",
        "intent": result.intent.value,
        "entities": result.entities,
        "requestId": req_id
    }))

    reply_message = "I'm sorry, I couldn't process your request."

    try:
        if result.intent in (Intent.ORDER_TRACKING, Intent.ORDER_STATUS):
            order_id = result.entities.get("order_id")
            if order_id:
                reply_message = f"Your order {order_id} is currently Out for Delivery.\nExpected delivery: Today."
            else:
                reply_message = "Your latest order is currently Out for Delivery.\nExpected delivery: Today."

        elif result.intent == Intent.ORDER_HISTORY:
            reply_message = "You have no recent orders."

        elif result.intent == Intent.PRODUCT_LOOKUP:
            product = result.entities.get("product")
            if product:
                matches = search_products(tenant_id, query=product, limit=1)
                if matches:
                    p = matches[0]
                    reply_message = f"{p['name']}\nPrice: ₹{p['price']}\nAvailability: {'In stock' if p['stock'] > 0 else 'Out of stock'}"
                else:
                    reply_message = f"Sorry, I couldn't find a product matching '{product}'."
            else:
                reply_message = "What product are you looking for?"

        elif result.intent == Intent.INVENTORY_CHECK:
            product = result.entities.get("product")
            if product:
                matches = search_products(tenant_id, query=product, limit=1)
                if matches:
                    p = matches[0]
                    reply_message = f"Yes, {p['name']} is currently {'in stock' if p['stock'] > 0 else 'out of stock'}.\nAvailable: {p['stock']} units"
                else:
                    reply_message = f"Sorry, I couldn't find a product matching '{product}'."
            else:
                reply_message = "What product are you looking for?"

        elif result.intent == Intent.CREATE_ORDER:
            product = result.entities.get("product")
            qty = result.entities.get("quantity", "1")
            if product:
                matches = search_products(tenant_id, query=product, limit=1)
                if matches:
                    p = matches[0]
                    try:
                        create_order(
                            tenant_id=tenant_id,
                            customer_id=context_obj.actor_id,
                            customer_phone=getattr(context_obj, "customer_phone", context_obj.actor_id),
                            items=[{"productId": p["productId"], "quantity": float(qty)}],
                            delivery_address="Default Delivery Address"
                        )
                        reply_message = f"Your order for {qty} x {p['name']} has been placed successfully."
                    except ValueError as e:
                        reply_message = f"Sorry, unable to place order: {str(e)}"
                else:
                    reply_message = f"Sorry, I couldn't find a product matching '{product}'."
            else:
                reply_message = "Sure. What would you like to order?"

        elif result.intent == Intent.CANCEL_ORDER:
            order_id = result.entities.get("order_id")
            if order_id:
                reply_message = f"Order {order_id} has been cancelled successfully."
            else:
                reply_message = "Please specify the order ID to cancel."

        elif result.intent == Intent.INVOICE_REQUEST:
            reply_message = "Your latest invoice will be sent to your email."

        elif result.intent == Intent.STORE_HOURS:
            reply_message = "Our store is open from 9:00 AM to 9:00 PM every day."

        elif result.intent == Intent.GREETING:
            reply_message = (
                "Hi! Welcome to WBOS.\n\n"
                "I can help you with:\n"
                "• Track an order\n"
                "• View order history\n"
                "• Check product prices\n"
                "• Check inventory\n"
                "• Place an order\n"
                "• Cancel an order\n"
                "• Get an invoice\n\n"
                "What would you like to do?"
            )

        elif result.intent in (Intent.HELP, Intent.UNKNOWN):
            reply_message = (
                "I can help you with:\n"
                "• Track an order\n"
                "• View order history\n"
                "• Check product prices\n"
                "• Check inventory\n"
                "• Place an order\n"
                "• Cancel an order\n"
                "• Get an invoice\n\n"
                "Reply with what you'd like to do."
            )
            
    except Exception as e:
        logger.error(f"Error executing intent: {str(e)}")
        reply_message = "Sorry, I encountered an error while processing your request."

    # Emit CustomerReplyRequested event to EventBridge
    customer_phone = getattr(context_obj, "customer_phone", context_obj.actor_id)
    if customer_phone:
        events.publish(
            event_type="CustomerReplyRequested",
            tenant_id=tenant_id,
            source="wbos.execution",
            data={
                "customerPhone": customer_phone,
                "message": reply_message
            }
        )
        logger.info(f"Published CustomerReplyRequested for {customer_phone}")
    else:
        logger.warning("No customer phone found to send reply.")

    logger.info(json.dumps({
        "action": "intent_processed",
        "requestId": req_id,
        "tenantId": tenant_id,
        "status": "success"
    }))

    return {"status": "success", "intent": result.intent.value}
