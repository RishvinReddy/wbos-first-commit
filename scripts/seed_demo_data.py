import os
import boto3
from datetime import datetime, UTC

def get_client():
    if os.environ.get("AWS_SAM_LOCAL"):
        return boto3.client('dynamodb', endpoint_url="http://127.0.0.1:8000", region_name="us-east-1")
    return boto3.client('dynamodb')

def seed_data():
    client = get_client()
    table_name = os.environ.get("TABLE_NAME", "WBOSStoreTable")
    
    tenant_id = "TENANT_001"
    now = datetime.now(UTC).isoformat() + "Z"
    
    print(f"Seeding demo data into table {table_name} for tenant {tenant_id}...")

    # 1. Seed Products (Inventory)
    products = [
        {"id": "PROD_001", "name": "Basmati Rice", "price": "150", "stock": "50", "unit": "kg"},
        {"id": "PROD_002", "name": "Milk", "price": "60", "stock": "100", "unit": "litre"},
        {"id": "PROD_003", "name": "Cooking Oil", "price": "200", "stock": "30", "unit": "litre"},
        {"id": "PROD_004", "name": "Wheat Flour", "price": "45", "stock": "12", "unit": "kg"}, # LOW
        {"id": "PROD_005", "name": "Sugar", "price": "40", "stock": "3", "unit": "kg"}        # CRITICAL
    ]

    for p in products:
        client.put_item(
            TableName=table_name,
            Item={
                "PK": {"S": f"TENANT#{tenant_id}#PRODUCT#{p['id']}"},
                "SK": {"S": "PRODUCT"},
                "GSI3PK": {"S": f"TENANT#{tenant_id}#PRODUCTS"},
                "GSI3SK": {"S": p['name']},
                "EntityType": {"S": "Product"},
                "TenantId": {"S": tenant_id},
                "ProductId": {"S": p['id']},
                "Name": {"S": p['name']},
                "Price": {"N": p['price']},
                "Stock": {"N": p['stock']},
                "Unit": {"S": p['unit']}
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
        if o["status"] != "PENDING":
            total_sales += int(o["total"])
        
        client.put_item(
            TableName=table_name,
            Item={
                "PK": {"S": f"TENANT#{tenant_id}#ORDER#{o['id']}"},
                "SK": {"S": "ORDER"},
                "GSI1PK": {"S": f"TENANT#{tenant_id}#ORDERS_BY_STATUS"},
                "GSI1SK": {"S": f"{o['status']}#{now}"},
                "GSI2PK": {"S": f"TENANT#{tenant_id}#ORDERS_BY_DATE"},
                "GSI2SK": {"S": now},
                "EntityType": {"S": "Order"},
                "TenantId": {"S": tenant_id},
                "OrderId": {"S": o['id']},
                "Status": {"S": o['status']},
                "CustomerName": {"S": o['customer']},
                "TotalAmount": {"N": o['total']},
                "ItemCount": {"N": o['items']},
                "CreatedAt": {"S": now}
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
            "EntityType": {"S": "DailyMetrics"},
            "TenantId": {"S": tenant_id},
            "Date": {"S": today},
            "TotalSales": {"N": str(total_sales)},
            "OrdersCount": {"N": str(len(orders))}
        }
    )
    print(f"  Added Metrics: {total_sales} total sales, {len(orders)} orders.")
    print("Seed complete.")

if __name__ == "__main__":
    seed_data()
