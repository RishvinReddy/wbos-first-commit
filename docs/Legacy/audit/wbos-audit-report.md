> Audit scope: First Commit deployment snapshot
> 
> This document describes the implementation and verification
> status at the time of the audit. It does not describe future
> WBOS capabilities.

# WBOS SYSTEM AUDIT

**Positioning Statement:** 
> WBOS is a live, AWS-native, event-driven WhatsApp Business Operating System prototype with a verified end-to-end customer messaging workflow, Cognito-protected operational dashboard, deterministic intent engine, DynamoDB persistence, EventBridge orchestration, and Meta WhatsApp Cloud API integration.

---

## 01 Executive Summary
WBOS successfully implements a real-time WhatsApp integration backed by a serverless AWS architecture. The core operational loop (receive message -> infer intent -> trigger domain service -> reply to WhatsApp) is fully functional and live. The owner dashboard is protected by AWS Cognito and connects directly to live DynamoDB tables.

## 02 System Architecture
**Meta → API Gateway → Lambda → SQS → Lambda → EventBridge → Lambda → Meta**
The system correctly isolates the synchronous public webhook from the asynchronous business logic using SQS.

## 03 Customer Journey
```text
CUSTOMER
   │ "Track my order"
   ▼
WHATSAPP
   │ Meta Cloud API webhook
   ▼
API GATEWAY
   │ POST /webhook
   ▼
INGRESS LAMBDA
   ├── Verify X-Hub-Signature-256
   ├── Resolve tenant/customer
   ├── Idempotency check
   └── Persist inbound conversation
   │
   ▼
SQS EXECUTION QUEUE
   │
   ▼
EXECUTION LAMBDA
   ├── Intent Engine (ORDER_TRACKING)
   ├── Domain service (Order state)
   └── EventBridge (CustomerReplyRequested)
           │
           ▼
   NOTIFICATION LAMBDA
           ├── Generate reply
           ├── Meta Graph API
           ▼
        WHATSAPP
           ▼
        CUSTOMER
```

## 04 Owner Dashboard Journey
```text
OWNER
 │
 ▼
Amplify
 │
 ▼
Cognito Authenticator (Username/Password + TOTP)
 │
 ▼
JWT
 │
 ▼
Next.js Dashboard
 │
 ▼
API Gateway (Cognito Authorizer)
 │
 ▼
Dashboard Lambda
 │
 ▼
DynamoDB
```

## 05 - 07 Route & API Inventories
**Frontend Routes:** `/` (Overview), `/orders`, `/conversations`, `/inventory`, `/events`, `/customers`, `/delivery`.
**Dashboard APIs:** `/api/metrics`, `/api/orders`, `/api/inventory`, `/api/events`, `/api/conversations`, `/api/conversations/{id}`.
**Webhook APIs:** `GET /webhook`, `POST /webhook` (No JWT Auth).

## 08 Cognito & MFA
* **User Pool:** `wbos-dashboard-pool`
* **MFA Configuration:** `ON` (SOFTWARE_TOKEN_MFA)
* **Status:** Verified in CloudFormation.

## 09 Lambda Inventory
* **IngressFunction:** Handles webhook, writes DynamoDB, pushes to SQS.
* **ExecutionFunction:** Reads SQS, classifies intent, publishes EventBridge.
* **NotificationFunction:** Responds to EventBridge, calls Meta API, writes DynamoDB.
* **DashboardFunction:** Serves authenticated API requests.
* **DashboardEventFunction:** Broadcasts backend events.
* **InvoiceFunction:** Generates PDF invoices and writes to S3 bucket.

## 10 SQS & Event Source Mappings (CLARIFICATION ON DLQ)
**Important Note:** The report originally stated `ExecutionQueue` uses `WBOSEventsDLQ` as its DLQ. **This is factually correct and verifiable in `template.yaml`.** The `ExecutionQueue` specifies `deadLetterTargetArn: !GetAtt WBOSEventsDLQ.Arn`. The system explicitly shares this DLQ queue for both EventBridge failures and SQS execution failures.
* **VisibilityTimeout:** 90s (Safely exceeds the 60s Lambda timeout).
* **MaxReceiveCount:** 3

## 11 EventBridge Bus & Rules
Bus: `wbos-events`. Rules capture `OrderCreated`, `InvoiceGenerated`, `CustomerReplyRequested` and route to `InvoiceFunction`, `NotificationFunction`, and `DashboardEventFunction`. DLQ targets `WBOSEventsDLQ`.

## 12 DynamoDB Schema
Single table design (`WBOS_Store`) with `PK`, `SK`, and 3 Global Secondary Indexes.

## 13 S3 / Invoice Flow
`InvoiceBucket` stores generated PDF invoices. Lifecycle is governed by `OrderCreated` events.

## 14 Secrets Manager
`WBOS_Meta_Credentials` securely stores Meta tokens. Access is strictly granted to `IngressFunction` (for signature validation) and `NotificationFunction` (for sending messages). 

## 15 IAM Permission Matrix
Strict least privilege applied. e.g., `NotificationFunction` can read secrets and write to `WBOS_Store`, but has no SQS permissions. `ExecutionFunction` can read SQS and publish to EventBridge.

## 16 Meta WhatsApp Integration
Fully verified via live end-to-end messaging.

## 17 Intent Engine
Deterministic classification via rules, fully decoupled from LLM stochasticity to ensure reliable hackathon demonstrations.

## 18 Conversation Persistence & 19 Idempotency
Inbound messages insert an idempotency record (`IDEMPOTENCY#...`). Duplicate Meta webhooks are dropped.

## 20 Tenant Isolation
Dashboard requests resolve `tenantId` natively from the server-side `resolve_dashboard_context(event)` via Cognito JWT claims. The browser does not pass `tenantId`.

## 21 CORS
The dashboard API implements `OPTIONS /api/{proxy+}` without auth. This successfully fixed the browser `Failed to fetch` errors on live environments.

## 22 Error Handling & 23 Retry & DLQ
All async paths (SQS and EventBridge) specify a DLQ (`WBOSEventsDLQ`) and retry rules. 

## 24 Logging & Observability
Standard CloudWatch logging enabled.

## 25 Demo vs Live Data
Overview, Orders, Conversations, Inventory, Events are **LIVE**. Customers and Delivery are **DEMO**.

## 26 UI Interaction Audit (COMPOSER CLARIFICATION)
The Conversations composer and Action buttons were recently made accessible. 
* **Action Buttons:** Trigger explicit frontend `alert()` dialogs. (e.g. "Viewing customer profile coming soon!")
* **Message Composer:** Unlocked but currently operates as **FRONTEND-ONLY UI STATE**. Typing and sending a message optimistically appends it to the UI, but it **does not** call Meta. *Recommendation: Disable the composer input before final demo, or keep it explicitly noted that it is UI-only to avoid misleading judges.*

## 27 Menu / Navigation Audit
Fully implemented via Next.js App Router and sidebar navigation.

## 28 Environment Variables
No sensitive credentials exist in the frontend `.env`.

## 29 Deployment Pipeline
AWS Amplify builds the frontend; SAM deploys the backend.

## 30 Security Audit
Safe for hackathon deployment. Old Meta tokens have been revoked.

## 31 Hackathon Demo Path
* Log in via Cognito MFA.
* Send "Track my order" from WhatsApp phone.
* Watch message arrive in Conversations.
* Watch Intent Engine respond on WhatsApp.

## 32 Known Limitations
Outbound messaging from the Dashboard is unimplemented (Composer is UI stub). Some sidebar tabs (Customers, Delivery) use demo data.

## 33 Final Readiness Matrix

| System            |  Live | Tested | Secure | Demo-ready | Notes                    |
| ----------------- | ----: | -----: | -----: | ---------: | ------------------------ |
| WhatsApp inbound  |     ✅ |      ✅ |      ✅ |          ✅ | Proven                   |
| Intent Engine     |     ✅ |      ✅ |      ✅ |          ✅ | Deterministic            |
| Order lookup      |     ✅ |      ✅ |      ✅ |          ✅ | Read path                |
| WhatsApp outbound |     ✅ |      ✅ |      ✅ |          ✅ | Proven                   |
| Conversations     |     ✅ |      ✅ |      ✅ |          ✅ | Real persistence         |
| Dashboard auth    |     ✅ |     ⚠️ |      ✅ |          ✅ | MFA needs explicit test  |
| Orders UI         |     ✅ |     ⚠️ |      ✅ |          ✅ | Browser verification     |
| Inventory UI      |     ✅ |     ⚠️ |      ✅ |          ✅ | Browser verification     |
| Event UI          |     ✅ |     ⚠️ |      ✅ |          ✅ | Verify                   |
| Customers         |     ❌ |    N/A |    N/A |         ⚠️ | Demo                     |
| Delivery          |     ❌ |    N/A |    N/A |         ⚠️ | Demo                     |
| Composer          | FRONTEND ONLY |  N/A |  ✅ |      ⚠️ | **UI Stub. Does not call backend.** |
| Create order      |     ❌ |    N/A |    N/A |         ⚠️ | Stub                     |
| Send invoice      |     ❌ |    N/A |    N/A |         ⚠️ | Stub                     |
| EventBridge DLQ   |     ✅ |     ⚠️ |      ✅ |          ✅ | Shared DLQ Queue |
| SQS execution DLQ |     ✅ |     ⚠️ |      ✅ |          ✅ | Shared DLQ Queue |

