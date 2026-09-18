import hmac
import hashlib
from core.config import get_meta_secrets
class InvalidSignatureError(Exception):
    pass

def verify_whatsapp_signature(payload_body: str, signature_header: str) -> bool:
    """
    Verifies the X-Hub-Signature-256 header sent by Meta WhatsApp Webhooks.

    :param payload_body: Raw string body of the HTTP request.
    :param signature_header: The value of the x-hub-signature-256 header (e.g., 'sha256=...').
    :raises InvalidSignatureError: If signature is missing or invalid.
    """
    if not signature_header:
        raise InvalidSignatureError("Missing signature header")

    if not signature_header.startswith("sha256="):
        raise InvalidSignatureError("Invalid signature format")

    signature = signature_header.split("sha256=")[1]

    # Calculate HMAC
    secrets = get_meta_secrets()
    secret = secrets.get("META_APP_SECRET", "").encode('utf-8')
    payload = payload_body.encode('utf-8')

    expected_hmac = hmac.new(secret, payload, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_hmac, signature):
        raise InvalidSignatureError("Signature mismatch")

    return True
