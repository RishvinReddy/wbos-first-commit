import json
import logging
import datetime
import os
import re
from botocore.exceptions import ClientError
from core.db import get_client
from core.config import config
from core import events

from intent.classifier import IntentClassifier
from intent.intents import Intent
from services.products import list_products
from services.resolver import ProductResolver
from services.orders import create_order, cancel_customer_order, get_customer_orders
from services.conversations import get_conversation_state, set_conversation_state, clear_conversation_state
from services.support import create_support_ticket, get_faq_response
from services.billing import get_payment_status, get_billing_details, get_invoice_link
from services.customers import get_account_details, get_account_settings, get_security_help

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def execute_message(context_obj, message_text: str, message_id: str, req_id: str):
    """
    Shared execution layer for processing a message through the Intent Engine.
    Orchestrates business services based on intent and conversational state.
    """
    tenant_id = context_obj.tenant_id
    customer_phone = getattr(context_obj, "customer_phone", context_obj.actor_id)
    customer_id = context_obj.actor_id

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
    state = get_conversation_state(tenant_id, customer_phone)
    
    logger.info(json.dumps({
        "action": "intent_classified",
        "intent": result.intent.value,
        "entities": result.entities,
        "requestId": req_id,
        "has_state": bool(state)
    }))

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
        "8. 🔎 Search for a product\n"
        "9. 📋 View product details\n"
        "10. 🏷️ Check available offers\n\n"
        "PAYMENTS & DOCUMENTS\n"
        "11. 💳 Check payment status\n"
        "12. 📄 Get an invoice\n"
        "13. 🧾 View billing details\n\n"
        "ACCOUNT\n"
        "14. 👤 View account details\n"
        "15. ⚙️ Account settings\n"
        "16. 🔐 Security & login help\n\n"
        "SUPPORT\n"
        "17. 🆘 Get help\n"
        "18. 💬 Contact support\n"
        "19. ❓ Frequently asked questions\n\n"
        "SYSTEM\n"
        "20. 🏠 Main menu\n"
        "21. 🔙 Go back\n"
        "22. ❌ Exit\n\n"
        "Reply with a number or type what you need."
    )

    if result.intent == Intent.MENU_SELECTION:
        option = result.entities.get("option")
        route_map = {
            "1": Intent.ORDER_TRACKING,
            "2": Intent.CREATE_ORDER,
            "3": Intent.CANCEL_ORDER,
            "4": Intent.ORDER_HISTORY,
            "5": Intent.REORDER,
            "6": Intent.PRODUCT_LOOKUP,
            "7": Intent.INVENTORY_CHECK,
            "8": Intent.PRODUCT_SEARCH,
            "9": Intent.PRODUCT_DETAILS,
            "10": Intent.OFFERS,
            "11": Intent.PAYMENT_STATUS,
            "12": Intent.INVOICE_REQUEST,
            "13": Intent.BILLING_DETAILS,
            "14": Intent.ACCOUNT_DETAILS,
            "15": Intent.ACCOUNT_SETTINGS,
            "16": Intent.SECURITY_HELP,
            "17": Intent.HELP,
            "18": Intent.SUPPORT_TICKET,
            "19": Intent.FAQ,
            "20": Intent.MAIN_MENU,
            "21": Intent.GO_BACK,
            "22": Intent.EXIT
        }
        if option in route_map:
            result.intent = route_map[option]
        else:
            result.intent = Intent.UNKNOWN

    reply_message = None

    # Handle Conversation State
    if state:
        pending_intent = state.get("pendingIntent")
        pending_step = state.get("pendingStep")
        
        if result.intent in (Intent.GO_BACK, Intent.EXIT, Intent.MAIN_MENU):
            clear_conversation_state(tenant_id, customer_phone)
            # Let it fall through to normal execution below
        elif pending_intent == Intent.CREATE_ORDER:
            if pending_step == "AWAITING_PRODUCT":
                pq = result.entities.get("productQuery") if result.intent == Intent.CREATE_ORDER and result.entities.get("productQuery") else message_text
                product = ProductResolver.resolve(tenant_id, pq)
                if not product:
                    reply_message = f"Sorry, I couldn't find a product matching '{pq}'. Please try another product name."
                else:
                    qty = result.entities.get("quantity")
                    if qty:
                        state["pendingStep"] = "AWAITING_CONFIRMATION"
                        state["productId"] = product["productId"]
                        state["productName"] = product["name"]
                        state["quantity"] = qty
                        state["unit"] = product["unit"]
                        state["price"] = product["price"]
                        subtotal = float(qty) * product["price"]
                        state["subtotal"] = subtotal
                        set_conversation_state(tenant_id, customer_phone, state)
                        reply_message = f"Order Summary:\n{qty} {product['unit']}s x {product['name']}\nSubtotal: ₹{subtotal}\n\nWould you like me to place this order? (Yes/No)"
                    else:
                        state["pendingStep"] = "AWAITING_QUANTITY"
                        state["productId"] = product["productId"]
                        state["productName"] = product["name"]
                        state["unit"] = product["unit"]
                        state["price"] = product["price"]
                        set_conversation_state(tenant_id, customer_phone, state)
                        reply_message = f"I found {product['name']}. How many {product['unit']}s would you like?"
            
            elif pending_step == "AWAITING_QUANTITY":
                # Extract number
                qty_match = re.search(r'^(\d+(?:\.\d+)?)', message_text)
                if qty_match:
                    qty = qty_match.group(1)
                    state["pendingStep"] = "AWAITING_CONFIRMATION"
                    state["quantity"] = qty
                    subtotal = float(qty) * state["price"]
                    state["subtotal"] = subtotal
                    set_conversation_state(tenant_id, customer_phone, state)
                    reply_message = f"Order Summary:\n{qty} x {state['productName']}\nSubtotal: ₹{subtotal}\n\nWould you like me to place this order? (Yes/No)"
                else:
                    reply_message = "Please reply with a valid number for the quantity."
            
            elif pending_step == "AWAITING_CONFIRMATION":
                if message_text.lower().strip() in ("yes", "y", "confirm", "ok", "sure"):
                    try:
                        create_order(
                            tenant_id=tenant_id,
                            customer_id=customer_id,
                            customer_phone=customer_phone,
                            items=[{"productId": state["productId"], "quantity": float(state["quantity"]), "unit": state["unit"]}],
                            delivery_address="Default Delivery Address"
                        )
                        clear_conversation_state(tenant_id, customer_phone)
                        reply_message = f"✅ Your order for **{state['quantity']} × {state['productName']}** has been placed successfully. It is now NEW and being processed."
                    except ValueError as e:
                        clear_conversation_state(tenant_id, customer_phone)
                        reply_message = f"Sorry, unable to place order: {str(e)}"
                    except Exception as e:
                        clear_conversation_state(tenant_id, customer_phone)
                        logger.error(f"Failed to place order: {e}")
                        reply_message = "Sorry, a system error occurred while placing your order."
                elif message_text.lower().strip() in ("no", "n", "cancel"):
                    clear_conversation_state(tenant_id, customer_phone)
                    reply_message = "Order cancelled."
                else:
                    reply_message = "Please reply with 'Yes' to confirm or 'No' to cancel."

    # Normal Stateless Execution
    if not reply_message:
        try:
            if result.intent == Intent.ORDER_TRACKING:
                order_id = result.entities.get("order_id")
                if order_id:
                    # In a real MVP, we could query order details. Here we provide a simple fallback that uses DynamoDB
                    # if we want, or just a generic string if it's not strictly tracking a specific ID.
                    reply_message = f"Your order {order_id} is currently Out for Delivery."
                else:
                    orders = get_customer_orders(tenant_id, customer_id, limit=1)
                    if orders:
                        o = orders[0]
                        reply_message = f"Your latest order {o['orderId']} is currently {o['status']}."
                    else:
                        reply_message = "You have no recent orders to track."

            elif result.intent == Intent.CREATE_ORDER:
                pq = result.entities.get("productQuery")
                qty = result.entities.get("quantity")
                unit = result.entities.get("unit")
                if pq and qty:
                    prod = ProductResolver.resolve(tenant_id, pq)
                    if not prod:
                        reply_message = f"Sorry, I couldn't find a product matching '{pq}'."
                    else:
                        if unit and unit.lower().rstrip('s') != prod["unit"].lower().rstrip('s'):
                            reply_message = f"{prod['name']} is sold by {prod['unit']}. Please specify the quantity in {prod['unit']}s."
                        else:
                            st = {
                                "pendingIntent": Intent.CREATE_ORDER,
                                "pendingStep": "AWAITING_CONFIRMATION",
                                "productId": prod["productId"],
                                "productName": prod["name"],
                                "quantity": qty,
                                "unit": prod["unit"],
                                "price": prod["price"],
                                "subtotal": float(qty) * prod["price"]
                            }
                            set_conversation_state(tenant_id, customer_phone, st)
                            reply_message = f"Order Summary:\n{qty} {prod['unit']}s x {prod['name']}\nSubtotal: ₹{st['subtotal']}\n\nWould you like me to place this order? (Yes/No)"
                elif pq:
                    prod = ProductResolver.resolve(tenant_id, pq)
                    if not prod:
                        reply_message = f"Sorry, I couldn't find a product matching '{pq}'."
                    else:
                        st = {
                            "pendingIntent": Intent.CREATE_ORDER,
                            "pendingStep": "AWAITING_QUANTITY",
                            "productId": prod["productId"],
                            "productName": prod["name"],
                            "unit": prod["unit"],
                            "price": prod["price"]
                        }
                        set_conversation_state(tenant_id, customer_phone, st)
                        reply_message = f"I found {prod['name']}. How many {prod['unit']}s would you like?"
                else:
                    st = {
                        "pendingIntent": Intent.CREATE_ORDER,
                        "pendingStep": "AWAITING_PRODUCT"
                    }
                    set_conversation_state(tenant_id, customer_phone, st)
                    reply_message = "🛒 Sure. What would you like to order?\nExample: `Maggie noodles 2 packets`"

            elif result.intent == Intent.CANCEL_ORDER:
                order_id = result.entities.get("order_id")
                if not order_id:
                    orders = get_customer_orders(tenant_id, customer_id, limit=1)
                    if orders:
                        order_id = orders[0]["orderId"]
                
                if order_id:
                    try:
                        cancel_customer_order(tenant_id, customer_id, order_id)
                        reply_message = f"Order {order_id} has been cancelled and inventory restored."
                    except ValueError as e:
                        reply_message = f"Could not cancel order {order_id}. It may already be cancelled, delivered, or it does not exist."
                    except Exception as e:
                        logger.error(f"Failed to cancel order: {e}")
                        reply_message = f"Sorry, a system error occurred while cancelling your order."
                else:
                    reply_message = "Please specify the order ID to cancel, or place an order first."

            elif result.intent == Intent.ORDER_HISTORY:
                orders = get_customer_orders(tenant_id, customer_id, limit=5)
                if orders:
                    lines = ["Your recent orders:\n"]
                    for o in orders:
                        lines.append(f"- {o['orderId']} ({o['status']}) - ₹{o.get('total', 0)}")
                    reply_message = "\n".join(lines)
                else:
                    reply_message = "You have no recent orders."

            elif result.intent == Intent.REORDER:
                orders = get_customer_orders(tenant_id, customer_id, limit=1)
                if not orders:
                    reply_message = "You have no previous orders to reorder."
                else:
                    o = orders[0]
                    # To implement Reorder, we could query order items, but for MVP we just inform them
                    reply_message = f"To reorder your previous order {o['orderId']}, please select 'Place an order' and enter the items again."

            elif result.intent == Intent.PRODUCT_LOOKUP:
                pq = result.entities.get("productQuery")
                if pq:
                    prod = ProductResolver.resolve(tenant_id, pq)
                    if prod:
                        reply_message = f"{prod['name']} costs ₹{prod['price']} per {prod['unit']}."
                    else:
                        reply_message = f"Sorry, I couldn't find a product matching '{pq}'."
                else:
                    reply_message = "What product price are you looking for?"

            elif result.intent == Intent.INVENTORY_CHECK:
                pq = result.entities.get("productQuery")
                if pq:
                    prod = ProductResolver.resolve(tenant_id, pq)
                    if prod:
                        reply_message = f"Yes, {prod['name']} is currently {'in stock' if prod['stock'] > 0 else 'out of stock'}.\nAvailable: {prod['stock']} {prod['unit']}s"
                    else:
                        reply_message = f"Sorry, I couldn't find a product matching '{pq}'."
                else:
                    reply_message = "What product are you looking for?"

            elif result.intent == Intent.PRODUCT_SEARCH:
                pq = result.entities.get("productQuery")
                if pq:
                    prod = ProductResolver.resolve(tenant_id, pq)
                    if prod:
                        reply_message = f"I found: {prod['name']} (₹{prod['price']}/{prod['unit']})"
                    else:
                        reply_message = f"Sorry, I couldn't find anything matching '{pq}'."
                else:
                    reply_message = "Please tell me what you want to search for."

            elif result.intent == Intent.PRODUCT_DETAILS:
                pq = result.entities.get("productQuery")
                if pq:
                    prod = ProductResolver.resolve(tenant_id, pq)
                    if prod:
                        reply_message = f"**{prod['name']}**\nPrice: ₹{prod['price']}/{prod['unit']}\nStock: {prod['stock']}"
                    else:
                        reply_message = f"Sorry, I couldn't find details for '{pq}'."
                else:
                    reply_message = "Which product's details would you like to see?"

            elif result.intent == Intent.OFFERS:
                reply_message = "There are no active offers available right now."

            elif result.intent == Intent.PAYMENT_STATUS:
                reply_message = get_payment_status(tenant_id, customer_id)

            elif result.intent == Intent.INVOICE_REQUEST:
                reply_message = get_invoice_link(tenant_id, customer_id)

            elif result.intent == Intent.BILLING_DETAILS:
                reply_message = get_billing_details(tenant_id, customer_id)

            elif result.intent == Intent.ACCOUNT_DETAILS:
                reply_message = get_account_details(tenant_id, customer_id, customer_phone)

            elif result.intent == Intent.ACCOUNT_SETTINGS:
                reply_message = get_account_settings()

            elif result.intent == Intent.SECURITY_HELP:
                reply_message = get_security_help()

            elif result.intent == Intent.SUPPORT_TICKET:
                ticket_id = create_support_ticket(tenant_id, customer_phone, customer_id)
                reply_message = f"I have created a support ticket for you (Ticket ID: {ticket_id}). Our team will review it shortly."

            elif result.intent == Intent.FAQ:
                reply_message = get_faq_response(tenant_id)

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

            elif result.intent == Intent.GREETING:
                reply_message = f"Hi! Welcome to WBOS.\n\n{MENU_TEXT}"
                
            elif result.intent == Intent.MAIN_MENU:
                reply_message = MENU_TEXT
                
            elif result.intent == Intent.EXIT:
                clear_conversation_state(tenant_id, customer_phone)
                reply_message = "Thank you for using WBOS! Have a great day."
                
            elif result.intent == Intent.GO_BACK:
                reply_message = "Conversation state cleared. Returning to normal."

            elif result.intent in (Intent.HELP, Intent.UNKNOWN):
                reply_message = MENU_TEXT
                
        except Exception as e:
            logger.error(f"Error executing intent: {str(e)}")
            reply_message = "Sorry, I encountered an error while processing your request."

    # Emit CustomerReplyRequested event to EventBridge
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
