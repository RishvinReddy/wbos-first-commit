import os
import json
import pytest
from unittest.mock import patch
from services.products import search_products, check_inventory
from services.orders import create_order
from handlers.ingress import lambda_handler
from security.webhook import verify_whatsapp_signature, InvalidSignatureError

def test_search_products(setup_db):
    res = search_products("TENANT_001", "basmati")
    assert len(res) == 1
    assert res[0]["productId"] == "PROD_001"
    assert res[0]["price"] == 100.0

def test_check_inventory(setup_db):
    res = check_inventory("TENANT_001", ["PROD_001"])
    assert len(res) == 1
    assert res[0]["stock"] == 10

def test_create_order_atomic_transaction(setup_db, ddb_client):
    # Initial stock is 10
    items = [{"productId": "PROD_001", "quantity": 2, "unit": "kg"}]
    order = create_order("TENANT_001", "CUS_001", "+919347761153", items, "Address")

    assert order["status"] == "PENDING"
    assert order["total"] == 210.0 # 2 * 100 = 200 + 10 (5% tax)

    # Verify stock decremented
    table_name = os.environ["DYNAMODB_TABLE"]
    res = ddb_client.get_item(
        TableName=table_name,
        Key={"PK": {"S": "TENANT#TENANT_001#PRODUCT#PROD_001"}, "SK": {"S": "METADATA"}}
    )
    assert res["Item"]["stock"]["N"] == "8"

    # Try ordering more than stock
    from botocore.exceptions import ClientError
    with pytest.raises(ClientError) as exc:
        create_order("TENANT_001", "CUS_001", "+919347761153", [{"productId": "PROD_001", "quantity": 10}], "Address")
    assert exc.value.response['Error']['Code'] == 'TransactionCanceledException'

    # Verify stock remains unchanged (8) and no order items were created
    res = ddb_client.get_item(
        TableName=table_name,
        Key={"PK": {"S": "TENANT#TENANT_001#PRODUCT#PROD_001"}, "SK": {"S": "METADATA"}}
    )
    assert res["Item"]["stock"]["N"] == "8"

@patch("handlers.ingress.sqs")
def test_ingress_lambda_e2e(mock_sqs, setup_db):
    os.environ["EXECUTION_QUEUE_URL"] = "test-queue"
    from core.config import config
    config.EXECUTION_QUEUE_URL = "test-queue"

    body = json.dumps({
        "entry": [{"changes": [{"value": {"messages": [{"id": "wamid.123", "type": "text", "from": "919347761153", "text": {"body": "I need 1 kg basmati"}}]}}]}]
    })

    import hmac
    import hashlib
    secret = "mock_secret_for_local_testing".encode("utf-8")
    signature = "sha256=" + hmac.new(secret, body.encode("utf-8"), hashlib.sha256).hexdigest()

    event = {
        "headers": {"x-hub-signature-256": signature},
        "body": body
    }

    res = lambda_handler(event, None)
    assert res["statusCode"] == 200
    mock_sqs.send_message.assert_called_once()

    call_args = mock_sqs.send_message.call_args[1]
    assert call_args["QueueUrl"] == "test-queue"
    msg_body = json.loads(call_args["MessageBody"])
    assert msg_body["message_text"] == "I need 1 kg basmati"

@patch("handlers.ingress.sqs")
def test_ingress_idempotency(mock_sqs, setup_db):
    from core.config import config
    config.EXECUTION_QUEUE_URL = "test-queue"

    body = json.dumps({
        "entry": [{"changes": [{"value": {"messages": [{"id": "wamid.idemp123", "type": "text", "from": "919347761153", "text": {"body": "hello"}}]}}]}]
    })

    import hmac
    import hashlib
    secret = "mock_secret_for_local_testing".encode("utf-8")
    signature = "sha256=" + hmac.new(secret, body.encode("utf-8"), hashlib.sha256).hexdigest()

    event = {
        "headers": {"x-hub-signature-256": signature},
        "body": body
    }

    # Request 1
    res1 = lambda_handler(event, None)
    assert res1["statusCode"] == 200
    assert mock_sqs.send_message.call_count == 1

    # Request 2 (Duplicate)
    res2 = lambda_handler(event, None)
    assert res2["statusCode"] == 200
    # Verify SQS NOT called again
    assert mock_sqs.send_message.call_count == 1
