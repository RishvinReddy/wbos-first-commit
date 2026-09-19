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
from services.products import search_products, list_products
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

    MENU_TEXT = (
        "What can I help you with?\n\n"
        "ORDERS\n"
        "1. 📦 Track an order\n"
        "2. 🛒 Place an order\n"
        "3. ❌ Cancel an order\n"
        "4. 🧾 View order history\n"
        "5. 🔄 Reorder a previous order\n\n"
        "PRODUCTS\n"
        "6. 💰 Check product prices\n"
        "7. 📊 Check inventory\n"
        "8. 📋 View product catalog\n"
        "9. 🔎 Search for a product\n"
        "10. 📋 View product details\n"
        "11. 🏷️ Check available offers\n\n"
        "PAYMENTS & DOCUMENTS\n"
        "12. 💳 Check payment status\n"
        "13. 📄 Get an invoice\n"
        "14. 🧾 View billing details\n\n"
        "ACCOUNT\n"
        "15. 👤 View account details\n"
        "16. ⚙️ Account settings\n"
        "17. 🔐 Security & login help\n\n"
        "SUPPORT\n"
        "18. 🆘 Get help\n"
        "19. 💬 Contact support\n"
        "20. ❓ Frequently asked questions\n\n"
        "SYSTEM\n"
        "21. 🏠 Main menu\n"
        "22. 🔙 Go back\n"
        "23. ❌ Exit\n\n"
        "Reply with a number or type what you need.\n\n"
        "Examples:\n"
        "1 → Track an order\n"
        "8 → View product catalog\n"
        "18 → Get help\n"
        "23 → Exit"
    )

    handled_menu_selection = False
    if result.intent == Intent.MENU_SELECTION:
        option = result.entities.get("option")
        route_map = {
            "1": Intent.ORDER_TRACKING,
            "2": Intent.CREATE_ORDER,
            "3": Intent.CANCEL_ORDER,
            "4": Intent.ORDER_HISTORY,
            "6": Intent.PRODUCT_LOOKUP,
            "7": Intent.INVENTORY_CHECK,
            "8": Intent.CATALOG,
            "13": Intent.INVOICE_REQUEST,
            "18": Intent.HELP,
            "21": Intent.HELP,
            "22": Intent.HELP
        }
        if option in route_map:
            result.intent = route_map[option]
        elif option == "23":
            reply_message = "Thank you for using WBOS! Have a great day."
            handled_menu_selection = True
        else:
            titles = {
                "5": "🔄 Reorder a previous order",
                "9": "🔎 Search for a product",
                "10": "📋 View product details",
                "11": "🏷️ Check available offers",
                "12": "💳 Check payment status",
                "14": "🧾 View billing details",
                "15": "👤 View account details",
                "16": "⚙️ Account settings",
                "17": "🔐 Security & login help",
                "19": "💬 Contact support",
                "20": "❓ Frequently asked questions"
            }
            if option in titles:
                reply_message = (
                    f"**{titles[option]}**\n"
                    "This capability is planned for a future WBOS release.\n"
                    "For now, I can help with orders, products, inventory, invoices, and tracking."
                )
                handled_menu_selection = True
            else:
                result.intent = Intent.UNKNOWN

    if handled_menu_selection:
        pass
    else:
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

            elif result.intent == Intent.CATALOG:
                products = list_products(tenant_id)
                if products:
                    lines = ["📋 Product Catalog\n"]
                    for i, p in enumerate(products, 1):
                        status_str = "In stock" if p['stock'] > 0 else "Out of stock"
                        lines.append(f"{i}. {p['name']} — ₹{p['price']} — {status_str}")
                    lines.append("\nReply with a product name to see more details,\nor tell me what you'd like to order.")
                    reply_message = "\n".join(lines)
                else:
                    reply_message = "The product catalog is currently empty."

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
                            reply_message = f"✅ Your order for **{qty} × {p['name']}** has been placed successfully."
                        except ValueError as e:
                            reply_message = f"Sorry, unable to place order: {str(e)}"
                    else:
                        reply_message = f"Sorry, I couldn't find a product matching '{product}'."
                else:
                    reply_message = "🛒 Sure. What would you like to order?\nExample: `Maggie noodles 2 packets`"

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
                reply_message = f"Hi! Welcome to WBOS.\n\n{MENU_TEXT}"

            elif result.intent in (Intent.HELP, Intent.UNKNOWN):
                reply_message = MENU_TEXT
                
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
