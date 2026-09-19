import json
import logging
import uuid
import urllib.parse
from core.auth import resolve_dashboard_context, resolve_execution_context, AccessDeniedError
from core.execution import execute_message
from services.analytics import get_daily_sales, get_sales_summary, get_pending_orders, get_low_stock_products
from boto3.dynamodb.conditions import Key
from core.db import get_table

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def _cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*"
    }

def lambda_handler(event, context):
    try:
        # Preflight
        if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
            return {"statusCode": 200, "headers": _cors_headers(), "body": ""}

        # Identity & Authorization
        exec_context = resolve_dashboard_context(event)

        # Only OWNER can access the dashboard API
        if exec_context.role != "OWNER":
            raise AccessDeniedError("Dashboard is restricted to OWNER role")

        path = event.get("rawPath", "")
        tenant_id = exec_context.tenant_id

        # Route requests
        if path == "/api/metrics":
            data = get_sales_summary(tenant_id, "today")
            return {"statusCode": 200, "headers": _cors_headers(), "body": json.dumps(data)}

        elif path == "/api/orders":
            # For pipeline view, fetch all relevant statuses
            pending = get_pending_orders(tenant_id, "PENDING")
            preparing = get_pending_orders(tenant_id, "PREPARING")
            ready = get_pending_orders(tenant_id, "READY")

            data = pending + preparing + ready
            # Sort by created time descending
            data.sort(key=lambda x: x["createdAt"], reverse=True)
            return {"statusCode": 200, "headers": _cors_headers(), "body": json.dumps(data)}

        elif path == "/api/inventory":
            table = get_table()

            # We use GSI3 where GSI3PK = TENANT#{tenant_id}#PRODUCTS
            response = table.query(
                IndexName="GSI3",
                KeyConditionExpression=Key("GSI3PK").eq(f"TENANT#{tenant_id}#PRODUCTS")
            )
            items = response.get("Items", [])
            data = [
                {
                    "productId": item.get("productId"),
                    "name": item.get("name"),
                    "stock": int(item.get("stock", 0)),
                    "price": float(item.get("price", 0)),
                    "unit": item.get("unit", "")
                }
                for item in items
            ]
            return {"statusCode": 200, "headers": _cors_headers(), "body": json.dumps(data)}

        elif path == "/api/events":
            # Query the events table/index
            # PK = TENANT#{tenant_id}#EVENTS
            table = get_table()
            response = table.query(
                KeyConditionExpression=Key("PK").eq(f"TENANT#{tenant_id}#EVENTS"),
                ScanIndexForward=False, # Descending (newest first)
                Limit=50
            )

            data = []
            for item in response.get("Items", []):
                data.append({
                    "eventId": item.get("SK").replace("TIME#", ""),
                    "type": item.get("eventType"),
                    "timestamp": item.get("timestamp"),
                    "data": item.get("data", {})
                })

            return {"statusCode": 200, "headers": _cors_headers(), "body": json.dumps(data)}

        elif path == "/api/conversations":
            from services.conversations import list_conversations
            data = {"conversations": list_conversations(tenant_id)}
            return {"statusCode": 200, "headers": _cors_headers(), "body": json.dumps(data)}

        elif path.startswith("/api/conversations/"):
            conversation_id = path.split("/")[-1]
            conversation_id = urllib.parse.unquote(conversation_id)
            from services.conversations import get_conversation_messages
            data = {"conversation": get_conversation_messages(tenant_id, conversation_id)}
            return {"statusCode": 200, "headers": _cors_headers(), "body": json.dumps(data)}

        else:
            return {"statusCode": 404, "headers": _cors_headers(), "body": json.dumps({"error": "Not Found"})}

    except AccessDeniedError as e:
        logger.warning(str(e))
        return {"statusCode": 403, "headers": _cors_headers(), "body": json.dumps({"error": str(e)})}
    except Exception as e:
        logger.error(f"Internal Error: {e}")
        return {"statusCode": 500, "headers": _cors_headers(), "body": json.dumps({"error": "Internal Server Error"})}

