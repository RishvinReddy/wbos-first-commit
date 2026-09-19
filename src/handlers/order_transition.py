import json
import logging
from core.auth import resolve_dashboard_context, AccessDeniedError
from services.orders import transition_order_state

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

        # Basic RBAC: Allow OWNER, ADMIN, MANAGER to transition orders.
        # Viewers and Operators are restricted from this endpoint depending on strict roles.
        allowed_roles = ["OWNER", "ADMIN", "MANAGER", "OPERATOR"]
        if exec_context.role not in allowed_roles:
            raise AccessDeniedError("Role is not authorized to transition orders")

        tenant_id = exec_context.tenant_id
        
        path_params = event.get("pathParameters", {})
        order_id = path_params.get("orderId")
        
        if not order_id:
            return {"statusCode": 400, "headers": _cors_headers(), "body": json.dumps({"error": "orderId is required"})}
            
        body = json.loads(event.get("body", "{}"))
        
        # Transition Order State
        result = transition_order_state(tenant_id, order_id, body, exec_context.user_id)
        
        return {"statusCode": 200, "headers": _cors_headers(), "body": json.dumps(result)}

    except AccessDeniedError as e:
        logger.warning(str(e))
        return {"statusCode": 403, "headers": _cors_headers(), "body": json.dumps({"error": str(e)})}
    except ValueError as e:
        logger.warning(f"Validation Error: {e}")
        return {"statusCode": 400, "headers": _cors_headers(), "body": json.dumps({"error": str(e)})}
    except Exception as e:
        logger.error(f"Internal Error: {e}", exc_info=True)
        # Catch ConditionalCheckFailedException for 409 Conflict
        if e.__class__.__name__ == 'ConditionalCheckFailedException' or "ConditionalCheckFailed" in str(e):
             return {"statusCode": 409, "headers": _cors_headers(), "body": json.dumps({"error": "Order state changed by another process. Please refresh."})}
        return {"statusCode": 500, "headers": _cors_headers(), "body": json.dumps({"error": "Internal Server Error"})}
