# AWS Architecture

## Why AWS Is Core

AWS is the execution and integration backbone of WBOS, not simply its
hosting provider.

## Service Map

  -----------------------------------------------------------------------
  AWS service                         WBOS role
  ----------------------------------- -----------------------------------
  Amazon API Gateway                  WhatsApp webhook and dashboard HTTP
                                      API

  AWS Lambda                          Ingress, execution, dashboard,
                                      notifications, invoices, automation

  Amazon SQS                          Execution queue and dead-letter
                                      handling

  Amazon DynamoDB                     Orders, products, inventory,
                                      conversations, state, audits

  Amazon EventBridge                  Domain-event routing

  Amazon S3                           Invoice/document storage

  Amazon Cognito                      Dashboard authentication and MFA

  AWS Amplify                         Next.js dashboard hosting

  AWS Secrets Manager                 Meta credentials

  Amazon CloudWatch                   Logs and observability

  AWS SAM                             Infrastructure as code
  -----------------------------------------------------------------------

## Request Path

``` text
WhatsApp
  -> Meta webhook
  -> API Gateway /webhook
  -> Ingress Lambda
  -> SQS
  -> Execution Lambda
  -> DynamoDB / EventBridge
```

Ingress verifies Meta signatures before normal processing. Accepted
messages are persisted and queued for asynchronous execution.

## Dashboard Path

``` text
Browser
  -> Amplify-hosted Next.js
  -> Cognito JWT
  -> API Gateway
  -> Dashboard Lambda
  -> DynamoDB
```

TOTP software-token MFA is enabled for dashboard authentication.

## Event Path

``` text
Domain service
  -> EventBridge bus: wbos-events
  -> EventBridge rule
  -> target Lambda
```

Examples include `OrderCreated`, order lifecycle events,
`CustomerReplyRequested`, `InvoiceGenerated`, and automation events.

## Infrastructure as Code

Infrastructure is defined in `template.yaml` and deployed using AWS SAM.
The First Commit stack is `wbos-first-commit` in `ap-south-1`.

## Security Boundaries

-   Cognito JWT authorization for protected dashboard routes
-   HMAC-SHA256 Meta webhook validation
-   Secrets Manager for Meta credentials
-   IAM-controlled DynamoDB access
-   Tenant-scoped data keys
-   Backend state-transition validation

## Current AI Position

Bedrock was investigated as the intended future intelligence layer, but
required account authorization was unavailable during development. The
deployed First Commit execution path therefore uses deterministic
routing rather than Bedrock.
