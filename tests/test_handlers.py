import os
import json
import pytest
from unittest.mock import patch, MagicMock
from handlers.invoice import lambda_handler as invoice_handler
from handlers.notification import lambda_handler as notification_handler

@patch("handlers.invoice.s3_client")
@patch("handlers.invoice.events")
def test_invoice_handler(mock_events, mock_s3):
    os.environ["INVOICE_BUCKET"] = "test-bucket"
    
    event = {
        "detail": {
            "eventType": "OrderCreated",
            "tenantId": "TENANT_001",
            "data": {
                "orderId": "ORD_123",
                "customerId": "CUS_001",
                "total": 100.0,
                "items": [{"name": "Item 1", "quantity": 1, "lineTotal": 100.0}]
            }
        }
    }
    
    res = invoice_handler(event, None)
    assert res["status"] == "success"
    assert res["invoiceUrl"] == "https://test-bucket.s3.amazonaws.com/TENANT_001/invoices/invoice_ORD_123.pdf"
    
    mock_s3.upload_file.assert_called_once()
    mock_events.publish.assert_called_once()
    assert mock_events.publish.call_args[1]["event_type"] == "InvoiceGenerated"

@patch("handlers.notification.send_whatsapp_message")
def test_notification_handler_invoice(mock_send):
    event = {
        "detail": {
            "eventType": "InvoiceGenerated",
            "tenantId": "TENANT_001",
            "data": {
                "orderId": "ORD_123",
                "invoiceUrl": "https://test-bucket/test.pdf"
            }
        }
    }
    
    res = notification_handler(event, None)
    assert res["status"] == "success"
    mock_send.assert_called_once()
    args = mock_send.call_args[0]
    assert "ORD_123" in args[1]
    assert "https://test-bucket/test.pdf" in args[1]
