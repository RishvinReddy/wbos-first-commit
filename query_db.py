import boto3
client = boto3.client('dynamodb', region_name='ap-south-1')
res = client.scan(TableName='WBOS_Store', FilterExpression="begins_with(SK, :sk)", ExpressionAttributeValues={":sk": {"S": "PRODUCT#"}})
for item in res['Items']:
    print(item['PK']['S'], item['name']['S'])
