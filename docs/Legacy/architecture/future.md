# WBOS Future Architecture

> **Status: FUTURE / NOT CURRENTLY DEPLOYED**
>
> This document describes the target WBOS architecture beyond
> the First Commit implementation. Components described here,
> including Bedrock-based AI orchestration and advanced business
> agents, are architectural targets and must not be interpreted
> as currently deployed functionality.

## The Architectural Evolution

The current WBOS (V2) implementation relies on a deterministic Intent Engine to route structured customer inputs to corresponding business state operations. The V6 architecture will expand this by introducing an intelligent middleware layer.

```text
Current V2
   ↓
Conversational Commerce (V3)
   ↓
CRM (V4)
   ↓
Automation (V5)
   ↓
Advanced AI Agents (V6)
   ↓
Full Conversational Business OS
```

## V6 Generative Architecture Target

In the target architecture, a Generative model (e.g., Amazon Bedrock / Claude) acts as an intelligent router and unstructured data processor, while the existing deterministic engine is preserved as a safety and policy guardrail.

```text
User Message
      ↓
Generative AI Routing Layer
      ↓
Structured Intent / Tool Request
      ↓
Deterministic Validation Policy (Guardrail)
      ↓
Business Service / Tool Router
      ↓
DynamoDB
      ↓
EventBridge
```

### The Role of the Intent Engine
The current intents (e.g., `ORDER_TRACKING`, `PRODUCT_LOOKUP`) will be converted into structured Tool schemas. 
The generative layer will *request* tool executions, but the deterministic layer will execute them and enforce authorization.

## Owner Intelligence
Future dashboard iterations will implement natural-language queries (e.g., "What happened today?") that query DynamoDB analytics data and use generative models to summarize the metrics for the business owner.
