import boto3
from datetime import datetime, timedelta

client = boto3.client('logs', region_name='ap-south-1')
log_group = '/aws/lambda/wbos-first-commit-DashboardFunction-eSIBjPN9SZac'

try:
    events = client.filter_log_events(
        logGroupName=log_group,
        startTime=int((datetime.now() - timedelta(minutes=5)).timestamp() * 1000)
    )
    for event in events['events']:
        print(event['message'].strip())
except Exception as e:
    print('Error:', e)
