# Conversational Engine

## Purpose

The WBOS conversational engine converts WhatsApp messages into
deterministic business actions and customer responses.

## Processing Flow

``` text
Inbound message
   |
Ingress
   |
SQS
   |
Execution
   +--> Intent classification
   +--> Entity extraction
   +--> Conversation state
   +--> Business service
   |
EventBridge
   |
Customer response
```

## 22-Option Menu

1.  Track an order
2.  Place an order
3.  Cancel an order
4.  Order history
5.  Reorder
6.  Check product price
7.  Check inventory
8.  Search products
9.  Product details
10. Offers
11. Payment status
12. Invoice
13. Billing details
14. Account details
15. Account settings
16. Security help
17. Help
18. Contact support
19. FAQ
20. Main menu
21. Back
22. Exit

The internal `CATALOG` intent remains available for natural-language
catalog requests.

## Stateful Order Workflow

``` text
AWAITING_PRODUCT
      |
AWAITING_QUANTITY
      |
AWAITING_CONFIRMATION
      |
CREATE ORDER
```

Conversation state stores workflow context such as intent, step, product
identity, quantity/unit, timestamps, and expiration metadata.

## Entity Normalization

For example:

``` text
2 kg basmati rice
```

becomes conceptually:

``` json
{
  "quantity": 2,
  "unit": "kg",
  "productQuery": "basmati rice"
}
```

Product resolution is separated from intent classification.

## Confirmation

The order flow confirms the product, quantity, unit, stock, and final
action before creating the order.

## Deterministic Behavior

Supported requests have predictable outcomes. Unsupported or ambiguous
requests are routed to help/menu behavior rather than being represented
as successful business actions.

## Future Intelligence

Amazon Bedrock remains a future option for richer natural-language
understanding and business-owner intelligence. It is not active in the
current First Commit execution path.
