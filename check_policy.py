import boto3
client = boto3.client('iam', region_name='ap-south-1')
try:
    res = client.get_role_policy(
        RoleName='wbos-first-commit-DashboardFunctionRole-diMFdqKbwbew',
        PolicyName='StrictExecutionPolicy'
    )
    import json
    print(json.dumps(res['PolicyDocument'], indent=2))
except Exception as e:
    print('Error:', e)
