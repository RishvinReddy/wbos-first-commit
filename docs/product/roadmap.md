# WBOS Product Roadmap

> This document describes the evolutionary roadmap of WBOS from its initial proof of concept to a comprehensive AI-powered conversational business platform.

## WBOS Evolution

### V1 — Original Prototype
An early proof of concept that connected WhatsApp to a simple database using a fast API, enabling basic conversational grocery and business automation.

*Architecture:*
`WhatsApp → FastAPI → Database → Business operations`

---

### V2 — AWS Event-Driven Core (CURRENT / FIRST COMMIT)
The current production-grade re-architecture that focuses on enterprise reliability, decoupling, security, and deterministic business logic.

*Key Capabilities:*
- Live Meta WhatsApp webhook integration
- API Gateway + SQS decoupling
- Deterministic Intent Engine
- EventBridge orchestration
- Cognito MFA-protected Dashboard

*Architecture:*
`WhatsApp → API Gateway → SQS → Intent Engine → EventBridge → Meta`

---

### V3 — Conversational Commerce
The next major expansion will introduce rich business tools that the Intent Engine can route to, completing the core transactional layer.

*Focus Areas:*
- Full Product Catalog lookup (`search_products`)
- Inventory availability checking (`check_inventory`)
- Automated Order Creation (`create_order`)
- Invoice Generation & Sending (`get_invoice`)

---

### V4 — Customer Operating System (CRM)
Expanding conversation persistence into a full 360-degree customer view.

*Focus Areas:*
- Unified Customer Profiles
- Lead Tracking & Qualification
- Interaction History & Segments
- Task Management

---

### V5 — Automation Platform
Leveraging the existing EventBridge nervous system to create automated business workflows without manual intervention.

*Focus Areas:*
- Event-Condition-Action builder
- Automated reorder notifications (e.g., `If stock < threshold -> notify owner`)
- Automated feedback requests (e.g., `Wait 24h after delivery -> request feedback`)

---

### V6 — Advanced Intelligence
Once the deterministic business layer (V2-V5) is robust and battle-tested, generative intelligence will be introduced to orchestrate complex tool calls and handle unstructured conversational tasks securely.

*Focus Areas:*
- Natural language intent extraction to structured tools
- Owner analytics ("What happened today?")
- Generative policy and guardrail architecture
