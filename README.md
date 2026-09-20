# WBOS — WhatsApp Business Operating System

> **An AWS-native, event-driven business operations platform that turns WhatsApp conversations into operational workflows.**

WBOS connects **WhatsApp, orders, inventory, conversations, fulfillment, automation, and business operations** through a serverless AWS architecture.

The First Commit release focuses on building the **AWS event-driven operational core** of WBOS, with a deterministic conversational engine, real Meta WhatsApp integration, an operations dashboard, order lifecycle management, inventory workflows, EventBridge automation, authentication, MFA, and observability.

---

## 1. Overview

**WBOS (WhatsApp Business Operating System)** is a WhatsApp-first business operations platform designed for businesses that already communicate with customers through WhatsApp.

Instead of treating WhatsApp as only a messaging channel, WBOS treats the conversation as an **operational interface**.

A customer can interact through WhatsApp while the business manages the resulting operations through the WBOS Command Center.

```text
                    WBOS
                     │
        ┌────────────┼────────────┐
        │            │            │
   Conversations   Orders     Inventory
        │            │            │
        └────────────┼────────────┘
                     │
               EventBridge
                     │
        ┌────────────┼────────────┐
        │            │            │
    WhatsApp     Automation    Invoices
```

### First Commit focus

The current release establishes:

* Real WhatsApp Cloud API integration
* Deterministic conversational processing
* Order management
* Inventory management
* Order lifecycle state machine
* Kanban operations dashboard
* Event-driven architecture
* WhatsApp status notifications
* Conversation persistence
* Invoice infrastructure
* Automation Engine
* Cognito authentication
* TOTP MFA
* Tenant-aware data access
* AWS-native serverless infrastructure

---

# 2. Problem

Many small and medium-sized businesses already use WhatsApp as their primary customer communication channel.

However, the actual business operations behind those conversations are often fragmented.

A typical workflow may look like:

```text
Customer WhatsApp
       ↓
Business employee reads message
       ↓
Manually checks inventory
       ↓
Manually checks order status
       ↓
Updates spreadsheet/system
       ↓
Messages customer again
       ↓
Operations team separately processes order
```

This creates several problems:

* Customer conversations are disconnected from operational systems.
* Order updates require manual intervention.
* Inventory information is difficult to access conversationally.
* Fulfillment status is not automatically communicated.
* Operational events are not connected to customer communication.
* Duplicate processing can occur.
* There is limited visibility into the complete order lifecycle.
* Automation is difficult to scale.

WBOS addresses this by connecting the **customer conversation layer** directly to the **business operations layer**.

---

# 3. Solution

WBOS creates an event-driven bridge between WhatsApp and business operations.

```text
Customer
   ↓
WhatsApp
   ↓
Meta Cloud API
   ↓
API Gateway
   ↓
Ingress Lambda
   ↓
SQS
   ↓
Execution Lambda
   ↓
Intent + Entity Engine
   ↓
Business Services
   ↓
DynamoDB
   ↓
EventBridge
   ↓
Notifications / Automation / Invoices
```

The result is a system where:

> **A customer message can become a business operation, and a business operation can automatically become a customer notification.**

For example:

```text
Customer:
"Track my order"

        ↓

WBOS Intent Engine

        ↓

ORDER_TRACKING

        ↓

DynamoDB

        ↓

Order status:
OUT FOR DELIVERY

        ↓

EventBridge

        ↓

Notification Lambda

        ↓

WhatsApp

        ↓

"Your latest order is currently Out for Delivery.
Expected delivery: Today."
```

---

# 4. Core Features

## Customer Communication

* Real Meta WhatsApp Cloud API integration
* WhatsApp webhook verification
* HMAC-SHA256 request validation
* Inbound message persistence
* Automated outbound responses
* WhatsApp message status tracking
* Real Meta `wamid` correlation

## Conversational Operations

* Deterministic Intent Engine
* Natural-language intent recognition
* Entity extraction
* Product lookup
* Inventory lookup
* Order tracking
* Order history
* Order creation
* Order cancellation
* Invoice requests
* Catalog requests
* Conversational menu
* Stateful order workflow

## Order Operations

* Order creation
* Order lifecycle management
* Backend-authoritative state transitions
* Worker assignment
* Delivery-driver assignment
* Order cancellation
* Audit information
* Concurrency protection
* Event-driven customer notifications

## Inventory

* Product catalog
* Product search
* Inventory lookup
* Quantity/unit handling
* Transactional inventory deduction
* Inventory restoration on permitted cancellation
* Dashboard inventory visibility

## Operations Command Center

* Orders Kanban
* Conversations
* Inventory
* Analytics
* Automations
* Events
* Authentication
* MFA

## Automation

* Event-driven triggers
* Condition evaluation
* WhatsApp notifications
* Owner notifications
* Order updates
* Execution tracing
* Automation depth protection
* Visual automation builder

---

# 5. Architecture

WBOS follows a serverless, event-driven architecture.

```text
                         ┌─────────────────────┐
                         │      CUSTOMER       │
                         └──────────┬──────────┘
                                    │
                               WhatsApp
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Meta WhatsApp     │
                         │     Cloud API       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    API Gateway      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Ingress Lambda    │
                         │ HMAC + Idempotency  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Amazon SQS         │
                         │ Execution Queue      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Execution Lambda    │
                         │                     │
                         │ Intent Engine       │
                         │ Entity Extraction   │
                         │ Conversation State  │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          ┌────────────┐     ┌────────────┐     ┌────────────┐
          │  Orders    │     │ Inventory  │     │Conversations│
          └─────┬──────┘     └─────┬──────┘     └─────┬──────┘
                │                  │                  │
                └──────────────────┼──────────────────┘
                                   ▼
                         ┌─────────────────────┐
                         │     DynamoDB        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     EventBridge     │
                         │    wbos-events      │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       Notification             Invoice             Automation
         Lambda                 Lambda                Engine
              │                     │                     │
              ▼                     ▼                     ▼
        Meta WhatsApp              S3                Business
             API                                     Actions
```

The architecture intentionally separates:

* customer communication
* asynchronous execution
* business state
* domain events
* notifications
* automation
* dashboard operations

---

# 6. AWS Services

| AWS Service             | WBOS Responsibility                |
| ----------------------- | ---------------------------------- |
| **Amazon API Gateway**  | Webhook and dashboard API boundary |
| **AWS Lambda**          | Serverless business logic          |
| **Amazon SQS**          | Asynchronous execution queue       |
| **Amazon DynamoDB**     | Operational data and state         |
| **Amazon EventBridge**  | Event-driven orchestration         |
| **Amazon S3**           | Invoice/document storage           |
| **Amazon Cognito**      | Dashboard authentication           |
| **AWS Amplify**         | Dashboard hosting                  |
| **AWS Secrets Manager** | Meta credentials                   |
| **Amazon CloudWatch**   | Logs and observability             |
| **AWS SAM**             | Infrastructure as Code             |

### AWS architectural principle

AWS is not merely hosting WBOS.

> **AWS is the event-driven backbone connecting conversations, operations, automation, and customer communication.**

---

# 7. Conversational Flow

The current conversational engine is **deterministic**.

It does not depend on an LLM for the current First Commit execution path.

### Processing pipeline

```text
WhatsApp Message
       ↓
Webhook
       ↓
Ingress Lambda
       ↓
SQS
       ↓
Execution Lambda
       ↓
Intent Classification
       ↓
Entity Extraction
       ↓
Conversation State
       ↓
Business Service
       ↓
DynamoDB
       ↓
EventBridge
       ↓
WhatsApp Response
```

### Main conversational menu

```text
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
```

The internal `CATALOG` intent is also available for natural-language catalog requests.

### Stateful order example

```text
Customer:
2

WBOS:
What would you like to order?

Customer:
2 kg basmati rice

WBOS:
Basmati Rice — 2 kg
Please confirm your order.

Customer:
yes

WBOS:
Order created successfully.
```

The conversational state tracks the current workflow rather than treating every message as an unrelated request.

---

# 8. Order Lifecycle

WBOS uses a controlled order state machine:

```text
             ┌─────────────┐
             │     NEW     │
             └──────┬──────┘
                    │
                    ▼
             ┌─────────────┐
             │  CONFIRMED  │
             └──────┬──────┘
                    │
                    ▼
             ┌─────────────┐
             │  PREPARING  │
             └──────┬──────┘
                    │
                    ▼
             ┌─────────────┐
             │    READY    │
             └──────┬──────┘
                    │
                    ▼
             ┌─────────────┐
             │   DELIVERY  │
             └──────┬──────┘
                    │
                    ▼
             ┌─────────────┐
             │  DELIVERED  │
             └─────────────┘
```

The **Kanban Operations Center** is intended to be the main control surface for this lifecycle.

A transition follows:

```text
Kanban Drag & Drop
        ↓
Cognito JWT
        ↓
Protected API
        ↓
Order Transition Function
        ↓
State Validation
        ↓
DynamoDB Transaction / Conditional Write
        ↓
Audit
        ↓
EventBridge
        ↓
WhatsApp Notification
```

### Valid transitions

```text
NEW → CONFIRMED
CONFIRMED → PREPARING
PREPARING → READY
READY → DELIVERY
DELIVERY → DELIVERED
```

Invalid state jumps are rejected by the backend.

### Concurrency protection

If two operators attempt to transition the same order using stale state, DynamoDB conditional logic prevents one operation from silently overwriting the other.

---

# 9. Inventory & Transactions

Inventory is integrated directly into the order workflow.

Each product contains information such as:

```text
Product
├── ID
├── Name
├── Price
├── Stock
└── Unit
```

Example:

```text
Basmati Rice
Price: ₹150
Stock: 50 kg
Unit: kg
```

### Transactional order creation

```text
Customer confirms order
          ↓
Product resolution
          ↓
Unit validation
          ↓
Stock validation
          ↓
DynamoDB transaction
       ┌───────────────┐
       │ Create Order  │
       │ Deduct Stock  │
       └───────────────┘
```

The goal is to avoid a state where an order exists but the corresponding inventory deduction did not occur.

### Cancellation

For permitted cancellation states:

```text
Order cancelled
      ↓
Inventory restored
      ↓
Audit recorded
      ↓
OrderCancelled event
```

---

# 10. WhatsApp Integration

WBOS uses the **Meta WhatsApp Cloud API**.

### Inbound

```text
WhatsApp
   ↓
Meta
   ↓
API Gateway
   ↓
Ingress Lambda
   ↓
HMAC Verification
   ↓
DynamoDB
   ↓
SQS
```

### Outbound

```text
EventBridge
     ↓
Notification Lambda
     ↓
Meta Graph API
     ↓
WhatsApp
```

### Message lifecycle

WBOS tracks Meta message identifiers and status updates.

```text
SENT
  ↓
DELIVERED
  ↓
READ
```

Failed messages can also be represented as:

```text
FAILED
```

The system stores the real Meta `wamid` returned by successful outbound requests and uses it to correlate subsequent status webhooks.

### Security

Meta credentials are stored in AWS Secrets Manager.

No Meta access token, App Secret, or webhook verification token should be committed to the repository.

---

# 11. Security

WBOS uses multiple security layers.

## Dashboard

```text
User
 ↓
Cognito
 ↓
TOTP MFA
 ↓
JWT
 ↓
API Gateway
 ↓
Protected Lambda
```

## WhatsApp Webhooks

Meta requests are verified using:

```text
HMAC-SHA256
```

before entering the normal processing pipeline.

## Data protection

The architecture uses:

* tenant-scoped DynamoDB keys
* IAM-controlled AWS resources
* Cognito JWT authorization
* MFA
* HMAC validation
* Secrets Manager
* conditional writes
* transactional operations
* idempotency controls

## Security principle

> **The frontend is not trusted with business-state authority.**

The backend validates:

* identity
* authorization
* order state
* inventory
* transitions
* business operations

---

# 12. Automation Engine

WBOS includes an event-driven Automation Engine.

```text
Business Event
      ↓
EventBridge
      ↓
Automation Engine
      ↓
Trigger Evaluation
      ↓
Condition Evaluation
      ↓
Action
```

Supported action concepts include:

* `SEND_WHATSAPP`
* `NOTIFY_OWNER`
* `UPDATE_ORDER`

### Example

```text
OrderCreated
     ↓
Order value > ₹5,000
     ↓
Condition = TRUE
     ↓
Notify Owner
```

### Automation tracing

Execution states include:

```text
QUEUED
RUNNING
SUCCESS
FAILED
SKIPPED
WAITING
```

A depth guard is used to reduce uncontrolled event recursion.

---

# 13. Dashboard

The WBOS Command Center is built with **Next.js** and hosted through **AWS Amplify**.

```text
AWS Amplify
     ↓
Next.js
     ↓
Cognito + MFA
     ↓
API Gateway
     ↓
Dashboard Lambda
     ↓
DynamoDB
```

## Main areas

### Overview

Operational summary and system health.

### Conversations

Live customer conversation history with WhatsApp message states.

### Orders

Operational Kanban:

```text
NEW
CONFIRMED
PREPARING
READY
DELIVERY
DELIVERED
CANCELLED
```

### Inventory

Product and stock visibility.

### Automations

Automation builder, configurations, execution traces, and supported actions.

### Analytics

Business and operational metrics.

### Events

Event-driven system activity.

---

# 14. Project Structure

```text
wbos-first-commit/
│
├── dashboard/
│   ├── src/
│   ├── components/
│   ├── lib/
│   └── ...
│
├── src/
│   ├── core/
│   │   ├── execution.py
│   │   ├── auth.py
│   │   ├── db.py
│   │   └── evaluator.py
│   │
│   ├── handlers/
│   │   ├── ingress.py
│   │   ├── notification.py
│   │   ├── dashboard.py
│   │   ├── invoice.py
│   │   └── automation_engine.py
│   │
│   ├── services/
│   │   ├── orders.py
│   │   ├── products.py
│   │   ├── conversations.py
│   │   ├── automations.py
│   │   └── ...
│   │
│   └── intent/
│       ├── classifier.py
│       ├── intents.py
│       └── patterns.py
│
├── scripts/
│
├── docs/
│
├── template.yaml
├── requirements.txt
├── Makefile
├── README.md
└── .gitignore
```

---

# 15. Local Development

## Prerequisites

Install:

* Python 3.12
* Node.js
* npm
* AWS CLI
* AWS SAM CLI
* Git

## Clone

```bash
git clone https://github.com/RishvinReddy/wbos-first-commit.git
cd wbos-first-commit
```

## Backend

Create/activate the Python environment and install dependencies:

```bash
pip install -r requirements.txt
```

Build the SAM application:

```bash
sam build
```

Validate:

```bash
sam validate --lint
```

## Dashboard

```bash
cd dashboard
npm install
npm run build
```

For local development:

```bash
npm run dev
```

---

# 16. AWS Deployment

WBOS infrastructure is defined using **AWS SAM**.

## Build

```bash
sam build
```

## Validate

```bash
sam validate --lint
```

## Deploy

```bash
sam deploy
```

The First Commit deployment uses:

```text
Stack:
wbos-first-commit

Region:
ap-south-1
```

After deployment, verify the CloudFormation stack:

```bash
aws cloudformation describe-stacks \
  --stack-name wbos-first-commit \
  --region ap-south-1 \
  --query "Stacks[0].StackStatus"
```

Expected successful state:

```text
UPDATE_COMPLETE
```

---

# 17. Environment Configuration

Sensitive configuration is intentionally separated from application source code.

### AWS

The application uses AWS-managed configuration for:

* DynamoDB
* EventBridge
* SQS
* S3
* Cognito
* Secrets Manager
* API Gateway

### Meta

Sensitive WhatsApp configuration is stored in:

```text
AWS Secrets Manager
```

The application requires the appropriate Meta:

* access token
* App Secret
* webhook verification configuration
* WhatsApp Business configuration

### Important

Do **not** commit:

```text
.env
credentials
access tokens
App Secrets
verification tokens
AWS keys
```

to Git.

---

# 18. Testing

Testing covers multiple layers.

## Unit / Logic

* Intent classification
* Entity extraction
* Quantity parsing
* Product matching
* Order-state validation

## Integration

* DynamoDB
* EventBridge
* SQS
* API Gateway
* Lambda
* Cognito

## WhatsApp

* Webhook verification
* HMAC validation
* Inbound messages
* Outbound messages
* Real `wamid`
* SENT
* DELIVERED
* READ
* FAILED

## Order Lifecycle

```text
NEW
 ↓
CONFIRMED
 ↓
PREPARING
 ↓
READY
 ↓
DELIVERY
 ↓
DELIVERED
```

The backend transition and concurrency tests have been validated.

### Current release gate

The deployed browser Kanban has recently produced an **HTTP 500 / Internal Server Error** during drag-and-drop.

Therefore, the browser Kanban must be revalidated before the final demo is considered complete.

The backend passing its transition tests does **not** by itself prove that the deployed browser path is working.

---

# 19. Demo

The recommended First Commit demo is approximately **2–3 minutes**.

## 1. Problem

Explain that businesses already communicate through WhatsApp but their operational systems are disconnected.

## 2. Customer Interaction

Show:

```text
Hi
```

Then the WBOS menu.

## 3. Order

Demonstrate:

```text
2
2 kg basmati rice
yes
```

## 4. Inventory

Show the corresponding inventory change.

## 5. Operations

Show the order in the Kanban.

Once browser validation is complete:

```text
NEW
 → CONFIRMED
 → PREPARING
 → READY
 → DELIVERY
 → DELIVERED
```

## 6. WhatsApp

Show the customer receiving the order status updates.

## 7. AWS

Briefly show:

```text
API Gateway
 ↓
Lambda
 ↓
SQS
 ↓
DynamoDB
 ↓
EventBridge
 ↓
Notification Lambda
 ↓
WhatsApp
```

## 8. Security

Mention:

* Cognito
* MFA
* HMAC
* Secrets Manager
* conditional writes
* idempotency
* tenant-aware data

### Demo rule

Never expose:

* AWS credentials
* Meta access tokens
* App Secrets
* verification tokens
* private customer information

---

# 20. Current Limitations

WBOS First Commit is an **MVP/hackathon implementation**, not a production-certified enterprise platform.

Current limitations include:

### Kanban browser validation

The backend transition system is implemented and directly tested, but the deployed browser currently has a drag/drop HTTP 500 that must be resolved before claiming full browser validation.

### Generative AI

Amazon Bedrock is **not active in the current execution path** because the required account authorization was unavailable during development.

The current system uses deterministic intent processing.

### Dashboard outbound composer

The dashboard composer is not currently a fully connected manual outbound messaging system.

Automated customer responses are handled through the WhatsApp event-driven notification path.

### CRM

The full CRM vision is not yet implemented.

### Payments

A complete payment gateway integration is not currently implemented.

### Customers / Delivery

Some broader dashboard areas remain less complete than the core operational workflows.

### Production hardening

A production deployment would require additional:

* threat modeling
* penetration testing
* privacy review
* disaster recovery testing
* backup validation
* deeper IAM review
* monitoring/alerting
* operational runbooks

---

# 21. Roadmap

WBOS is designed as a staged platform.

## V2 — Event-Driven Core

**Current First Commit release**

* WhatsApp
* Conversations
* Orders
* Inventory
* EventBridge
* Automation
* Dashboard
* Authentication
* MFA
* Invoices

## V3 — Conversational Commerce

* richer entity extraction
* broader catalog operations
* advanced reorder workflows
* richer payment workflows

## V4 — CRM

* Leads
* Customer lifecycle
* Sales pipeline
* Segmentation
* Human handoff

## V5 — Automation Platform

* Advanced triggers
* Advanced conditions
* More actions
* Scheduling
* Workflow templates
* Automation analytics

## V6 — Business Intelligence

* Business-owner queries
* Operational insights
* Anomaly detection
* Advanced analytics

## Future Intelligence Layer

Amazon Bedrock can be evaluated for:

* richer natural-language understanding
* business-owner intelligence
* intelligent workflow assistance
* advanced conversational experiences

The current release does **not** claim these capabilities are active.

---

# 22. Development During First Commit

WBOS First Commit was developed as part of the **First Commit** hackathon/event within the Bharat Builds Tour ecosystem.

The implementation focused on building and integrating the AWS event-driven core rather than presenting an existing standalone system as newly developed.

Development concentrated on:

```text
WhatsApp
   ↓
AWS
   ↓
Event-driven processing
   ↓
Business operations
   ↓
Automation
```

Major development areas included:

* AWS serverless infrastructure
* Meta WhatsApp integration
* deterministic conversational engine
* DynamoDB data model
* SQS asynchronous execution
* EventBridge event architecture
* order state machine
* inventory operations
* automation engine
* Cognito authentication
* TOTP MFA
* operations dashboard
* invoice infrastructure
* WhatsApp status tracking
* observability

The repository history is maintained as part of the project development record.

---

# 23. AI-Assisted Development

AI-assisted development tools were used during the engineering process for:

* architecture exploration
* implementation assistance
* debugging
* code review
* documentation
* test planning
* troubleshooting
* development workflow acceleration

The primary development workflow included **Antigravity IDE** and conversational AI assistance.

AI assistance was used as an engineering aid; the resulting implementation was reviewed, tested, deployed, and validated against the actual AWS environment.

The current WBOS execution architecture itself should not be described as generative-AI-powered.

### Important distinction

```text
AI-assisted development
        ≠
AI-powered runtime
```

The current runtime uses deterministic business logic and AWS event-driven services.

---

# 24. License

This project is currently developed as a **First Commit hackathon project**.

Unless a license file is added to the repository, no open-source license should be assumed.

If the repository is intended to be released as open source, a specific license such as MIT, Apache-2.0, or another appropriate license should be added as a separate `LICENSE` file.

---

# WBOS

**WhatsApp Business Operating System**

```text
WhatsApp
    ↓
Conversation
    ↓
Intent
    ↓
Business Operation
    ↓
DynamoDB
    ↓
EventBridge
    ↓
Automation
    ↓
Customer
```

> **WBOS turns WhatsApp from a communication channel into an operational interface for the business.**

**Built with AWS • WhatsApp • Serverless • Event-Driven Architecture**
