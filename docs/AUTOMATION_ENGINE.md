# Automation Engine

## Overview

The Automation Engine converts supported business events into
configurable operational actions.

## Architecture

``` text
Domain Event
    |
EventBridge
    |
Automation Engine
    |
    +--> Trigger matching
    +--> Condition evaluation
    +--> Depth protection
    |
Action executor
    +--> WhatsApp notification
    +--> Owner notification
    +--> Order update
```

## Components

-   `src/services/automations.py` --- automation configuration
-   `src/core/evaluator.py` --- trigger/condition evaluation
-   `src/core/actions.py` --- supported action execution
-   `src/handlers/automation_engine.py` --- event-driven execution
-   EventBridge --- event routing

## Supported Actions

The current implementation supports concepts including:

-   SEND_WHATSAPP
-   NOTIFY_OWNER
-   UPDATE_ORDER

Unsupported actions/templates should remain explicitly unavailable.

## Execution Tracing

Automation runs use states including:

-   QUEUED
-   RUNNING
-   SUCCESS
-   FAILED
-   SKIPPED
-   WAITING

## Safety

An execution-depth guard reduces uncontrolled event recursion. Actions
should remain idempotent where the underlying operation supports it.

## Demonstrated Workflows

Seeded automation examples include high-value order alerts, low-stock
alerts, and order-delivery notifications.

Not every possible automation combination is implemented.

## UI

The dashboard includes a visual automation builder for creating,
editing, publishing, and dry-running automation configurations.
