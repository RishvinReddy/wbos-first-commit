import json
from handlers.dashboard import lambda_handler

import json
from handlers.dashboard import lambda_handler

def create_dashboard_event(path: str, email: str = "owner@test.com", sub: str = "user-123", valid: bool = True):
    if valid:
        return {
            "rawPath": path,
            "requestContext": {
                "http": {"method": "GET"},
                "authorizer": {
                    "jwt": {
                        "claims": {
                            "email": email,
                            "sub": sub
                        }
                    }
                }
            }
        }
    else:
        return {
            "rawPath": path,
            "requestContext": {
                "http": {"method": "GET"}
            }
        }

def test_dashboard_api_metrics(setup_db):
    event = create_dashboard_event("/api/metrics")
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200

    body = json.loads(response["body"])
    assert "total_sales" in body

def test_dashboard_api_inventory(setup_db):
    event = create_dashboard_event("/api/inventory")
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200

    body = json.loads(response["body"])
    assert len(body) > 0
    assert body[0]["productId"] == "PROD_001"

def test_dashboard_api_missing_token():
    event_missing = create_dashboard_event("/api/metrics", valid=False)
    response_missing = lambda_handler(event_missing, None)
    assert response_missing["statusCode"] == 403
    assert "Unauthorized" in response_missing["body"]

def test_dashboard_api_cross_tenant_injection(setup_db):
    event = create_dashboard_event("/api/metrics")
    event["queryStringParameters"] = {"tenantId": "TENANT_002"}
    event["headers"] = {"x-tenant-id": "TENANT_002"}

    response = lambda_handler(event, None)
    assert response["statusCode"] == 200

    body = json.loads(response["body"])
    assert "total_sales" in body
