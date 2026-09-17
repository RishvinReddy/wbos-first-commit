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
    }
}

def resolve_execution_context(phone_number: str) -> ExecutionContext:
    """
    Deterministically resolves the caller's identity and role.
    In MVP/Vertical slice, we hardcode the owner's phone number.
    In production, this would query a Users/Tenants table.
    """
    # Hardcoded owner for the demo
    if phone_number == "+919347761153":
        return ExecutionContext(
            tenant_id="TENANT_001",
            actor_id="OWNER_USER",
            role="OWNER",
            channel="WHATSAPP"
        )
    else:
        # Default customer mapping
        return ExecutionContext(
            tenant_id="TENANT_001",
            actor_id=phone_number, # using phone as ID for mock
            role="CUSTOMER",
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

def resolve_dashboard_context(headers: dict) -> ExecutionContext:
    """
    Deterministically resolves the caller's identity for the Dashboard API.

    MVP authentication uses explicit demo credentials. Unknown or missing
    credentials are rejected rather than defaulting to OWNER.
    """
    auth_header = headers.get("authorization", "")

    if auth_header == "Bearer OWNER_TOKEN":
        return ExecutionContext(
            tenant_id="TENANT_001",
            actor_id="OWNER_USER",
            role="OWNER",
            channel="WEB"
        )

    if auth_header == "Bearer CUSTOMER_TOKEN":
        return ExecutionContext(
            tenant_id="TENANT_001",
            actor_id="CUS_MOCK",
            role="CUSTOMER",
            channel="WEB"
        )

    raise AccessDeniedError("Invalid or missing dashboard credentials")
