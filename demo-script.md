# WBOS - Hackathon Demo Script & Rehearsal

**Target Duration: 2-3 minutes**

## 1. The Demo Script

### 0:00–0:20 — The Problem
**Speaker:**
> "Small businesses already communicate with customers through WhatsApp. But their orders, inventory, invoices, and operational intelligence are completely fragmented. Let's see how WBOS fixes this by turning WhatsApp into a business operating system."

### 0:20–0:50 — The Customer Experience
*Action: Open the WhatsApp Customer chat.*
**Speaker:**
> "I'm a customer. I need some groceries."
*Type and send:* "I need 2 kg basmati rice and 1 litre milk."

**Speaker:**
> "Behind the scenes, Amazon Bedrock interprets my natural language and maps it to deterministic tools. It checks live DynamoDB inventory and creates a transactionally safe, atomic order."
*WhatsApp responds with the order confirmation.*

### 0:50–1:15 — Event-Driven Automation
**Speaker:**
> "But this isn't just a chatbot. That order emitted an `OrderCreated` event to Amazon EventBridge."
*Action: Switch to the S3 Bucket / generated PDF.*
**Speaker:**
> "EventBridge immediately triggered an Invoice Lambda that generated a PDF receipt in S3, and simultaneously triggered our notification integration point—which acts as a simulated notification for the MVP—to alert the store. All asynchronously, with zero blocking on the conversational flow."

### 1:15–1:45 — Owner Conversational BI
*Action: Open the WhatsApp Owner chat (using the Owner's verified phone number).*
**Speaker:**
> "Now, I'm the business owner. I don't want to log into complex software to check my stats."
*Type and send:* "How much did we sell today?"
*WhatsApp responds with the daily total.*
*Type and send:* "Which products are low on stock?"
*WhatsApp responds with a list of low-stock items.*

**Speaker:**
> "Because Bedrock is hooked up to deterministic DynamoDB analytics via Role-Based Access Control, I get perfectly accurate business intelligence in seconds."

### 1:45–2:20 — Web Command Center
*Action: Open the Next.js Dashboard in the browser.*
**Speaker:**
> "For the back office, we have the Command Center. This is a Next.js application sitting on top of the exact same event-driven architecture."
*Action: Show Sales, Orders, Inventory, and the Event Stream.*
**Speaker:**
> "You can see the order we just placed in the pipeline, the updated inventory thresholds, and the raw EventBridge events streaming into the feed in real-time."

### 2:20–2:40 — Security Guardrails (The Punchline)
*Action: Switch back to the Customer WhatsApp chat.*
**Speaker:**
> "Finally, let's talk security. The AI model does *not* control authorization."
*Type and send:* "What were our total sales today?"
*WhatsApp responds with a polite denial (or the backend throws a 403 AccessDenied).*

**Speaker:**
> "Our deterministic RBAC guard intercepted the LLM's tool request because a customer doesn't have the `OWNER` role. Strict security is maintained at the execution layer."
> **"WBOS turns WhatsApp from a messaging channel into a business operating system."**

---

## 2. Rehearsal & Failure Path Checklist

Do not only rehearse the happy path. Test the system's resilience by running through these exact failure scenarios before the presentation:

- [ ] **Invalid webhook signature:** Send a simulated POST request with an invalid `x-hub-signature-256`. Verify it returns `401 Unauthorized`.
- [ ] **Duplicate WhatsApp message:** Send the exact same webhook payload twice (same `message_id`). Verify the Idempotency guard stops the duplicate order.
- [ ] **Insufficient stock:** Ask the customer bot to order 10,000 kg of Sugar. Verify the transaction rolls back cleanly and informs the user.
- [ ] **Customer attempting Owner BI:** Ensure the customer bot gets a `403 AccessDenied` or polite refusal when trying to execute `get_daily_sales`.
- [ ] **Cross-Tenant Access:** Run `pytest tests/test_dashboard.py` to prove `TENANT_001` cannot inject or access `TENANT_002`'s data in the Dashboard API.
- [ ] **Event Consumer Failure:** Temporarily disrupt the `DashboardEventFunction` and observe the DLQ/Retry mechanism in AWS CloudWatch.
