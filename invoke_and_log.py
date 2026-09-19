import boto3
import json
import time

client = boto3.client('lambda', region_name='ap-south-1')
logs_client = boto3.client('logs', region_name='ap-south-1')

payload = {
    "Records": [
        {
            "body": json.dumps({
                "tenant_id": "DEMO_TENANT",
                "actor_id": "+919876543210",
                "role": "CUSTOMER",
                "channel": "WHATSAPP",
                "customer_phone": "+919876543210",
                "message_text": "Track my order",
                "message_id": f"msg-{int(time.time())}",
                "req_id": f"req-{int(time.time())}"
            })
        }
    ]
}

print("Invoking ExecutionFunction...")
res = client.invoke(
    FunctionName='wbos-first-commit-ExecutionFunction-LET9FmI9Yac6',
    Payload=json.dumps(payload)
)
print(res['Payload'].read().decode('utf-8'))

print("Waiting for EventBridge and Notification Lambda (10s)...")
time.sleep(10)

log_group = '/aws/lambda/wbos-first-commit-NotificationFunction-Aq1d8wsiqQ6p'
print(f"Fetching logs from {log_group}...")

try:
    streams = logs_client.describe_log_streams(
        logGroupName=log_group,
        orderBy='LastEventTime',
        descending=True,
        limit=1
    )
    if not streams['logStreams']:
        print("No log streams found.")
    else:
        stream_name = streams['logStreams'][0]['logStreamName']
        events = logs_client.get_log_events(
            logGroupName=log_group,
            logStreamName=stream_name,
            limit=20
        )
        for event in events['events']:
            print(event['message'])
except Exception as e:
    print(f"Error fetching logs: {e}")
