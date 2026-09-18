import pytest
from core.auth import ExecutionContext, authorize_tool, AccessDeniedError
from core.tool_router import handle_tool_use
from services.analytics import get_daily_sales

def test_owner_authorization():
    # P4.13 Owner authorization test
    context = ExecutionContext(tenant_id="TENANT_001", actor_id="OWNER_USER", role="OWNER", channel="WHATSAPP")
    assert authorize_tool(context, "get_daily_sales") == True

from unittest.mock import patch

def test_customer_denial():
    # P4.14 Customer denial test
    context = ExecutionContext(tenant_id="TENANT_001", actor_id="CUS_001", role="CUSTOMER", channel="WHATSAPP")
    with pytest.raises(AccessDeniedError):
        authorize_tool(context, "get_daily_sales")

def test_authorization_short_circuit():
    # P4.15 Authorization short-circuit test
    context = ExecutionContext(tenant_id="TENANT_001", actor_id="CUS_001", role="CUSTOMER", channel="WHATSAPP")

    tool_use = {
        "name": "get_daily_sales",
        "input": {"date": "2026-09-17"}
    }

    # Mock the analytics service to ensure it is NEVER called
    with patch("core.tool_router.get_daily_sales") as mock_get_daily_sales:
        result = handle_tool_use(context, tool_use)

        assert result["status"] == "error"
        assert "AccessDenied" in result["message"]

        # Explicitly verify the domain service was never executed
        mock_get_daily_sales.assert_not_called()

def test_tenant_isolation(setup_db):
    import boto3
    from core.config import config
    # P4.16 Tenant isolation test
    # Seed data for two tenants
    table = boto3.resource("dynamodb", region_name="us-east-1").Table(config.DYNAMODB_TABLE)

    table.put_item(Item={
        "PK": "TENANT#TENANT_001#ORDER#ORD_1",
        "SK": "META",
        "GSI3PK": "TENANT#TENANT_001#DATE#2026-09-17",
        "GSI3SK": "ORDER#ORD_1",
        "total": 100,
        "status": "CONFIRMED"
    })
    table.put_item(Item={
        "PK": "TENANT#TENANT_002#ORDER#ORD_2",
        "SK": "META",
        "GSI3PK": "TENANT#TENANT_002#DATE#2026-09-17",
        "GSI3SK": "ORDER#ORD_2",
        "total": 500,
        "status": "CONFIRMED"
    })

    # Query for Tenant 001
    sales_001 = get_daily_sales("TENANT_001", "2026-09-17")
    assert sales_001["total_sales"] == 100.0

    # Query for Tenant 002
    sales_002 = get_daily_sales("TENANT_002", "2026-09-17")
    assert sales_002["total_sales"] == 500.0

def test_tenant_injection_resistance():
    # P4.17 Tenant injection resistance test
    # Even if the LLM attempts to supply "tenantId": "TENANT_002" inside the tool input,
    # the router must force the tenant from the context.

    context = ExecutionContext(tenant_id="TENANT_001", actor_id="OWNER_USER", role="OWNER", channel="WHATSAPP")

    # Malicious tool use payload from LLM
    tool_use = {
        "name": "get_daily_sales",
        "input": {
            "date": "2026-09-17",
            "tenantId": "TENANT_002", # Attempted injection
            "tenant_id": "TENANT_002"
        }
    }

    # Mock domain service to capture what it receives
    with patch("core.tool_router.get_daily_sales", return_value={}) as mock_get_daily_sales:
        handle_tool_use(context, tool_use)

        # Assert that the domain service was called with the context's tenant_id (TENANT_001),
        # completely ignoring the LLM's attempted injection
        mock_get_daily_sales.assert_called_once_with(tenant_id="TENANT_001", date_str="2026-09-17")
