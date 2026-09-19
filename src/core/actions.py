import logging
from core import events

logger = logging.getLogger(__name__)

def execute_action(tenant_id: str, action: dict, event_data: dict) -> dict:
    """
    Executes a specific action deterministically.
    Returns a trace entry for the execution log.
    """
    action_type = action.get("type")
    
    try:
        if action_type == "SEND_WHATSAPP":
            # We use the existing CustomerReplyRequested EventBridge mechanism
            # which is picked up by the Notification Lambda.
            phone = action.get("phone")
            message = action.get("message", "Notification from WBOS.")
            
            if not phone:
                # Try to extract from event data if not hardcoded
                phone = event_data.get("order", {}).get("customerPhone") or event_data.get("customerPhone")
                
            if not phone:
                raise ValueError("No customer phone number available for SEND_WHATSAPP")
                
            events.publish(
                event_type="CustomerReplyRequested",
                tenant_id=tenant_id,
                source="wbos.automations",
                data={
                    "customerPhone": phone,
                    "message": message
                }
            )
            return {
                "step": "Action",
                "detail": "SEND_WHATSAPP",
                "status": "SUCCESS",
                "message": f"Published WhatsApp message event to {phone}"
            }
            
        elif action_type == "NOTIFY_OWNER":
            # Publish a generic OwnerNotificationRequested event
            # to be handled by the Notification Lambda.
            message = action.get("message", "Owner Alert from WBOS Automation.")
            
            events.publish(
                event_type="OwnerNotificationRequested",
                tenant_id=tenant_id,
                source="wbos.automations",
                data={
                    "message": message,
                    "triggerEvent": event_data
                }
            )
            return {
                "step": "Action",
                "detail": "NOTIFY_OWNER",
                "status": "SUCCESS",
                "message": "Published owner notification event"
            }
            
        elif action_type == "UPDATE_ORDER":
            # Safe domain operation. Does not bypass state machine.
            # E.g. setting an internal metadata flag, or dispatching a transition request.
            from services.orders import transition_order_state
            
            order_id = action.get("orderId") or event_data.get("orderId") or event_data.get("order", {}).get("orderId")
            if not order_id:
                raise ValueError("No order ID available to update")
                
            transition = action.get("transition")
            if transition:
                transition_order_state(
                    tenant_id=tenant_id, 
                    order_id=order_id, 
                    payload={"transition": transition}, 
                    actor="AutomationEngine"
                )
                msg = f"Triggered safe transition {transition} for {order_id}"
            else:
                msg = "No safe update operation specified in action configuration"
                
            return {
                "step": "Action",
                "detail": "UPDATE_ORDER",
                "status": "SUCCESS",
                "message": msg
            }
            
        elif action_type in ["SEND_EMAIL", "CREATE_LEAD", "CREATE_CAMPAIGN", "PAYMENT_ACTION", "WEBHOOK"]:
            return {
                "step": "Action",
                "detail": action_type,
                "status": "SKIPPED",
                "message": "COMING SOON"
            }
            
        else:
            return {
                "step": "Action",
                "detail": action_type,
                "status": "FAILED",
                "message": f"Unsupported action type: {action_type}"
            }
            
    except Exception as e:
        logger.error(f"Action {action_type} failed: {e}")
        return {
            "step": "Action",
            "detail": action_type,
            "status": "FAILED",
            "message": str(e)
        }
