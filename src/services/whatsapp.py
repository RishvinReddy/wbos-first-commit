import json
import logging
import urllib.request
from core.config import get_meta_secrets, config

logger = logging.getLogger(__name__)

def send_whatsapp_text_message(to_phone: str, text: str):
    """
    Sends a real WhatsApp message using the Meta Cloud API.
    Retrieves credentials from Secrets Manager.
    """
    secrets = get_meta_secrets()
    access_token = secrets.get("META_ACCESS_TOKEN")
    phone_number_id = secrets.get("META_PHONE_NUMBER_ID")

    if not access_token or not phone_number_id:
        logger.error("Missing Meta credentials in Secrets Manager")
        return False

    url = f"https://graph.facebook.com/{config.META_GRAPH_API_VERSION}/{phone_number_id}/messages"

    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone.replace("+", ""), # Meta API expects phone number without '+'
        "type": "text",
        "text": {
            "body": text
        }
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read()
            logger.info(f"Successfully sent WhatsApp message to {to_phone}. Response: {res_body}")
            return True
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message: {e}")
        return False
