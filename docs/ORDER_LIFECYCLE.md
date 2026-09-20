# Order Lifecycle

## Authoritative State Machine

``` text
NEW
 |
 | CONFIRM
 v
CONFIRMED
 |
 | START_PREPARATION
 v
PREPARING
 |
 | COMPLETE_PREPARATION
 v
READY
 |
 | DISPATCH
 v
DELIVERY
 |
 | DELIVER
 v
DELIVERED
```

Cancellation is a separate terminal state available only from permitted
early lifecycle states.

## Transition Control

``` text
Kanban
  -> POST /api/orders/{orderId}/transition
  -> Cognito JWT
  -> OrderTransitionFunction
  -> transition_order_state()
  -> DynamoDB conditional transaction
  -> EventBridge
```

The frontend does not directly change order status.

## Validity

-   NEW -\> CONFIRMED: valid
-   CONFIRMED -\> PREPARING: valid
-   NEW -\> DELIVERED: invalid
-   READY -\> NEW: invalid

## Worker and Driver Assignment

PREPARING can associate a packer/worker. DELIVERY can associate a
delivery driver.

## Auditability

Transitions record actor, previous state, new state, and relevant
assignment information.

## Events

Supported lifecycle events include:

-   `OrderConfirmed`
-   `OrderPreparationStarted`
-   `OrderPreparationCompleted`
-   `OrderDispatched`
-   `OrderDelivered`
-   `OrderCancelled`

## Customer Notifications

Lifecycle events can be routed through EventBridge to the notification
service, which sends the corresponding WhatsApp status update.

## Concurrency

DynamoDB conditional/transactional operations reject stale transitions
rather than allowing a newer state to be overwritten.

## Current Validation Note

Direct backend acceptance tests have passed the complete lifecycle and
stale-state rejection. The deployed browser Kanban has subsequently
shown an HTTP 500 during drag/drop, so browser-to-Lambda validation
remains a final release gate.
