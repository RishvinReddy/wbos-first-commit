import boto3
import os
from .config import config

_dynamodb = None
_dynamodb_client = None

def _init_clients():
    global _dynamodb, _dynamodb_client
    if _dynamodb is None:
        endpoint_url = os.environ.get("DYNAMODB_ENDPOINT_URL", None)
        if endpoint_url:
            _dynamodb = boto3.resource("dynamodb", endpoint_url=endpoint_url, region_name=config.AWS_REGION)
            _dynamodb_client = boto3.client("dynamodb", endpoint_url=endpoint_url, region_name=config.AWS_REGION)
        else:
            _dynamodb = boto3.resource("dynamodb", region_name=config.AWS_REGION)
            _dynamodb_client = boto3.client("dynamodb", region_name=config.AWS_REGION)

def get_table():
    """Returns the DynamoDB Table resource."""
    _init_clients()
    return _dynamodb.Table(config.DYNAMODB_TABLE)

def get_client():
    """Returns the low-level DynamoDB client for transactions."""
    _init_clients()
    return _dynamodb_client

# For backwards compatibility with modules directly importing dynamodb
def __getattr__(name):
    if name == 'dynamodb':
        _init_clients()
        return _dynamodb
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")
