# WhatsApp Integration

## Overview

WBOS integrates with Meta's WhatsApp Cloud API for inbound customer
messages and automated outbound business responses.

## Inbound Flow

``` text
Customer WhatsApp
      |
Meta WhatsApp Cloud API
      |
API Gateway /webhook
      |
Ingress Lambda
      +--> HMAC validation
      +--> Message persistence
      +--> Idempotency
      |
SQS Execution Queue
```

## Webhook Verification

The GET challenge uses the configured verification token. POST requests
are validated using HMAC-SHA256 derived from the Meta App Secret.

Credentials are not stored in source code.

## Message Persistence

Inbound messages are persisted in DynamoDB conversation records.

Successful outbound messages are persisted after Meta returns a valid
message ID. Failed sends are recorded as failures with available Meta
error information.

## Message IDs and Status

Successful Meta responses return a real WhatsApp message ID (`wamid`).
WBOS stores it to correlate status updates.

Supported UI states include:

-   SENT
-   DELIVERED
-   READ
-   FAILED

Older status updates are prevented from overwriting a more advanced
state.

## Business Notifications

``` text
Kanban transition
   -> Order event
   -> EventBridge
   -> Notification Lambda
   -> Meta WhatsApp API
   -> Customer
```

## Security

Meta credentials belong in AWS Secrets Manager. Tokens, App Secrets, and
verification tokens must never be committed or exposed in public
documentation.

Any credential exposed during development should be rotated before
public release.

## Demo Guidance

Use a real test interaction and show the corresponding response in
WhatsApp. Never expose secrets during recording.
