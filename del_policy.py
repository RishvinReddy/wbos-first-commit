import boto3

client = boto3.client('iam', region_name='ap-south-1')
role_name = 'wbos-first-commit-DashboardFunctionRole-diMFdqKbwbew'

try:
    client.delete_role_policy(
        RoleName=role_name,
        PolicyName='SimulatorExecutionPolicy'
    )
    print("Manual policy removed.")
except Exception as e:
    print("Error:", e)
