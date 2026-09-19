import os
import time
import requests
import boto3
from uuid import uuid4

# Setup
region = os.environ.get("AWS_DEFAULT_REGION", "ap-south-1")
api_url = os.environ.get("API_URL") # E.g. API Gateway URL for /api
token = os.environ.get("JWT_TOKEN")

if not api_url or not token:
    print("Warning: API_URL and JWT_TOKEN environment variables required for API testing.")

dynamodb = boto3.resource("dynamodb", region_name=region)
table = dynamodb.Table("WBOS_Store")
tenant_id = "TENANT_001"

def create_mock_order():
    order_id = f"ORD-{str(uuid4())[:8].upper()}"
    table.put_item(Item={
        "PK": f"TENANT#{tenant_id}#ORDER#{order_id}",
        "SK": "META",
        "entityType": "ORDER_HEADER",
        "tenantId": tenant_id,
        "orderId": order_id,
        "status": "NEW",
        "GSI2PK": f"TENANT#{tenant_id}#STATUS#NEW",
        "GSI2SK": "TIME#2026-09-19T00:00:00Z"
    })
    return order_id

def test_transitions():
    print("Creating mock NEW order...")
    order_id = create_mock_order()
    print(f"Order {order_id} created.")

    # 1. NEW -> CONFIRMED
    print("\n--- Test 1: NEW -> CONFIRMED ---")
    res = requests.post(
        f"{api_url}/orders/{order_id}/transition",
        headers={"Authorization": f"Bearer {token}"},
        json={"transition": "CONFIRM"}
    )
    print(f"Status: {res.status_code}, Response: {res.json()}")
    
    # 2. Invalid Transition (CONFIRMED -> DELIVERY)
    print("\n--- Test 2: Invalid Transition (CONFIRMED -> DELIVERY) ---")
    res = requests.post(
        f"{api_url}/orders/{order_id}/transition",
        headers={"Authorization": f"Bearer {token}"},
        json={"transition": "DISPATCH", "driverId": "WORKER_XYZ"}
    )
    print(f"Status: {res.status_code}, Response: {res.json()} (Expected failure)")
    
    # 3. CONFIRMED -> PREPARING (with worker)
    print("\n--- Test 3: CONFIRMED -> PREPARING ---")
    res = requests.post(
        f"{api_url}/orders/{order_id}/transition",
        headers={"Authorization": f"Bearer {token}"},
        json={"transition": "START_PREPARATION", "workerId": "Priya"}
    )
    print(f"Status: {res.status_code}, Response: {res.json()}")

    # 4. PREPARING -> READY
    print("\n--- Test 4: PREPARING -> READY ---")
    res = requests.post(
        f"{api_url}/orders/{order_id}/transition",
        headers={"Authorization": f"Bearer {token}"},
        json={"transition": "COMPLETE_PREPARATION"}
    )
    print(f"Status: {res.status_code}, Response: {res.json()}")
    
    # 5. READY -> DELIVERY
    print("\n--- Test 5: READY -> DELIVERY ---")
    res = requests.post(
        f"{api_url}/orders/{order_id}/transition",
        headers={"Authorization": f"Bearer {token}"},
        json={"transition": "DISPATCH", "driverId": "Ravi"}
    )
    print(f"Status: {res.status_code}, Response: {res.json()}")

    # 6. DELIVERY -> DELIVERED
    print("\n--- Test 6: DELIVERY -> DELIVERED ---")
    res = requests.post(
        f"{api_url}/orders/{order_id}/transition",
        headers={"Authorization": f"Bearer {token}"},
        json={"transition": "DELIVER"}
    )
    print(f"Status: {res.status_code}, Response: {res.json()}")

    print("\n--- DB State Check ---")
    item = table.get_item(Key={"PK": f"TENANT#{tenant_id}#ORDER#{order_id}", "SK": "META"}).get("Item")
    print(f"Final Status: {item.get('status')}")

if __name__ == "__main__":
    if api_url and token:
        test_transitions()
    else:
        print("Skipping API tests since API_URL or JWT_TOKEN is missing. Verifying Cognito boundary via API requires active tokens.")
