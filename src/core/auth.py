import logging

logger = logging.getLogger(__name__)

class AccessDeniedError(Exception):
    pass

class ExecutionContext:
    def __init__(self, tenant_id: str, actor_id: str, role: str, channel: str):
        self.tenant_id = tenant_id
        self.actor_id = actor_id
        self.role = role
        self.channel = channel

# The definitive mapping of which role is permitted to execute which tool.
RBAC_MATRIX = {
    "OWNER": {
        "get_daily_sales",
        "get_sales_summary",
        "get_low_stock_products",
        "get_pending_orders",
        "search_products",
        "check_inventory",
        "create_order",          # Owners might place manual orders
        "update_order_status",
        "assign_delivery"
    },
    "CUSTOMER": {
        "get_customer",
        "get_customer_orders",
        "get_order",
        "search_products",
        "check_inventory",
        "create_order",
        "cancel_order"
    },
    "UNREGISTERED": set()
}

def resolve_execution_context(phone_number: str) -> ExecutionContext:
    """
    Deterministically resolves the caller's identity and role from the database.
    """
    from core.db import get_table
    table = get_table()
    tenant_id = "TENANT_001" # Single tenant MVP

    # Check if this phone number is registered as a customer/owner
    # In a real multi-tenant system we'd use a GSI or Phone table
    try:
        res = table.get_item(Key={"PK": f"TENANT#{tenant_id}#CUSTOMER#{phone_number}", "SK": "METADATA"})
        item = res.get("Item")

        if item:
            role = item.get("role", "CUSTOMER")
            actor_id = item.get("customerId", phone_number)
        else:
            role = "UNREGISTERED"
            actor_id = phone_number
    except Exception as e:
        logger.warning(f"Failed to lookup customer context: {e}")
        role = "UNREGISTERED"
        actor_id = phone_number

    return ExecutionContext(
        tenant_id=tenant_id,
        actor_id=actor_id,
        role=role,
        channel="WHATSAPP"
    )

def authorize_tool(context: ExecutionContext, tool_name: str) -> bool:
    """
    Validates if the current context's role has permission to execute the requested tool.
    Raises AccessDeniedError if unauthorized.
    """
    permitted_tools = RBAC_MATRIX.get(context.role, set())

    if tool_name not in permitted_tools:
        logger.warning(
            f"ACCESS DENIED: Role '{context.role}' attempted to execute unauthorized tool '{tool_name}'."
        )
        raise AccessDeniedError(f"AccessDenied: Your role ({context.role}) does not have permission to execute {tool_name}")

    logger.info(f"ACCESS GRANTED: Role '{context.role}' executing '{tool_name}'")
    return True

def resolve_dashboard_context(event: dict) -> ExecutionContext:
    """
    Resolves the caller's identity for the Dashboard API exclusively from Cognito JWT claims.
    """
    try:
        claims = event.get("requestContext", {}).get("authorizer", {}).get("jwt", {}).get("claims", {})

        # Require JWT claims for dashboard access
        if not claims:
            raise AccessDeniedError("Missing JWT claims. Unauthorized access.")

        # The email is present in Cognito JWT claims
        email = claims.get("email", "unknown_user")
        sub = claims.get("sub", "unknown_sub")

        return ExecutionContext(
            tenant_id="TENANT_001", # For MVP, assume single tenant
            actor_id=email,
            role="OWNER",
            channel="WEB"
        )
    except AccessDeniedError:
        raise
    except Exception as e:
        raise AccessDeniedError(f"Invalid dashboard credentials: {e}")
