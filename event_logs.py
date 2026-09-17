import boto3
from datetime import datetime, timedelta

client = boto3.client('logs', region_name='ap-south-1')
fn = [f['FunctionName'] for f in boto3.client('lambda', region_name='ap-south-1').list_functions()['Functions'] if 'DashboardEventFunction' in f['FunctionName']][0]
log_group = f'/aws/lambda/{fn}'

try:
    events = client.filter_log_events(
        logGroupName=log_group,
        startTime=int((datetime.now() - timedelta(minutes=5)).timestamp() * 1000)
    )
    for event in events['events']:
        print(event['message'].strip())
except Exception as e:
    print('Error:', e)
