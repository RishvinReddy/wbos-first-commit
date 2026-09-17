import boto3
import json

client = boto3.client('iam', region_name='ap-south-1')
role_name = 'wbos-first-commit-DashboardFunctionRole-diMFdqKbwbew'

policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:GetItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "events:PutEvents"
            ],
            "Resource": "*"
        }
    ]
}

try:
    client.put_role_policy(
        RoleName=role_name,
        PolicyName='SimulatorExecutionPolicy',
        PolicyDocument=json.dumps(policy)
    )
    print("Policy attached successfully.")
except Exception as e:
    print("Error:", e)
