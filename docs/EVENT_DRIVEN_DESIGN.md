# Event-Driven Design

## Purpose

EventBridge is the business event backbone of WBOS. It decouples
business operations from downstream consumers.

## Event Bus

``` text
wbos-events
```

## Domain Events

Examples include:

-   `OrderCreated`
-   `OrderConfirmed`
-   `OrderPreparationStarted`
-   `OrderPreparationCompleted`
-   `OrderDispatched`
-   `OrderDelivered`
-   `OrderCancelled`
-   `CustomerReplyRequested`
-   `InvoiceGenerated`
-   automation execution events

## Event Flow

``` text
Business service
      |
EventBridge
      |
      +-------------------+
      |                   |
Notification       Invoice / Automation
      |                   |
WhatsApp             S3 / actions
```

## Order Events

Order transition events contain the order identity and, where needed,
customer destination information so downstream notification logic does
not need to depend directly on the Kanban implementation.

## Benefits

-   loose coupling
-   independent scaling
-   asynchronous processing
-   reusable events
-   clearer failure boundaries
-   extensibility through new consumers

## Failure Handling

CloudWatch provides observability and SQS dead-letter handling is used
where configured. Failed downstream actions should remain observable and
should not be represented as successful.

## Automation

The Automation Engine consumes supported events, evaluates
triggers/conditions, and executes supported actions.

## Event Contract Principle

Event producers own the domain event contract. Consumers depend on the
contract rather than another function's internal implementation.
