from core.db import get_table
from boto3.dynamodb.conditions import Key, Attr
import datetime

def get_daily_sales(tenant_id: str, date_str: str = None):
    """
    Business Owner Tool: Aggregate gross revenue, order count, and average order value for a specific calendar date.
    Queries GSI3: GSI3PK = TENANT#{tenant_id}#DATE#{YYYY-MM-DD}
    """
    if not date_str:
        date_str = datetime.datetime.now(datetime.UTC).isoformat()[:10]
        
    table = get_table()
    response = table.query(
        IndexName="GSI3",
        KeyConditionExpression=Key("GSI3PK").eq(f"TENANT#{tenant_id}#DATE#{date_str}")
    )
    
    items = response.get("Items", [])
    
    total_sales = 0.0
    order_count = 0
    
    for order in items:
        if order.get("status") not in ["CANCELLED"]:
            total_sales += float(order.get("total", 0.0))
            order_count += 1
            
    avg_order = total_sales / order_count if order_count > 0 else 0.0
    
    return {
        "date": date_str,
        "total_sales": total_sales,
        "order_count": order_count,
        "average_order_value": round(avg_order, 2)
    }

def get_sales_summary(tenant_id: str, period: str = "today"):
    """
    Business Owner Tool: Generate multi-day sales performance metrics.
    For MVP, maps period to specific date ranges and sums get_daily_sales.
    """
    # Simplified MVP implementation for "today" or "yesterday"
    now = datetime.datetime.now(datetime.UTC)
    
    if period == "yesterday":
        date_str = (now - datetime.timedelta(days=1)).isoformat()[:10]
        return get_daily_sales(tenant_id, date_str)
        
    # Default today
    date_str = now.isoformat()[:10]
    return get_daily_sales(tenant_id, date_str)

def get_pending_orders(tenant_id: str, status: str = "PENDING"):
    """
    Business Owner Tool: List all orders currently awaiting review.
    Queries GSI2: GSI2PK = TENANT#{tenant_id}#STATUS#{status}
    """
    table = get_table()
    response = table.query(
        IndexName="GSI2",
        KeyConditionExpression=Key("GSI2PK").eq(f"TENANT#{tenant_id}#STATUS#{status}")
    )
    
    items = response.get("Items", [])
    
    # Map to simpler format for Bedrock
    return [
        {
            "orderId": item.get("orderId"),
            "customer": item.get("customerId"),
            "total": float(item.get("total", 0.0)),
            "itemCount": int(item.get("itemCount", 0)),
            "createdAt": item.get("createdAt"),
            "status": item.get("status", status)
        }
        for item in items
    ]

def get_low_stock_products(tenant_id: str, threshold_override: int = 10):
    """
    Business Owner Tool: Retrieve all inventory items that have fallen below their configured reorder threshold.
    For MVP, Scans products on tenant and filters by stock.
    """
    table = get_table()
    
    # In production with thousands of products, we'd use a dedicated GSI 
    # e.g., GSI4PK=TENANT#...#LOWSTOCK. For vertical slice, a filtered scan is acceptable.
    response = table.scan(
        FilterExpression=Attr("tenantId").eq(tenant_id) & Attr("entityType").eq("PRODUCT") & Attr("stock").lt(threshold_override)
    )
    
    items = response.get("Items", [])
    
    return [
        {
            "productId": item.get("productId"),
            "name": item.get("name"),
            "stock": int(item.get("stock", 0)),
            "price": float(item.get("price", 0))
        }
        for item in items
    ]
