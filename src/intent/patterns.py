import re
from typing import List, Tuple
from .intents import Intent

# Ordered from most specific to least specific
# Format: (Regex pattern, Intent, List of Entity Names, Pattern Label)
INTENT_PATTERNS: List[Tuple[str, Intent, List[str], str]] = [
    # Menu Selection
    (r'(?i)^(\d+)$', Intent.MENU_SELECTION, ['option'], 'menu_selection'),

    # Create Order: Quantity first (e.g. "2 kg basmati rice")
    (r'(?i)^(?:i want|order|buy|place an order for)?\s*(\d+(?:\.\d+)?)\s*(kg|kilograms?|litre|litres|l|packet|packets|piece|pieces|pcs?|units?|loaf|loaves)?(?:s?\s+of)?\s+(.+)$', Intent.CREATE_ORDER, ['quantity', 'unit', 'productQuery'], 'create_order_quantity_first'),

    # Create Order: Product first (e.g. "basmati rice 2 kg")
    (r'(?i)^(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|kilograms?|litre|litres|l|packet|packets|piece|pieces|pcs?|units?|loaf|loaves)?(?:s?)?$', Intent.CREATE_ORDER, ['productQuery', 'quantity', 'unit'], 'create_order_product_first'),

    # Create Order (without explicit quantity)
    (r'(?i)^(?:i want|order|buy|place an order for)\s+(.+)$', Intent.CREATE_ORDER, ['productQuery'], 'create_order'),
    (r'(?i)^(?:place an order|order something|i want to order)$', Intent.CREATE_ORDER, [], 'create_order_general'),

    # Cancel Order
    (r'(?i)(?:cancel|stop).*order\s*([a-z0-9_]+)?', Intent.CANCEL_ORDER, ['order_id'], 'cancel_order'),
    
    # Track Order
    (r'(?i)(?:track|where is|location).*order\s*([a-z0-9_]+)?', Intent.ORDER_TRACKING, ['order_id'], 'track_order'),
    
    # Order History
    (r'(?i)(?:previous orders|order history|past orders)', Intent.ORDER_HISTORY, [], 'order_history'),

    # Reorder
    (r'(?i)(?:reorder|order again|repeat order)', Intent.REORDER, [], 'reorder'),
    
    # Invoice Request
    (r'(?i)(?:invoice|bill|receipt)', Intent.INVOICE_REQUEST, [], 'invoice_request'),

    # Payment Status
    (r'(?i)(?:payment status|did you get my payment|is it paid)', Intent.PAYMENT_STATUS, [], 'payment_status'),

    # Billing Details
    (r'(?i)(?:billing details|billing info)', Intent.BILLING_DETAILS, [], 'billing_details'),

    # Account Details & Settings
    (r'(?i)(?:account details|my account)', Intent.ACCOUNT_DETAILS, [], 'account_details'),
    (r'(?i)(?:account settings|change settings)', Intent.ACCOUNT_SETTINGS, [], 'account_settings'),
    
    # Security Help
    (r'(?i)(?:security|login help|forgot password)', Intent.SECURITY_HELP, [], 'security_help'),

    # Offers
    (r'(?i)(?:offers|discounts|promotions|deals)', Intent.OFFERS, [], 'offers'),
    
    # Inventory Check
    (r'(?i)(?:do you have|is there any|stock of)\s+(.+)', Intent.INVENTORY_CHECK, ['productQuery'], 'inventory_check'),
    
    # Product Lookup / Price
    (r'(?i)(?:how much is|price of|cost of)\s+(.+)', Intent.PRODUCT_LOOKUP, ['productQuery'], 'product_lookup'),

    # Product Search
    (r'(?i)(?:search for|find product)\s+(.+)', Intent.PRODUCT_SEARCH, ['productQuery'], 'product_search'),
    
    # Product Details
    (r'(?i)(?:details of|tell me about)\s+(.+)', Intent.PRODUCT_DETAILS, ['productQuery'], 'product_details'),

    # Catalog
    (r'(?i)^(?:what do you have\??|give me all items|show me all products|show products|catalog|view catalog|what products do you have\??)$', Intent.CATALOG, [], 'catalog'),

    # Support Ticket
    (r'(?i)(?:contact support|speak to human|raise ticket|support ticket)', Intent.SUPPORT_TICKET, [], 'support_ticket'),

    # FAQ
    (r'(?i)(?:faq|frequently asked questions)', Intent.FAQ, [], 'faq'),
    
    # Help
    (r'(?i)\b(?:help|what can you do|support)\b', Intent.HELP, [], 'help'),

    # Navigation
    (r'(?i)^(?:main menu|menu)$', Intent.MAIN_MENU, [], 'main_menu'),
    (r'(?i)^(?:go back|back)$', Intent.GO_BACK, [], 'go_back'),
    (r'(?i)^(?:exit|quit|stop)$', Intent.EXIT, [], 'exit'),
    
    # Greeting
    (r'(?i)^(?:hi|hello|hey|greetings)\b', Intent.GREETING, [], 'greeting'),
]
