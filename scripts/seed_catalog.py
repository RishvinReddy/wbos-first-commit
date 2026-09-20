import os
import boto3
from botocore.exceptions import ClientError

def get_client():
    if os.environ.get("AWS_SAM_LOCAL"):
        return boto3.client('dynamodb', endpoint_url="http://127.0.0.1:8000", region_name="us-east-1")
    return boto3.client('dynamodb', region_name='ap-south-1')

def seed_catalog():
    client = get_client()
    table_name = os.environ.get("TABLE_NAME", "WBOS_Store")
    tenant_id = "TENANT_001"
    
    print(f"Seeding product catalog into table {table_name} for tenant {tenant_id}...")

    products = [
        {"id": "PROD_MAGGIE", "name": "Maggie Noodles", "price": "14", "stock": "40", "unit": "packet"},
        {"id": "PROD_BASMATI", "name": "Basmati Rice", "price": "150", "stock": "50", "unit": "kg"},
        {"id": "PROD_MILK", "name": "Milk", "price": "60", "stock": "100", "unit": "litre"},
        {"id": "PROD_OIL", "name": "Cooking Oil", "price": "200", "stock": "30", "unit": "litre"},
        {"id": "PROD_FLOUR", "name": "Wheat Flour", "price": "45", "stock": "12", "unit": "kg"},
        {"id": "PROD_SUGAR", "name": "Sugar", "price": "40", "stock": "3", "unit": "kg"},
        {"id": "PROD_TEA", "name": "Tea Powder", "price": "180", "stock": "20", "unit": "packet"},
        {"id": "PROD_BISCUITS", "name": "Biscuits", "price": "30", "stock": "35", "unit": "packet"},
        {"id": "PROD_BREAD", "name": "Bread", "price": "45", "stock": "25", "unit": "loaf"},
        {"id": "PROD_EGGS", "name": "Eggs", "price": "8", "stock": "60", "unit": "piece"}
    ]

    for p in products:
        try:
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
                },
                ConditionExpression="attribute_not_exists(PK)"
            )
            print(f"  Added Product: {p['name']} (Stock: {p['stock']} {p['unit']})")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                print(f"  Skipped Product: {p['name']} (Already exists)")
            else:
                raise

    print("Catalog seed complete.")

if __name__ == "__main__":
    seed_catalog()
