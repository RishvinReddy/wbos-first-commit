import os

class Config:
    DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "WBOS_Store")
    BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")
    META_APP_SECRET = os.environ.get("META_APP_SECRET", "mock_secret_for_local_testing")
    AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

config = Config()
