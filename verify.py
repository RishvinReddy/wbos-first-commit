import boto3
import json

client = boto3.client('dynamodb', region_name='ap-south-1')
s3 = boto3.client('s3', region_name='ap-south-1')
account = boto3.client('sts').get_caller_identity().get('Account')
bucket = f"wbos-invoices-{account}-ap-south-1"

# 1. Check DynamoDB for orders
print("--- DynamoDB Orders ---")
res = client.scan(TableName='WBOS_Store', FilterExpression="begins_with(PK, :pk) AND begins_with(SK, :sk)", ExpressionAttributeValues={":pk": {"S": "TENANT#TENANT_001#ORDER#"}, ":sk": {"S": "META"}})
for item in res.get('Items', []):
    print("Found Order:", item.get('orderId', {}).get('S'), "Total:", item.get('total', {}).get('N'))

# 2. Check DynamoDB for dashboard events
print("--- DynamoDB Events ---")
res = client.scan(TableName='WBOS_Store', FilterExpression="begins_with(PK, :pk)", ExpressionAttributeValues={":pk": {"S": "TENANT#TENANT_001#EVENT#"}})
for item in res.get('Items', []):
    print("Found Event:", item.get('type', {}).get('S'), "for Order:", json.loads(item.get('data', {}).get('S', '{}')).get('orderId'))

# 3. Check S3 for invoices
print("--- S3 Invoices ---")
try:
    res = s3.list_objects_v2(Bucket=bucket)
    for obj in res.get('Contents', []):
        print("Found Invoice:", obj['Key'])
except Exception as e:
    print("S3 Error:", e)

