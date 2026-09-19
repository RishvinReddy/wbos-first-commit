import re
from typing import List, Tuple
from .intents import Intent

# Ordered from most specific to least specific
# Format: (Regex pattern, Intent, List of Entity Names, Pattern Label)
INTENT_PATTERNS: List[Tuple[str, Intent, List[str], str]] = [
    # Cancel Order
    (r'(?i)(cancel|stop).*order\s*([a-z0-9]+)?', Intent.CANCEL_ORDER, ['order_id'], 'cancel_order'),
    
    # Track Order
    (r'(?i)(track|where is|location).*order\s*([a-z0-9]+)?', Intent.ORDER_TRACKING, ['order_id'], 'track_order'),
    
    # Order Status
    (r'(?i)(status).*order\s*([a-z0-9]+)?', Intent.ORDER_STATUS, ['order_id'], 'order_status'),
    
    # Order History
    (r'(?i)(previous orders|order history|past orders)', Intent.ORDER_HISTORY, [], 'order_history'),
    
    # Invoice Request
    (r'(?i)(invoice|bill|receipt)', Intent.INVOICE_REQUEST, [], 'invoice_request'),
    
    # Store Hours
    (r'(?i)(time do you open|time do you close|store hours|when are you open)', Intent.STORE_HOURS, [], 'store_hours'),
    
    # Inventory Check
    (r'(?i)(do you have|is there any|stock of)\s+(.+)', Intent.INVENTORY_CHECK, ['product'], 'inventory_check'),
    
    # Product Lookup
    (r'(?i)(how much is|price of|cost of)\s+(.+)', Intent.PRODUCT_LOOKUP, ['product'], 'product_lookup'),
    
    # Create Order (general, no product)
    (r'(?i)^(place an order|order something|i want to order)$', Intent.CREATE_ORDER, [], 'create_order_general'),
    
    # Create Order (with quantity)
    (r'(?i)(i want|order|buy|place an order for)\s+(\d+)\s*(?:packets?\s+of|pieces?\s+of|pcs?|units?)?\s+(.+)', Intent.CREATE_ORDER, ['quantity', 'product'], 'create_order_qty'),
    
    # Create Order (without explicit quantity)
    (r'(?i)(i want|order|buy|place an order for)\s+(.+)', Intent.CREATE_ORDER, ['product'], 'create_order'),
    
    # Help
    (r'(?i)\b(help|what can you do|support)\b', Intent.HELP, [], 'help'),
    
    # Greeting
    (r'(?i)^(hi|hello|hey|greetings)\b', Intent.GREETING, [], 'greeting'),
]
