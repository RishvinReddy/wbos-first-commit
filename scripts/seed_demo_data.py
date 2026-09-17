import os
import boto3
from datetime import datetime, UTC

def get_client():
    if os.environ.get("AWS_SAM_LOCAL"):
        return boto3.client('dynamodb', endpoint_url="http://127.0.0.1:8000", region_name="us-east-1")
    return boto3.client('dynamodb', region_name='ap-south-1')

def seed_data():
    client = get_client()
    table_name = os.environ.get("TABLE_NAME", "WBOS_Store")
    
    tenant_id = "TENANT_001"
    now = datetime.now(UTC).isoformat() + "Z"
    
    print(f"Seeding demo data into table {table_name} for tenant {tenant_id}...")

    # 1. Seed Products (Inventory)
    products = [
        {"id": "PROD_BASMATI", "name": "Basmati Rice", "price": "150", "stock": "50", "unit": "kg"},
        {"id": "PROD_MILK", "name": "Milk", "price": "60", "stock": "100", "unit": "litre"},
        {"id": "PROD_OIL", "name": "Cooking Oil", "price": "200", "stock": "30", "unit": "litre"},
        {"id": "PROD_FLOUR", "name": "Wheat Flour", "price": "45", "stock": "12", "unit": "kg"}, # LOW
        {"id": "PROD_SUGAR", "name": "Sugar", "price": "40", "stock": "3", "unit": "kg"}        # CRITICAL
    ]

    for p in products:
        client.put_item(
            TableName=table_name,
            Item={
                "PK": {"S": f"TENANT#{tenant_id}#PRODUCT#{p['id']}"},
                "SK": {"S": "METADATA"},
                "GSI3PK": {"S": f"TENANT#{tenant_id}#PRODUCTS"},
                "GSI3SK": {"S": p['name']},
                "entityType": {"S": "PRODUCT"},
                "tenantId": {"S": tenant_id},
                "productId": {"S": p['id']},
                "name": {"S": p['name']},
                "price": {"N": p['price']},
                "stock": {"N": p['stock']},
                "unit": {"S": p['unit']}
            }
        )
        print(f"  Added Product: {p['name']} (Stock: {p['stock']})")

    # 2. Seed Orders (Various Statuses)
    orders = [
        {"id": "ORD_001", "status": "PENDING", "customer": "Alice", "total": "150", "items": "1"},
        {"id": "ORD_002", "status": "PREPARING", "customer": "Bob", "total": "300", "items": "2"},
        {"id": "ORD_003", "status": "READY", "customer": "Charlie", "total": "45", "items": "1"},
        {"id": "ORD_004", "status": "DISPATCHED", "customer": "Dave", "total": "120", "items": "2"},
        {"id": "ORD_005", "status": "DELIVERED", "customer": "Eve", "total": "500", "items": "5"}
    ]
    
    total_sales = 0
    for o in orders:
        if o["status"] != "PENDING" and o["status"] != "CANCELLED":
            total_sales += int(o["total"])
        
        # Header
        client.put_item(
            TableName=table_name,
            Item={
                "PK": {"S": f"TENANT#{tenant_id}#ORDER#{o['id']}"},
                "SK": {"S": "META"},
                "GSI1PK": {"S": f"TENANT#{tenant_id}#CUS#{o['customer']}"},
                "GSI1SK": {"S": f"ORDER#{now}#{o['id']}"},
                "GSI2PK": {"S": f"TENANT#{tenant_id}#STATUS#{o['status']}"},
                "GSI2SK": {"S": f"CREATED#{now}"},
                "GSI3PK": {"S": f"TENANT#{tenant_id}#DATE#{now[:10]}"},
                "GSI3SK": {"S": f"ORDER#{o['id']}"},
                "entityType": {"S": "ORDER_HEADER"},
                "tenantId": {"S": tenant_id},
                "orderId": {"S": o['id']},
                "status": {"S": o['status']},
                "customerId": {"S": o['customer']},
                "total": {"N": o['total']},
                "itemCount": {"N": o['items']},
                "createdAt": {"S": now}
            }
        )
        # Dummy Item to make it realistic
        client.put_item(
            TableName=table_name,
            Item={
                "PK": {"S": f"TENANT#{tenant_id}#ORDER#{o['id']}"},
                "SK": {"S": f"ITEM#PROD_MILK"},
                "GSI1PK": {"S": f"TENANT#{tenant_id}#PRODUCT#PROD_MILK"},
                "GSI1SK": {"S": f"ORDER#{o['id']}"},
                "entityType": {"S": "ORDER_ITEM"},
                "tenantId": {"S": tenant_id},
                "orderId": {"S": o['id']},
                "productId": {"S": "PROD_MILK"},
                "name": {"S": "Milk"},
                "quantity": {"N": "1"},
                "unitPrice": {"N": "60"},
                "lineTotal": {"N": o['total']}
            }
        )
        print(f"  Added Order: {o['id']} ({o['status']})")

    # 3. Seed Daily Metrics
    today = datetime.now(UTC).strftime("%Y-%m-%d")
    client.put_item(
        TableName=table_name,
        Item={
            "PK": {"S": f"TENANT#{tenant_id}#METRICS#{today}"},
            "SK": {"S": "METRICS"},
            "entityType": {"S": "DAILY_METRICS"},
            "tenantId": {"S": tenant_id},
            "date": {"S": today},
            "totalSales": {"N": str(total_sales)},
            "ordersCount": {"N": str(len(orders))}
        }
    )
    print(f"  Added Metrics: {total_sales} total sales, {len(orders)} orders.")
    print("Seed complete.")

if __name__ == "__main__":
    seed_data()
