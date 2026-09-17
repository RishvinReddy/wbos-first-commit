# WBOS v2 — First Commit MVP Scope & 3-Minute Demo Runbook

## 1. MVP Feature Scope

The First Commit build delivers a fully functional, end-to-end conversational business operating system centered around 5 core milestones:

1. **Conversational Ordering (Customer Persona)**:
   * Natural language shopping list parsing via Amazon Bedrock.
   * Multi-item order creation with automatic 5% GST and delivery fee computation.
   * WhatsApp location pin handling & nearest branch mapping.
2. **Business Owner Intelligence (Executive Persona)**:
   * Conversational operational commands: *"How much did we sell today?"*, *"Which products are low in stock?"*, *"Show pending orders"*.
   * Bedrock translates natural language to deterministic DynamoDB analytics queries.
3. **Deterministic State Machine & Single-Table Storage**:
   * Order lifecycle transitions (`DRAFT` → `PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED`).
   * DynamoDB `TransactWriteItems` for atomic stock decrement and order creation.
4. **Event-Driven Cloud Automation**:
   * EventBridge bus (`wbos-events`) coordinates asynchronous downstream workflows.
   * S3 digital PDF tax invoice generation and pre-signed WhatsApp link dispatch.
5. **Modern Web Command Center**:
   * Store manager order queue with packing checklist.
   * Live rider dispatch portal with simulated GPS delivery tracking.
   * Real-time telemetry feed and Bedrock agent execution inspect log.

---

## 2. The 3-Minute Winning Demo Script

The First Commit rules specify strict 3-minute presentations. Every second counts.

```text
0:00 - 0:30 | The Problem & The Customer Order (WhatsApp)
0:30 - 1:15 | Bedrock Tool Orchestration & Store Packing
1:15 - 2:00 | EventBridge Automation & S3 Digital Invoice
2:00 - 2:40 | The Business Owner's Conversational Superpower
2:40 - 3:00 | Architecture & AWS Native Scalability Wrap-Up
```

---

### Step-by-Step Demo Flow

#### Minute 0:00 - 0:30 | Customer Natural Language Order
* **Action**: Open the WhatsApp Customer Chat on mobile / simulator.
* **Input**: *"Hey, I need 2 kg basmati rice, 1 packet milk, and some butter to Sector 15 Belapur."*
* **Voiceover**:
  > *"Every small business struggles with fragmented commerce tools. With WBOS, your entire business runs through conversation. A customer messages on WhatsApp in free-form English, Hindi, or conversational shorthand."*
* **System Response**: Bedrock executes `search_products` and `create_order`. Bot replies with formatted summary:
  * 🔸 Basmati Rice x2 kg — ₹240
  * 🔸 Amul Fresh Milk x1 packet — ₹33
  * 🔸 Amul Salted Butter x1 packet — ₹56
  * **Subtotal**: ₹329 | **GST (5%)**: ₹16.45 | **Delivery**: ₹49.00 | **Total**: ₹394.45
  * *"Order #ORD_1024 submitted! Store team is verifying stock."*

---

#### Minute 0:30 - 1:15 | Store Operations & Deterministic State Machine
* **Action**: Switch screen to the **Store Manager Command Center**.
* **Observation**: Order `#ORD_1024` pops up instantly.
* **Action**: Staff member clicks **"Accept & Start Packing"**.
* **Voiceover**:
  > *"Notice that AI interpreted the intent, but deterministic code controls the business. The moment our store accepts the order, DynamoDB executes an atomic transaction, reserving stock off the shelf so we never oversell."*

---

#### Minute 1:15 - 2:00 | EventBridge Automation & Instant Cloud Invoice
* **Action**: Show AWS CloudWatch / EventBridge live telemetry feed.
* **Observation**: EventBridge catches `OrderConfirmed`, routes to `wbos-invoice-generator` Lambda.
* **Action**: Look at Customer WhatsApp chat: An automated Tax Invoice PDF link is delivered.
* **Voiceover**:
  > *"Because WBOS is built on Amazon EventBridge, our core order pipeline is completely decoupled. EventBridge automatically triggered our invoice Lambda, generated a tax invoice into Amazon S3, and dispatched it directly back to the customer's WhatsApp in under two seconds."*

---

#### Minute 2:00 - 2:40 | Business Owner Intelligence
* **Action**: Open the WhatsApp chat as the **Business Owner**.
* **Input**: *"How much did we sell today?"*
* **Bedrock Execution**: Bedrock classifies intent as `GET_DAILY_SALES` and calls `get_daily_sales(date="2026-09-17")`.
* **System Response**:
  > *"Today's sales: **₹48,920** across 24 orders. Average order value: ₹2,038."*
* **Input**: *"What's running low in stock?"*
* **Bedrock Execution**: Bedrock calls `get_low_stock_products()`.
* **System Response**:
  > *"3 products are below threshold: Sunflower Oil (4 bottles remaining), Pure Ghee (2 remaining), Rolled Oats (3 remaining)."*
* **Voiceover**:
  > *"The business owner doesn't need to log into complex ERP software or wait for end-of-day spreadsheets. They manage their enterprise, revenue, and inventory through the exact same WhatsApp interface."*

---

#### Minute 2:40 - 3:00 | Architecture & First Commit Wrap-Up
* **Action**: Display the AWS Architecture diagram.
* **Voiceover**:
  > *"WBOS is built from the ground up on AWS: API Gateway, Lambda, Amazon Bedrock, DynamoDB single-table design, EventBridge, and S3. It is resilient, multi-tenant, and costs zero dollars when idle. That is WBOS: The Conversational Business Operating System."*

---

## 3. Pre-Demo Verification Checklist

- [ ] DynamoDB `WBOS_Store` table active with GSI1 and GSI2.
- [ ] Catalog seeded with demo grocery products, prices, and stock numbers.
- [ ] Bedrock Model ID verified and responsive in target AWS region.
- [ ] EventBridge bus `wbos-events` with active rules for `OrderConfirmed` and `InvoiceGenerated`.
- [ ] S3 bucket `wbos-invoices` accepting PDF write operations.
- [ ] Meta WhatsApp credentials active (or simulator fallback active with 0 latency).
