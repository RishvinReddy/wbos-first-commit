from services.orders import get_customer_orders

def get_payment_status(tenant_id: str, customer_id: str) -> str:
    orders = get_customer_orders(tenant_id, customer_id, limit=1)
    if not orders:
        return "I don't have a payment record for your latest order yet."
    
    order = orders[0]
    order_id = order.get("orderId")
    status = order.get("status")
    
    # In a real system we'd check a paymentStatus field.
    # For MVP, we derive it from order status or simulate based on total.
    payment_status = "PENDING"
    if status in ("DELIVERED", "DISPATCHED"):
        payment_status = "PAID"
    
    return f"Your payment status for order {order_id} is *{payment_status}*."

def get_billing_details(tenant_id: str, customer_id: str) -> str:
    orders = get_customer_orders(tenant_id, customer_id, limit=1)
    if not orders:
        return "I don't have any billing records for you yet."
    
    order = orders[0]
    return (
        f"Billing Details for Order {order.get('orderId')}:\n"
        f"Subtotal: ${order.get('subtotal', 0)}\n"
        f"Tax: ${order.get('tax', 0)}\n"
        f"*Total: ${order.get('total', 0)}*"
    )

def get_invoice_link(tenant_id: str, customer_id: str) -> str:
    orders = get_customer_orders(tenant_id, customer_id, limit=1)
    if not orders:
        return "You have no past orders to generate an invoice for."
    
    order = orders[0]
    # For the MVP, we assume the invoice Lambda has uploaded it to S3.
    # Realistically we'd query the order record for an invoiceUrl.
    order_id = order.get("orderId")
    return f"Your invoice for {order_id} is available at: https://invoice.wbos.demo/{tenant_id}/{order_id}.pdf"
