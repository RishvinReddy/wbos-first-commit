import boto3
import json

client = boto3.client('iam', region_name='ap-south-1')
role_name = 'wbos-first-commit-DashboardFunctionRole-diMFdqKbwbew'
account_id = boto3.client('sts').get_caller_identity().get('Account')

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
                "dynamodb:Scan",
                "dynamodb:BatchGetItem",
                "dynamodb:BatchWriteItem",
                "dynamodb:ConditionCheckItem"
            ],
            "Resource": [
                f"arn:aws:dynamodb:ap-south-1:{account_id}:table/WBOS_Store",
                f"arn:aws:dynamodb:ap-south-1:{account_id}:table/WBOS_Store/index/*"
            ]
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
            "Resource": f"arn:aws:events:ap-south-1:{account_id}:event-bus/wbos-events"
        }
    ]
}

try:
    client.put_role_policy(
        RoleName=role_name,
        PolicyName='StrictExecutionPolicy',
        PolicyDocument=json.dumps(policy)
    )
    print("Strict Policy updated successfully.")
except Exception as e:
    print("Error:", e)
