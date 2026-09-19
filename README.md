# WBOS

WhatsApp Business Operating System

[![AWS Serverless](https://img.shields.io/badge/AWS-Serverless-orange.svg)](https://aws.amazon.com/serverless/)
[![Next.js](https://img.shields.io/badge/Next.js-Dashboard-black.svg)](https://nextjs.org/)

> AWS-native, event-driven WhatsApp Business Operating System
> with a deterministic Intent Engine.

## What is WBOS?
WBOS (WhatsApp Business Operating System) is an AWS-native conversational business platform that connects customer conversations with business operations through event-driven workflows, deterministic business logic, CRM data, and automation.

## Why it exists
Businesses receive customer messages but need a reliable system to interpret requests, retrieve business data, and respond automatically. WBOS turns WhatsApp customer conversations into an event-driven business operations workflow on AWS.

## Current First Commit Release
The First Commit release (WBOS V2) focuses on the AWS event-driven core: live WhatsApp messaging, deterministic intent classification, order and inventory operations, conversation persistence, EventBridge orchestration, invoice infrastructure, Cognito/MFA-protected operations dashboard, and secure server-side Meta integration.

## Live Architecture
```text
Meta WhatsApp
      ↓
API Gateway
      ↓
Ingress Lambda
      ↓
SQS
      ↓
Execution Lambda
      ↓
Deterministic Intent Engine
      ↓
DynamoDB
      ↓
EventBridge
      ↓
Notification Lambda
      ↓
Meta Graph API
      ↓
WhatsApp
```

## End-to-End Workflow
Customer messages ("Track my order") arrive via Meta webhooks, are processed through API Gateway to an Ingress Lambda that verifies the HMAC signature, enforces idempotency, and drops them into an SQS Execution Queue. The Execution Lambda processes the queue deterministically routing intents (like `ORDER_TRACKING`), saving conversation state to DynamoDB, and firing EventBridge events (like `CustomerReplyRequested`) that trigger the Notification Lambda to reply to the customer via WhatsApp.

## AWS Services
- **Amazon API Gateway**
- **AWS Lambda**
- **Amazon SQS**
- **Amazon DynamoDB**
- **Amazon EventBridge**
- **Amazon S3**
- **Amazon Cognito**

## Security
- Cognito User Pools with TOTP MFA enforced for Dashboard access.
- API Gateway JWT Authorizers.
- Strict HMAC-SHA256 Meta webhook validation.
- Idempotency checks to prevent duplicate processing.
- Secrets Manager for Meta tokens.

## Dashboard
```text
Amplify
   ↓
Cognito + TOTP
   ↓
Next.js Dashboard
   ↓
API Gateway
   ↓
Dashboard Lambda
   ↓
DynamoDB
```

## Verified Capabilities

| Capability                   | Current    |
| ---------------------------- | ---------- |
| WhatsApp messaging           | 🟢 Live    |
| Intent Engine                | 🟢 Live    |
| Order tracking               | 🟢 Live    |
| Inventory lookup             | 🟢 Live    |
| Conversations                | 🟢 Live    |
| EventBridge                  | 🟢 Live    |
| Invoice infrastructure       | 🟢 Live    |
| Cognito + MFA                | 🟢 Live    |
| Dashboard                    | 🟢 Live    |
| Customers                    | 🟡 Demo    |
| Delivery                     | 🟡 Demo    |
| Dashboard outbound messaging | 🔴 Planned |
| Generative AI models         | 🔵 Future  |
| CRM                          | 🔵 Future  |
| Marketing                    | 🔵 Future  |
| Automation builder           | 🟢 Live    |

**Status:** Phase B implemented and deployed; live end-to-end automation verification completed for supported workflows.

✓ Real Meta WhatsApp webhook  
✓ HMAC webhook validation  
✓ Idempotency protection  
✓ SQS asynchronous execution  
✓ Deterministic intent classification  
✓ DynamoDB business-state lookup  
✓ EventBridge orchestration  
✓ Real WhatsApp outbound response  
✓ Conversation persistence  
✓ Cognito authentication  
✓ TOTP MFA  
✓ Protected dashboard APIs  
✓ S3 invoice infrastructure  
✓ CloudWatch observability  

## Known Limitations
- The Dashboard composer is a UI stub; manual outbound dashboard messaging is not yet connected to the backend.
- Customers and Delivery dashboard pages are currently using demo data.
- Generative intelligence routing and fully automated sales pipeline workflows are architectural targets for the V3+ roadmap and are not currently active in the execution path.

## Demo
- Send a WhatsApp message to the WBOS sandbox number: "Track my order"
- View the automated order status reply in WhatsApp.
- Log into the Cognito-protected dashboard (MFA required).
- View the live interaction in the Conversations tab.

## Repository Structure
- `/src` - Backend AWS Lambda function code (Python)
- `/dashboard` - Frontend Next.js Dashboard code (TypeScript)
- `/docs` - Extensive product, architecture, and security documentation
- `template.yaml` - AWS SAM infrastructure as code template

## Documentation
For deep-dive documentation, start at our [System Overview](docs/architecture/system-overview.md).
- `docs/architecture/current.md`
- `docs/architecture/data-model.md`
- `docs/architecture/event-contracts.md`
- `docs/security/security-model.md`
- `docs/audit/wbos-audit-report.md`

## Roadmap
See our [Roadmap](docs/product/roadmap.md) to explore how WBOS evolves from an Event-Driven Core to a full Conversational Commerce platform.

## Hackathon Context
Developed for First Commit!
