import os
import boto3
import uuid
from datetime import datetime, timezone

region = os.environ.get("AWS_DEFAULT_REGION", "ap-south-1")
table_name = os.environ.get("DYNAMODB_TABLE", "WBOS_Store")
tenant_id = os.environ.get("TENANT_ID", "TENANT_001")

dynamodb = boto3.resource("dynamodb", region_name=region)
table = dynamodb.Table(table_name)

WORKERS = [
    {"name": "Priya", "role": "PACKER"},
    {"name": "Rahul", "role": "PACKER"},
    {"name": "Arjun", "role": "PACKER"},
    {"name": "Ravi", "role": "DELIVERY_DRIVER"},
    {"name": "Kiran", "role": "DELIVERY_DRIVER"}
]

def seed_workers():
    print(f"Seeding workers for {tenant_id} into table {table_name}")
    now = datetime.now(timezone.utc).isoformat() + "Z"
    
    count = 0
    for w in WORKERS:
        worker_id = f"WORKER_{uuid.uuid4().hex[:8].upper()}"
        
        item = {
            "PK": f"TENANT#{tenant_id}",
            "SK": f"WORKER#{worker_id}",
            "entityType": "WORKER",
            "workerId": worker_id,
            "name": w["name"],
            "role": w["role"],
            "status": "AVAILABLE",
            "activeOrders": 0,
            "createdAt": now,
            "updatedAt": now
        }
        
        try:
            table.put_item(Item=item)
            print(f"Created worker: {w['name']} ({worker_id}) - Role: {w['role']}")
            count += 1
        except Exception as e:
            print(f"Failed to create worker {w['name']}: {e}")
            
    print(f"Successfully seeded {count} workers.")

if __name__ == "__main__":
    seed_workers()
