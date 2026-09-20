# Demo Guide

## Goal

The First Commit demo should be approximately three minutes and should
prove the product idea, AWS backbone, and an end-to-end operational
workflow.

## 0:00--0:20 --- Problem

> Businesses already use WhatsApp to communicate with customers, but
> conversations, orders, inventory, and fulfillment are disconnected.
> WBOS connects the customer conversation directly to business
> operations.

Show WhatsApp and the WBOS Command Center.

## 0:20--0:50 --- Customer Order

Use:

``` text
Hi
2
2 kg basmati rice
yes
```

Show the response and order creation.

## 0:50--1:10 --- Inventory

Show the stock deduction.

Say:

> Order creation and inventory deduction are performed transactionally
> in DynamoDB.

## 1:10--2:00 --- Kanban

Once browser validation is green, demonstrate:

``` text
NEW
 -> CONFIRMED
 -> PREPARING
 -> READY
 -> DELIVERY
 -> DELIVERED
```

Say:

> The Kanban is the operational control center. State changes are
> authenticated, validated by the backend state machine, persisted,
> audited, and emitted as EventBridge events.

Show corresponding WhatsApp status messages.

## 2:00--2:25 --- AWS Event Flow

Show:

``` text
Kanban
  -> Lambda
  -> DynamoDB
  -> EventBridge
  -> Notification Lambda
  -> WhatsApp
```

## 2:25--2:45 --- Security

Show Cognito/MFA and mention HMAC webhook validation, conditional
writes, and tenant-aware data access.

## 2:45--3:00 --- Closing

> WBOS turns WhatsApp from a communication channel into an operational
> interface for the business. AWS provides the event-driven backbone
> connecting conversations, orders, inventory, automation, and customer
> notifications.

## Do Not Demo

Never expose AWS credentials, Meta tokens, App Secrets, verification
tokens, internal scratch scripts, unsupported features, Bedrock as an
active feature, or simulated results presented as real customer
activity.

## Final Demo Gate

The Kanban sequence must be verified in the deployed browser before it
is used as the central demo sequence. The current validation history
includes a browser-side HTTP 500 that remains a release gate.
