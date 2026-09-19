import os
import boto3
from datetime import datetime, timezone

# Ensure region is set, defaulting to ap-south-1
region = os.environ.get("AWS_DEFAULT_REGION", "ap-south-1")
table_name = os.environ.get("DYNAMODB_TABLE", "WBOS_Store")

dynamodb = boto3.client("dynamodb", region_name=region)

def migrate_orders():
    print(f"Starting migration of PENDING orders to NEW in table: {table_name}")
    
    # We query the GSI2 which maps to status.
    # We want to find all orders with status = PENDING.
    # Note: GSI2PK format is typically TENANT#{tenant_id}#STATUS#{status}
    
    # Since we might have multiple tenants, we'll scan for entityType="ORDER_HEADER" and status="PENDING"
    # A Scan is acceptable for a one-time migration on a small/medium dataset.
    
    paginator = dynamodb.get_paginator('scan')
    
    migrated_count = 0
    failed_count = 0
    
    for page in paginator.paginate(
        TableName=table_name,
        FilterExpression="entityType = :type AND #st = :status",
        ExpressionAttributeNames={"#st": "status"},
        ExpressionAttributeValues={
            ":type": {"S": "ORDER_HEADER"},
            ":status": {"S": "PENDING"}
        }
    ):
        for item in page.get('Items', []):
            pk = item['PK']['S']
            sk = item['SK']['S']
            tenant_id = item['tenantId']['S']
            order_id = item['orderId']['S']
            
            try:
                # To safely update, we perform a conditional write.
                # We also need to update the GSI2PK to reflect the new status.
                
                # Currently GSI2PK = TENANT#{tenant_id}#STATUS#PENDING
                new_gsi2pk = f"TENANT#{tenant_id}#STATUS#NEW"
                
                # We also record an audit of this migration in the item itself
                now = datetime.now(timezone.utc).isoformat() + "Z"
                
                dynamodb.update_item(
                    TableName=table_name,
                    Key={"PK": {"S": pk}, "SK": {"S": sk}},
                    UpdateExpression="SET #st = :new_status, GSI2PK = :new_gsi2pk, #migratedAt = :now, #migrationReason = :reason",
                    ConditionExpression="#st = :old_status",
                    ExpressionAttributeNames={
                        "#st": "status",
                        "#migratedAt": "_migratedAt",
                        "#migrationReason": "_migrationReason"
                    },
                    ExpressionAttributeValues={
                        ":new_status": {"S": "NEW"},
                        ":old_status": {"S": "PENDING"},
                        ":new_gsi2pk": {"S": new_gsi2pk},
                        ":now": {"S": now},
                        ":reason": {"S": "Phase A Command Center Migration"}
                    }
                )
                
                print(f"Migrated order {order_id} ({pk}) to NEW.")
                migrated_count += 1
            except Exception as e:
                print(f"Failed to migrate order {order_id} ({pk}): {e}")
                failed_count += 1

    print(f"Migration completed. Successfully migrated: {migrated_count}, Failed: {failed_count}")

if __name__ == "__main__":
    migrate_orders()
