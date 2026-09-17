import os
import json
import pytest
from unittest.mock import patch, MagicMock
from core import events

def test_event_envelope():
    # Setup mock
    mock_client = MagicMock()
    mock_client.put_events.return_value = {"FailedEntryCount": 0}
    
    with patch("core.events.get_events_client", return_value=mock_client):
        # Call publish
        events.publish(
            event_type="OrderCreated",
            tenant_id="TENANT_001",
            source="wbos.orders",
            data={"orderId": "123", "total": 100}
        )
        
        # Verify
        mock_client.put_events.assert_called_once()
        call_args = mock_client.put_events.call_args[1]
        entries = call_args["Entries"]
        assert len(entries) == 1
        
        entry = entries[0]
        assert entry["Source"] == "wbos.orders"
        assert entry["DetailType"] == "OrderCreated"
        
        detail = json.loads(entry["Detail"])
        assert detail["eventType"] == "OrderCreated"
        assert detail["tenantId"] == "TENANT_001"
        assert "eventId" in detail
        assert "timestamp" in detail
        assert detail["data"]["orderId"] == "123"
