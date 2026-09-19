import os
import sys

# Add src to python path so we can import services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

# Set env vars before importing boto3/config
os.environ["AWS_REGION"] = "ap-south-1"
os.environ["DYNAMODB_TABLE"] = "WBOS_Store"

from services.automations import create_automation, activate_automation

TENANT_ID = "DEMO_TENANT"

templates = [
    {
        "name": "Order Delivery Notification",
        "description": "Sends a WhatsApp message to the customer when their order is out for delivery.",
        "trigger": {"type": "OrderDispatched"},
        "conditions": [],
        "actions": [
            {
                "type": "SEND_WHATSAPP",
                "message": "Hi! Your order {{order.orderId}} is out for delivery and will arrive shortly.",
                "phone": "order.customerPhone"
            }
        ]
    },
    {
        "name": "High Value Order Alert",
        "description": "Alerts the owner when an order exceeds ₹5000.",
        "trigger": {"type": "OrderCreated"},
        "conditions": [
            {
                "field": "order.total",
                "operator": "greater_than",
                "value": "5000"
            }
        ],
        "actions": [
            {
                "type": "NOTIFY_OWNER",
                "message": "High value order received! Order {{order.orderId}} is worth ₹{{order.total}}."
            }
        ]
    },
    {
        "name": "Low Stock Alert",
        "description": "Notifies the owner when product stock drops below 5 units.",
        "trigger": {"type": "InventoryLow"},
        "conditions": [
            {
                "field": "product.stock",
                "operator": "less_than",
                "value": "5"
            }
        ],
        "actions": [
            {
                "type": "NOTIFY_OWNER",
                "message": "Stock Alert: {{product.name}} has dropped to {{product.stock}} units."
            }
        ]
    }
]

def seed():
    print(f"Seeding automations for {TENANT_ID}...")
    for t in templates:
        print(f"Creating '{t['name']}'...")
        auto = create_automation(TENANT_ID, t)
        print(f"Activating {auto['id']}...")
        activate_automation(TENANT_ID, auto["id"])
    print("Done!")

if __name__ == "__main__":
    seed()
