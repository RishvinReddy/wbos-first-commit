# WBOS v2 — Conversational Business Operating System (First Commit AWS Edition)

> **"Run your business through conversation."**  
> Built for First Commit. AWS-Native, Serverless, Event-Driven.

---

## 1. Overview

**WBOS v2** is a cloud-native Conversational Business Operating System designed for modern retail and commerce. It enables customers to discover products, place orders, and track deliveries via WhatsApp, while empowering business owners and store managers to operate, query, and automate their enterprise through natural conversation.

WBOS v2 is a ground-up AWS implementation built during **First Commit**. It uses the earlier monolithic prototype (`WBOS v1`) solely as a domain and product reference, discarding legacy single-server architecture in favor of a resilient, multi-tenant serverless architecture.

---

## 2. Core Architectural Principles

1. **AI Interprets, Deterministic Logic Decides**: Amazon Bedrock classifies natural language intents and requests structured tool executions. All calculations, taxations, inventory adjustments, and status transitions are strictly executed by deterministic AWS Lambda functions.
2. **Tenant Isolation from Day One**: Every customer, order, product, and event is partitioned by a `tenantId`. No cross-tenant data leaks are possible.
3. **Single-Table Scalability**: All transactional entities live in an Amazon DynamoDB single-table schema (`WBOS_Store`), delivering single-digit millisecond latency regardless of dataset volume.
4. **Event-Driven Choreography**: State mutations emit strongly-typed events to **Amazon EventBridge**, decoupling core order processing from invoice generation (S3), notifications (WhatsApp), and analytics.
5. **Model-Agnostic Foundation**: Configurable Bedrock integration supporting any modern Foundation Model with tool calling (Claude, Amazon Nova, Mistral) via region-specific configuration.

---

## 3. High-Level Architecture

```text
                     WhatsApp (Customer / Business Owner)
                                     │
                                     ▼
                        Meta Cloud API / Webhook
                                     │
                                     ▼
                            AWS API Gateway
                        (REST & WebSocket APIs)
                                     │
                                     ▼
                           AWS Lambda (Ingress)
                                     │
                                     ▼
                        Amazon Bedrock Foundation Model
                         (Intent + Tool Routing)
                                     │
                     Structured Tool Invocation Request
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
   Customer Service            Order Service           Inventory Service
     (AWS Lambda)              (AWS Lambda)              (AWS Lambda)
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     ▼
                       Amazon DynamoDB (`WBOS_Store`)
                                     │
                                     ▼
                      Amazon EventBridge (`wbos-events`)
                                     │
             ┌───────────────────────┼───────────────────────┐
             ▼                       ▼                       ▼
    Invoice Generator          WhatsApp Notifier       Real-Time Analytics
       (AWS Lambda)              (AWS Lambda)             (AWS Lambda)
             │                       │                       │
             ▼                       ▼                       ▼
         Amazon S3            Meta Cloud API          CloudWatch / Metrics
```

---

## 4. Repository Structure

```text
wbos-first-commit/
├── README.md                           # This document
├── architecture/
│   ├── architecture.md                 # Deep-dive serverless topology & execution lifecycle
│   ├── data-model.md                   # Complete DynamoDB Single-Table specification & access patterns
│   ├── event-contracts.md              # EventBridge event schemas, routing rules & dead-letter policy
│   └── security.md                     # Zero-trust LLM boundary, tenant isolation & webhook security
├── contracts/
│   ├── tools.json                      # Amazon Bedrock tool definitions (OpenAPI/Bedrock Tool Spec)
│   ├── events.json                     # EventBridge event payload contracts
│   └── schemas/
│       ├── customer.json               # JSON Schema for Customer entity
│       ├── product.json                # JSON Schema for Product entity
│       ├── order.json                  # JSON Schema for Order & OrderItem entities
│       └── delivery.json               # JSON Schema for Delivery entity
└── docs/
    └── MVP.md                          # First Commit scope, 3-minute demo runbook & validation plan
```

---

## 5. Dual-Persona Experience

### A. Customer Persona (WhatsApp)
* *"I need 2 kg basmati rice, 1 packet milk, and bread."*
* Bedrock identifies `CREATE_ORDER`, resolves items against inventory, and requests delivery location.
* Real-time tracking link, live notifications, and digital invoices sent directly to chat.

### B. Business Owner Persona (WhatsApp / Web Dashboard)
* *"How much did we sell today?"* → Bedrock invokes `get_daily_sales` tool → Lambda aggregates DynamoDB transactions → *"Today's sales: ₹48,920 across 24 orders."*
* *"What's running low in stock?"* → Bedrock invokes `get_low_stock_products` → Instant procurement list.
* *"Send reminder to customers whose orders are ready."* → Bedrock triggers batch notification event via EventBridge.
