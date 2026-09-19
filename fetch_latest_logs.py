import boto3
import json

logs_client = boto3.client('logs', region_name='ap-south-1')
log_group = '/aws/lambda/wbos-first-commit-NotificationFunction-Aq1d8wsiqQ6p'
print(f"Fetching logs from {log_group}...")

try:
    streams = logs_client.describe_log_streams(
        logGroupName=log_group,
        orderBy='LastEventTime',
        descending=True,
        limit=2
    )
    if not streams['logStreams']:
        print("No log streams found.")
    else:
        for stream in streams['logStreams']:
            print(f"--- Log Stream: {stream['logStreamName']} ---")
            events = logs_client.get_log_events(
                logGroupName=log_group,
                logStreamName=stream['logStreamName'],
                limit=30
            )
            for event in events['events']:
                print(event['message'].strip())
except Exception as e:
    print(f"Error fetching logs: {e}")
