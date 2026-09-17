import datetime
import uuid
from decimal import Decimal
from core.db import get_client, config
from core import events
from services.products import check_inventory

def create_order(tenant_id: str, customer_id: str, items: list[dict], delivery_address: str):
    """
    Atomically creates an order and deducts inventory using DynamoDB Transactions.
    """
    if not items:
        raise ValueError("Order must contain at least one item.")
        
    product_ids = [item["productId"] for item in items]
    inventory = check_inventory(tenant_id, product_ids)
    
    inventory_map = {p["productId"]: p for p in inventory}
    
    subtotal = Decimal("0.0")
    tax_total = Decimal("0.0")
    order_id = f"ORD_{uuid.uuid4().hex[:8].upper()}"
    now = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
    
    transact_items = []
    order_items_records = []
    
    for item in items:
        pid = item["productId"]
        qty = Decimal(str(item["quantity"]))
        
        if pid not in inventory_map:
            raise ValueError(f"Product {pid} not found in inventory.")
            
        prod = inventory_map[pid]
        price = Decimal(str(prod["price"]))
        
        line_total = price * qty
        subtotal += line_total
        tax_total += line_total * Decimal("0.05") # Assuming flat 5% GST for MVP
        
        # 1. Update Product Stock (Decrement)
        transact_items.append({
            "Update": {
                "TableName": config.DYNAMODB_TABLE,
                "Key": {
                    "PK": {"S": f"TENANT#{tenant_id}#PRODUCT#{pid}"},
                    "SK": {"S": "METADATA"}
                },
                "UpdateExpression": "SET stock = stock - :qty",
                "ConditionExpression": "stock >= :qty",
                "ExpressionAttributeValues": {
                    ":qty": {"N": str(qty)}
                }
            }
        })
        
        # 2. Put Order Item
        order_item = {
            "PK": {"S": f"TENANT#{tenant_id}#ORDER#{order_id}"},
            "SK": {"S": f"ITEM#{pid}"},
            "GSI1PK": {"S": f"TENANT#{tenant_id}#PRODUCT#{pid}"},
            "GSI1SK": {"S": f"ORDER#{order_id}"},
            "entityType": {"S": "ORDER_ITEM"},
            "tenantId": {"S": tenant_id},
            "orderId": {"S": order_id},
            "productId": {"S": pid},
            "name": {"S": prod["name"]},
            "quantity": {"N": str(qty)},
            "unitPrice": {"N": str(price)},
            "lineTotal": {"N": str(line_total)}
        }
        
        if "unit" in item:
            order_item["unit"] = {"S": item["unit"]}
            
        transact_items.append({
            "Put": {
                "TableName": config.DYNAMODB_TABLE,
                "Item": order_item
            }
        })
        
        order_items_records.append({
            "productId": pid,
            "name": prod["name"],
            "quantity": float(qty),
            "lineTotal": float(line_total)
        })

    total = subtotal + tax_total
    
    # 3. Put Order Header
    order_header = {
        "PK": {"S": f"TENANT#{tenant_id}#ORDER#{order_id}"},
        "SK": {"S": "META"},
        "GSI1PK": {"S": f"TENANT#{tenant_id}#CUS#{customer_id}"},
        "GSI1SK": {"S": f"ORDER#{now}#{order_id}"},
        "GSI2PK": {"S": f"TENANT#{tenant_id}#STATUS#PENDING"},
        "GSI2SK": {"S": f"CREATED#{now}"},
        "GSI3PK": {"S": f"TENANT#{tenant_id}#DATE#{now[:10]}"},
        "GSI3SK": {"S": f"ORDER#{order_id}"},
        "entityType": {"S": "ORDER_HEADER"},
        "tenantId": {"S": tenant_id},
        "orderId": {"S": order_id},
        "customerId": {"S": customer_id},
        "deliveryAddress": {"S": delivery_address},
        "status": {"S": "PENDING"},
        "itemCount": {"N": str(len(items))},
        "subtotal": {"N": str(subtotal)},
        "tax": {"N": str(tax_total)},
        "total": {"N": str(total)},
        "createdAt": {"S": now}
    }
    
    transact_items.append({
        "Put": {
            "TableName": config.DYNAMODB_TABLE,
            "Item": order_header
        }
    })
    
    # Execute Transaction
    client = get_client()
    # Execute Transaction (native ClientError bubbles up on failure)
    client.transact_write_items(TransactItems=transact_items)
        
    # 4. Emit OrderCreated Event (Post-Transaction)
    # Note: For MVP, we emit directly here. In a true enterprise system,
    # we would use the Outbox Pattern to guarantee EventBridge delivery.
    events.publish(
        event_type="OrderCreated",
        tenant_id=tenant_id,
        source="wbos.orders",
        data={
            "orderId": order_id,
            "customerId": customer_id,
            "total": float(total),
            "items": order_items_records
        }
    )
        
    return {
        "orderId": order_id,
        "status": "PENDING",
        "subtotal": float(subtotal),
        "tax": float(tax_total),
        "total": float(total),
        "items": order_items_records
    }
