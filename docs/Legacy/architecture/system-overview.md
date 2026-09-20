# WBOS System Overview

The WhatsApp Business Operating System (WBOS) is built on an AWS-native, event-driven serverless architecture. This document serves as the entry point for understanding the system's structural components.

## Master Architecture Flow

```text
CUSTOMER
   ↓
WhatsApp
   ↓
Meta Cloud API Webhook
   ↓
API Gateway
   ↓
Ingress Lambda
   ↓
SQS Execution Queue
   ↓
Execution Lambda
   ↓
Deterministic Intent Engine
   ↓
DynamoDB (State/Context)
   ↓
EventBridge (wbos-events)
   ↓
Notification Lambda
   ↓
Meta Graph API
   ↓
WhatsApp
   ↓
CUSTOMER
```

## Dashboard Architecture

```text
OWNER
   ↓
Amplify (Next.js Frontend)
   ↓
Cognito + TOTP (Authentication)
   ↓
API Gateway (JWT Authorizer)
   ↓
Dashboard Lambda
   ↓
DynamoDB
```

## Detailed Architecture Documents

For deep-dive technical documentation on specific components, please explore the following:

- **[Current Architecture Details](current.md)**: Deep dive into the V2 serverless components, idempotency mechanisms, and webhook verification.
- **[Data Model](data-model.md)**: Explore the DynamoDB single-table design, Partition Keys, Sort Keys, and GSIs used for tracking conversations and state.
- **[Event Contracts](event-contracts.md)**: Understand the EventBridge schemas that act as the nervous system connecting business events together.
- **[Security Model](../security/security-model.md)**: Review the Cognito MFA enforcement, JWT authorization, and Secrets Manager architecture protecting the platform.
- **[Future Architecture Target](future.md)**: Preview the architectural targets for V6, integrating intelligent generative components into the deterministic flow.
