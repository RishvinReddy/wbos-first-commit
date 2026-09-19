import os
import sys
import time
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
os.environ["AWS_REGION"] = "ap-south-1"
os.environ["DYNAMODB_TABLE"] = "WBOS_Store"

from core.events import publish
from services.automations import list_automations, activate_automation, pause_automation, get_executions

TENANT_ID = "DEMO_TENANT"

def find_auto(name):
    for a in list_automations(TENANT_ID):
        if a['name'] == name:
            return a
    return None

def test_high_value():
    print("--- Testing High Value Order Alert ---")
    auto = find_auto("High Value Order Alert")
    activate_automation(TENANT_ID, auto['id'])
    
    print("1. Publishing OrderCreated (Total: 7500)")
    publish("OrderCreated", TENANT_ID, {
        "order": {"orderId": "TEST_7500", "total": 7500, "customerPhone": "1234"}
    }, "wbos.orders")
    
    time.sleep(3)
    
    print("2. Publishing OrderCreated (Total: 500)")
    publish("OrderCreated", TENANT_ID, {
        "order": {"orderId": "TEST_500", "total": 500, "customerPhone": "1234"}
    }, "wbos.orders")
    
    time.sleep(3)
    pause_automation(TENANT_ID, auto['id'])
    
    # Check results
    execs = get_executions(TENANT_ID, limit=5)
    for e in execs:
        if e['automationId'] == auto['id']:
            trigger_data = json.loads(e.get('trace', [{}])[0].get('detail', "{}")) if isinstance(e.get('trace'), str) else "Trace"
            print(f"Result for {e['automationName']}: {e['status']}")

def test_delivery():
    print("--- Testing Order Delivery Notification ---")
    auto = find_auto("Order Delivery Notification")
    activate_automation(TENANT_ID, auto['id'])
    
    print("1. Publishing OrderDelivered")
    publish("OrderDelivered", TENANT_ID, {
        "order": {"orderId": "TEST_DELIVERY", "total": 1000, "customerPhone": "+1234567890"}
    }, "wbos.orders")
    
    time.sleep(3)
    pause_automation(TENANT_ID, auto['id'])
    
    execs = get_executions(TENANT_ID, limit=5)
    for e in execs:
        if e['automationId'] == auto['id']:
            print(f"Result for {e['automationName']}: {e['status']}")

if __name__ == "__main__":
    test_high_value()
    test_delivery()
