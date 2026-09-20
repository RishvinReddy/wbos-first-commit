# Testing and Acceptance

## Testing Strategy

WBOS testing is divided into:

1.  parser/unit tests
2.  service tests
3.  infrastructure validation
4.  live AWS integration tests
5.  WhatsApp end-to-end tests
6.  dashboard acceptance tests

## Conversational Test

Example:

``` text
Hi
2
2 kg basmati rice
yes
```

Expected:

1.  Main menu
2.  Place-order flow
3.  Product/quantity resolution
4.  Confirmation
5.  Order creation

## Inventory Acceptance

``` text
stock_after = stock_before - ordered_quantity
```

For a permitted cancellation:

``` text
stock_after_cancel = stock_after_order + ordered_quantity
```

## Order Lifecycle Acceptance

``` text
NEW
 -> CONFIRMED
 -> PREPARING
 -> READY
 -> DELIVERY
 -> DELIVERED
```

Worker and driver assignment must be validated at the corresponding
transitions.

## Concurrency Acceptance

A stale transition should return a conflict rather than overwrite newer
state. The tested behavior is HTTP 409 with an order-state conflict
message.

## WhatsApp Acceptance

Verify:

-   Meta webhook verification
-   HMAC validation
-   inbound persistence
-   SQS execution
-   outbound Meta API acceptance
-   real WAMID persistence
-   SENT/DELIVERED/READ updates

## EventBridge Acceptance

Verify lifecycle events are published and routed to expected consumers.

## Dashboard Acceptance

Verify:

-   Cognito authentication
-   MFA
-   orders API
-   inventory API
-   conversations API
-   event/activity views
-   Kanban state rendering
-   polling refresh

## Current Release Blocker

Backend transition acceptance has passed the lifecycle and stale-state
tests. The currently deployed browser Kanban has recently displayed
`Internal Server Error` during drag/drop.

Therefore browser Kanban acceptance is **not** marked complete until the
Lambda failure is traced and the deployed browser flow is retested.

## Release Gate

-   [ ] Kanban NEW -\> CONFIRMED works in browser
-   [ ] Full lifecycle works in browser
-   [ ] WhatsApp update appears after each transition
-   [ ] Inventory changes are visible
-   [ ] No credentials are exposed
-   [ ] README is current
-   [ ] Demo video is recorded
