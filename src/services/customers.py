from core.db import get_table
from services.orders import get_customer_orders

def get_account_details(tenant_id: str, customer_id: str, customer_phone: str) -> str:
    orders = get_customer_orders(tenant_id, customer_id, limit=50)
    order_count = len(orders)
    active_orders = sum(1 for o in orders if o.get("status") not in ("DELIVERED", "CANCELLED"))
    
    return (
        f"Account Details:\n"
        f"- Phone: {customer_phone}\n"
        f"- ID: {customer_id}\n"
        f"- Total Orders: {order_count}\n"
        f"- Active Orders: {active_orders}"
    )

def get_account_settings() -> str:
    return "To update your notification preferences or address, please visit our website at https://wbos.demo/settings"

def get_security_help() -> str:
    return "If you suspect unauthorized access to your account, please contact support immediately or reset your password at https://wbos.demo/reset"
