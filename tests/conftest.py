import os

os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
os.environ["DYNAMODB_TABLE"] = "WBOS_Store_Test"
os.environ["META_APP_SECRET"] = "secret"
os.environ["AWS_ACCESS_KEY_ID"] = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
os.environ["AWS_SECURITY_TOKEN"] = "testing"
os.environ["AWS_SESSION_TOKEN"] = "testing"

import pytest
import boto3
from moto import mock_aws

# Unset DYNAMODB_ENDPOINT_URL so moto catches the calls natively
if "DYNAMODB_ENDPOINT_URL" in os.environ:
    del os.environ["DYNAMODB_ENDPOINT_URL"]
    del os.environ["DYNAMODB_ENDPOINT_URL"]

@pytest.fixture(scope="function")
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"

@pytest.fixture(scope="function")
def ddb_client(aws_credentials):
    with mock_aws():
        yield boto3.client("dynamodb", region_name="us-east-1")

@pytest.fixture(scope="function")
def setup_db(ddb_client):
    """Sets up the DynamoDB table defined in template.yaml for tests."""
    table_name = os.environ["DYNAMODB_TABLE"]
    ddb_client.create_table(
        TableName=table_name,
        KeySchema=[
            {"AttributeName": "PK", "KeyType": "HASH"},
            {"AttributeName": "SK", "KeyType": "RANGE"}
        ],
        AttributeDefinitions=[
            {"AttributeName": "PK", "AttributeType": "S"},
            {"AttributeName": "SK", "AttributeType": "S"},
            {"AttributeName": "GSI1PK", "AttributeType": "S"},
            {"AttributeName": "GSI1SK", "AttributeType": "S"},
            {"AttributeName": "GSI2PK", "AttributeType": "S"},
            {"AttributeName": "GSI2SK", "AttributeType": "S"},
            {"AttributeName": "GSI3PK", "AttributeType": "S"},
            {"AttributeName": "GSI3SK", "AttributeType": "S"},
        ],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "GSI1",
                "KeySchema": [
                    {"AttributeName": "GSI1PK", "KeyType": "HASH"},
                    {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"}
            },
            {
                "IndexName": "GSI2",
                "KeySchema": [
                    {"AttributeName": "GSI2PK", "KeyType": "HASH"},
                    {"AttributeName": "GSI2SK", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"}
            },
            {
                "IndexName": "GSI3",
                "KeySchema": [
                    {"AttributeName": "GSI3PK", "KeyType": "HASH"},
                    {"AttributeName": "GSI3SK", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"}
            }
        ],
        BillingMode="PAY_PER_REQUEST"
    )
    
    # Seed data
    ddb_client.put_item(
        TableName=table_name,
        Item={
            "PK": {"S": "TENANT#TENANT_001#PRODUCT#PROD_001"},
            "SK": {"S": "METADATA"},
            "GSI1PK": {"S": "TENANT#TENANT_001#CAT#Grocery"},
            "GSI1SK": {"S": "PROD#PROD_001"},
            "GSI3PK": {"S": "TENANT#TENANT_001#PRODUCTS"},
            "GSI3SK": {"S": "PROD#PROD_001"},
            "entityType": {"S": "PRODUCT"},
            "tenantId": {"S": "TENANT_001"},
            "productId": {"S": "PROD_001"},
            "name": {"S": "Basmati Rice 1kg"},
            "price": {"N": "100.0"},
            "stock": {"N": "10"}
        }
    )
    yield
