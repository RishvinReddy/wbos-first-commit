from boto3.dynamodb.conditions import Key, Attr
from core.db import get_table

def search_products(tenant_id: str, query: str, category: str = None, limit: int = 10):
    """
    Search products by keyword and optional category.
    """
    table = get_table()
    
    # Simple keyword match
    query_lower = query.lower() if query else ""

    if category:
        # AP-03: List Products in Category
        response = table.query(
            IndexName="GSI1",
            KeyConditionExpression=Key("GSI1PK").eq(f"TENANT#{tenant_id}#CAT#{category}")
        )
        items = response.get("Items", [])
    else:
        # Fallback for hackathon MVP: Scan with filter. 
        # In production, we'd use OpenSearch or a dedicated index.
        response = table.scan(
            FilterExpression=Attr("tenantId").eq(tenant_id) & Attr("entityType").eq("PRODUCT")
        )
        items = response.get("Items", [])
    
    # In-memory filter on query
    matched = []
    for item in items:
        if query_lower in item.get("name", "").lower():
            matched.append({
                "productId": item.get("productId"),
                "name": item.get("name"),
                "price": float(item.get("price", 0)),
                "stock": int(item.get("stock", 0)),
                "unit": item.get("unit", "")
            })
            if len(matched) >= limit:
                break
                
    return matched

def check_inventory(tenant_id: str, product_ids: list[str]):
    """
    Check stock for a list of product IDs using BatchGetItem.
    """
    if not product_ids:
        return []
        
    table = get_table()
    # For DynamoDB resource BatchGetItem, we need the table name
    table_name = table.name
    
    keys = [{"PK": f"TENANT#{tenant_id}#PRODUCT#{pid}", "SK": "METADATA"} for pid in product_ids]
    
    # Use the dynamodb resource from core.db
    from core.db import dynamodb
    response = dynamodb.batch_get_item(
        RequestItems={
            table_name: {
                "Keys": keys
            }
        }
    )
    
    items = response.get("Responses", {}).get(table_name, [])
    
    return [
        {
            "productId": item.get("productId"),
            "name": item.get("name"),
            "stock": int(item.get("stock", 0)),
            "price": float(item.get("price", 0))
        }
        for item in items
    ]
