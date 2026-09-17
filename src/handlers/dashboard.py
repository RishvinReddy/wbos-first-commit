import json
import logging
import uuid
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
        headers = event.get("headers", {})
        # lowercase headers since API gateway converts them
        headers = {k.lower(): v for k, v in headers.items()}
        
        exec_context = resolve_dashboard_context(headers)
        
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
            
        elif path == "/api/simulator/webhook":
            body_str = event.get("body", "{}")
            if event.get("isBase64Encoded"):
                import base64
                body_str = base64.b64decode(body_str).decode('utf-8')
            
            payload = json.loads(body_str)
            message_text = payload.get("message", "")
            customer_phone = payload.get("phone", "+919347761153")
            
            # Generate a mock message ID for idempotency tracking
            message_id = "sim_wamid_" + str(uuid.uuid4())
            req_id = context.aws_request_id if context else "local_sim"
            
            # Resolve the demo identity for the execution
            demo_context = resolve_execution_context(customer_phone)
            
            # Ensure the demo user belongs to the same tenant as the dashboard OWNER
            if demo_context.tenant_id != tenant_id:
                raise AccessDeniedError("Simulator customer tenant mismatch")
            
            logger.info(json.dumps({
                "action": "simulator_invoked",
                "requestId": req_id,
                "tenantId": demo_context.tenant_id,
                "simulatedRole": demo_context.role
            }))
            
            # Shared WBOS execution pipeline
            result = execute_message(demo_context, message_text, message_id, req_id)
            
            return {"statusCode": 200, "headers": _cors_headers(), "body": json.dumps(result)}
            
        else:
            return {"statusCode": 404, "headers": _cors_headers(), "body": json.dumps({"error": "Not Found"})}
            
    except AccessDeniedError as e:
        logger.warning(str(e))
        return {"statusCode": 403, "headers": _cors_headers(), "body": json.dumps({"error": str(e)})}
    except Exception as e:
        logger.error(f"Internal Error: {e}")
        return {"statusCode": 500, "headers": _cors_headers(), "body": json.dumps({"error": "Internal Server Error"})}

