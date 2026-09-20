# WBOS Architecture

## Overview

WBOS (WhatsApp Business Operating System) is a WhatsApp-first business
operations platform connecting customer conversations to orders,
inventory, operational state, notifications, invoices, and automation
through an AWS-native event-driven architecture.

The current First Commit release uses a **deterministic Intent Engine**.
Amazon Bedrock is a future integration target and is not part of the
current execution path.

## System Model

``` text
Customer
   |
 WhatsApp
   |
Meta WhatsApp Cloud API
   |
API Gateway
   |
Ingress Lambda
   |
SQS Execution Queue
   |
Execution Lambda
   |
   +--> Deterministic Intent / Entity Engine
   +--> Conversation State
   +--> Orders
   +--> Products / Inventory
   |
DynamoDB
   |
EventBridge
   +--> Notification Lambda --> Meta WhatsApp
   +--> Invoice Lambda ------> S3
   +--> Automation Engine
   +--> Dashboard Events
```

The business Command Center is a Next.js dashboard hosted through AWS
Amplify. Dashboard APIs are protected by Amazon Cognito JWT
authorization and MFA.

## Core Components

  -----------------------------------------------------------------------
  Component                           Responsibility
  ----------------------------------- -----------------------------------
  Meta WhatsApp Cloud API             Customer messaging

  API Gateway                         Webhook and dashboard API boundary

  Ingress Lambda                      Webhook verification, persistence,
                                      idempotency, queueing

  SQS                                 Asynchronous execution

  Execution Lambda                    Intent classification and
                                      conversational orchestration

  Deterministic Intent Engine         Intent/entity extraction without an
                                      LLM

  DynamoDB                            Orders, products, inventory,
                                      conversations, state, audits

  EventBridge                         Domain-event backbone

  Notification Lambda                 WhatsApp outbound delivery

  Invoice Lambda                      Invoice generation and S3 storage

  Automation Engine                   Event-driven automation

  Dashboard Lambda                    Protected Command Center API

  Cognito                             Identity and MFA

  Amplify                             Dashboard hosting

  S3                                  Invoice/document storage
  -----------------------------------------------------------------------

## Design Principles

-   **Event-driven:** business events are published and consumed by
    independent services.
-   **Backend-authoritative state:** the dashboard never directly
    mutates order status.
-   **Transactional operations:** order creation and inventory deduction
    use DynamoDB transactional logic.
-   **Idempotency:** duplicate processing is controlled with idempotency
    and conditional mechanisms.
-   **Separation of concerns:** orchestration is separated from domain
    services.
-   **Tenant isolation:** tenant identifiers scope data access.

## Repository Boundaries

-   `src/` --- backend Lambda functions and services
-   `dashboard/` --- Next.js Command Center
-   `scripts/` --- catalog and maintenance scripts
-   `template.yaml` --- AWS SAM infrastructure
-   `docs/` --- technical documentation

## Current Scope

The First Commit release focuses on WhatsApp messaging, deterministic
conversational workflows, orders, inventory, conversation persistence,
EventBridge, invoices, automation, authentication/MFA, and the
operations dashboard. CRM expansion, generative AI, marketing, advanced
payments, and broader business-agent functionality remain roadmap items.
