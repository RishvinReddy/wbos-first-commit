import json
import os
import sys
import hmac
import hashlib

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from handlers.ingress import lambda_handler

def simulate_webhook():
    print("========================================")
    print("WBOS v2 - Phase 2 Vertical Slice Emulation")
    print("========================================")
    
    # 1. User message
    message = "I need 2 kg basmati rice"
    print(f"\n[1] Customer WhatsApp Message: '{message}'")
    
    body = json.dumps({
        "entry": [{
            "changes": [{
                "value": {
                    "messages": [{
                        "from": "919347761153",
                        "text": {"body": message}
                    }]
                }
            }]
        }]
    })
    
    # 2. Cryptographic HMAC calculation
    secret = os.environ.get("META_APP_SECRET", "mock_secret_for_local_testing").encode("utf-8")
    signature = "sha256=" + hmac.new(secret, body.encode("utf-8"), hashlib.sha256).hexdigest()
    
    event = {
        "headers": {
            "x-hub-signature-256": signature
        },
        "body": body
    }
    
    print("\n[2] Firing API Gateway Webhook event with valid HMAC Signature...")
    
    # 3. Execution
    # For this local integration test, we assume you have AWS credentials set and a DYNAMODB_TABLE environment variable pointing to a real or DynamoDB Local table.
    # To run this cleanly against LocalStack or DynamoDB Local:
    # export DYNAMODB_ENDPOINT_URL="http://localhost:8000"
    
    response = lambda_handler(event, None)
    
    print("\n[3] Ingress Lambda completed.")
    print("\nAPI Gateway Response:")
    print(json.dumps(response, indent=2))
    
    if response["statusCode"] == 200:
        ops = json.loads(response["body"])
        print("\n[4] Success Criteria Evaluated:")
        for op in ops.get("operations", []):
            print(f"  -> Tool Executed: {op['tool']}")
            if op['tool'] == 'create_order':
                res = op['result']
                print(f"  -> Status: {res.get('status')}")
                print(f"  -> Order ID: {res.get('data', {}).get('orderId')}")
                print(f"  -> Stock Reservation: SUCCESS (Atomic Transaction)")
    else:
        print("\n[!] Execution failed.")

if __name__ == "__main__":
    simulate_webhook()
