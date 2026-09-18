from services.products import search_products, check_inventory
from services.orders import create_order
from services.analytics import get_daily_sales, get_sales_summary, get_low_stock_products, get_pending_orders
from core.auth import ExecutionContext, authorize_tool

def handle_tool_use(context: ExecutionContext, tool_use: dict):
    """
    Routes a Bedrock ToolUse block to the correct Python domain service.
    Enforces authorization rules via context.
    """
    tool_name = tool_use["name"]
    tool_input = tool_use["input"]

    try:
        # 1. Authorization Guard
        authorize_tool(context, tool_name)

        # 2. Route to domain service
        if tool_name == "search_products":
            res = search_products(
                tenant_id=context.tenant_id,

                query=tool_input.get("query"),
                category=tool_input.get("category"),
                limit=tool_input.get("limit", 10)
            )
            return {"status": "success", "data": res}

        elif tool_name == "check_inventory":
            res = check_inventory(
                tenant_id=context.tenant_id,

                product_ids=tool_input.get("productIds", [])
            )
            return {"status": "success", "data": res}

        elif tool_name == "create_order":
            res = create_order(
                tenant_id=context.tenant_id,
                customer_id=context.actor_id,
                customer_phone=getattr(context, "customer_phone", context.actor_id),
                items=tool_input.get("items", []),
                delivery_address=tool_input.get("deliveryAddress", "Store Pickup")
            )
            return {"status": "success", "data": res}

        elif tool_name == "get_daily_sales":
            res = get_daily_sales(
                tenant_id=context.tenant_id,
                date_str=tool_input.get("date")
            )
            return {"status": "success", "data": res}

        elif tool_name == "get_sales_summary":
            res = get_sales_summary(
                tenant_id=context.tenant_id,
                period=tool_input.get("period", "today")
            )
            return {"status": "success", "data": res}

        elif tool_name == "get_low_stock_products":
            res = get_low_stock_products(
                tenant_id=context.tenant_id,
                threshold_override=tool_input.get("thresholdOverride", 10)
            )
            return {"status": "success", "data": res}

        elif tool_name == "get_pending_orders":
            res = get_pending_orders(
                tenant_id=context.tenant_id,
                status=tool_input.get("status", "PENDING")
            )
            return {"status": "success", "data": res}

        else:
            return {"status": "error", "message": f"Tool {tool_name} is not implemented yet in vertical slice."}

    except Exception as e:
        return {"status": "error", "message": str(e)}
