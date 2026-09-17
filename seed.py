import boto3
from core.db import get_client
from core.config import config

client = get_client()

items = [
    {
        "PK": {"S": "TENANT#TENANT_001"},
        "SK": {"S": "PRODUCT#PROD_BASMATI"},
        "name": {"S": "Basmati Rice 2kg"},
        "price": {"N": "150.0"},
        "stock": {"N": "50"},
        "type": {"S": "PRODUCT"}
    }
]

for item in items:
    client.put_item(TableName=config.DYNAMODB_TABLE, Item=item)

print('DynamoDB seeded.')
