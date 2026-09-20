# Limitations and Roadmap

## Current Limitations

### Kanban browser validation

The backend order transition state machine has passed direct lifecycle
and concurrency tests, but the deployed browser has recently returned an
HTTP 500 during a drag/drop transition. The Lambda exception must be
resolved and retested before the Kanban is described as fully validated.

### Generative AI

Amazon Bedrock is not part of the current execution path because the
required account authorization was unavailable during development. The
current system uses a deterministic Intent Engine.

### Dashboard outbound composer

The dashboard composer is not currently a fully connected manual
outbound messaging system. Customer responses are generated through the
event-driven WhatsApp notification path.

### Broader CRM

The First Commit release does not implement the complete long-term CRM
vision, including full lead management, sales pipelines, marketing
automation, or advanced customer intelligence.

### Payments

Payment-related conversational options are constrained to persisted MVP
data available in the current data model. The project does not claim a
complete payment gateway integration.

### Customers and Delivery pages

Some broader dashboard views remain less complete than the core Orders,
Conversations, Inventory, Events, and Automation workflows.

### Production hardening

This is a hackathon/MVP implementation and should not be represented as
a production-certified enterprise platform.

## Roadmap

### V3 --- Conversational Commerce

-   richer conversational entity extraction
-   broader catalog operations
-   advanced reorder workflows
-   richer payment integration

### V4 --- CRM

-   leads
-   customer lifecycle
-   sales pipeline
-   customer segmentation
-   human handoff

### V5 --- Automation Platform

-   richer trigger/condition model
-   larger action library
-   scheduling
-   analytics
-   reusable workflow templates

### V6 --- Business Intelligence

-   business-owner queries
-   advanced analytics
-   operational insights
-   anomaly detection

### Future Intelligence Layer

Amazon Bedrock can be evaluated for richer natural-language
understanding and business-owner intelligence after account
authorization and security requirements are satisfied.

## Product Boundary

The First Commit submission should be evaluated on functionality that is
actually deployed and demonstrable, not roadmap features.
