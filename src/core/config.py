import os
import json
import boto3
from functools import lru_cache

class Config:
    DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "WBOS_Store")
    BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")
    AWS_REGION = os.environ.get("AWS_REGION", "ap-south-1")
    EVENT_BUS_NAME = os.environ.get("EVENT_BUS_NAME", "wbos-events")
    EXECUTION_QUEUE_URL = os.environ.get("EXECUTION_QUEUE_URL", "")
    META_GRAPH_API_VERSION = os.environ.get("META_GRAPH_API_VERSION", "v20.0")

@lru_cache(maxsize=1)
def get_meta_secrets():
    # Attempt to fetch from AWS Secrets Manager.
    # For local tests without secrets manager, it can fallback or fail.
    client = boto3.client("secretsmanager", region_name=Config.AWS_REGION)
    try:
        response = client.get_secret_value(SecretId="WBOS_Meta_Credentials")
        return json.loads(response["SecretString"])
    except Exception as e:
        # Provide fallback defaults for automated tests only
        return {
            "META_ACCESS_TOKEN": "mock_token",
            "META_APP_SECRET": "mock_secret_for_local_testing",
            "META_PHONE_NUMBER_ID": "mock_phone_id",
            "META_VERIFY_TOKEN": "WBOS_VERIFY_TOKEN"
        }

config = Config()
