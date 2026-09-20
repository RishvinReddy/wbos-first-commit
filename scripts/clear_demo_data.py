import os
import sys
import boto3
from botocore.exceptions import ClientError

def get_client():
    if os.environ.get("AWS_SAM_LOCAL"):
        return boto3.client('dynamodb', endpoint_url="http://127.0.0.1:8000", region_name="us-east-1")
    return boto3.client('dynamodb', region_name='ap-south-1')

def clear_demo_data():
    client = get_client()
    table_name = os.environ.get("TABLE_NAME", "WBOS_Store")
    tenant_id = "TENANT_001"
    
    # Base demo orders
    order_ids = ["ORD_001", "ORD_002", "ORD_003", "ORD_004", "ORD_005"]
    
    # Append any explicit order IDs passed as arguments
    if len(sys.argv) > 1:
        order_ids.extend(sys.argv[1:])
        
    # Remove duplicates
    order_ids = list(set(order_ids))
    
    print(f"Clearing orders {order_ids} from table {table_name} for tenant {tenant_id}...")

    # For each order, we want to delete all related items (META, ITEM#..., AUDIT#...)
    # We can query all items with PK = TENANT#...#ORDER#... and delete them
    
    deleted_count = 0
    for order_id in order_ids:
        pk = f"TENANT#{tenant_id}#ORDER#{order_id}"
        print(f"Querying items for PK: {pk}")
        try:
            paginator = client.get_paginator('query')
            response_iterator = paginator.paginate(
                TableName=table_name,
                KeyConditionExpression="PK = :pk",
                ExpressionAttributeValues={":pk": {"S": pk}}
            )
            for page in response_iterator:
                for item in page.get('Items', []):
                    sk = item['SK']['S']
                    print(f"  Deleting {pk} / {sk}")
                    client.delete_item(
                        TableName=table_name,
                        Key={"PK": {"S": pk}, "SK": {"S": sk}}
                    )
                    deleted_count += 1
        except ClientError as e:
            print(f"Error querying/deleting for {order_id}: {e}")

    print(f"Cleanup complete. Deleted {deleted_count} items.")

if __name__ == "__main__":
    clear_demo_data()
