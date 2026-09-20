# Security

## Security Model

WBOS uses layered controls across the webhook boundary, dashboard
identity boundary, authorization boundary, and data layer.

## Dashboard Authentication

Amazon Cognito User Pools protect the Command Center. Software-token MFA
(TOTP) is enabled.

Protected API routes use a Cognito JWT authorizer.

## WhatsApp Webhook Security

Meta POST webhooks use HMAC-SHA256 verification. Failed signature
validation must not enter normal execution.

## Secrets

Meta credentials are stored in AWS Secrets Manager.

Never commit or publish:

-   AWS credentials
-   Meta access tokens
-   Meta App Secrets
-   webhook verification tokens
-   passwords
-   Cognito secrets

## Tenant Isolation

Tenant identifiers are incorporated into DynamoDB keys and service
operations.

## Authorization

Dashboard operations require authenticated API access. Order mutation
operations also validate role/context before allowing state changes.

## Data Integrity

DynamoDB conditional writes and transactions protect state changes. The
order state machine rejects invalid transitions. Idempotency controls
duplicate processing.

## Messaging Integrity

Outbound messages are persisted only after actual Meta send success,
with failure information stored separately. Real Meta message IDs are
retained for status tracking.

## Logging

Operational identifiers may be logged, but secrets and credentials must
never be logged.

## Security Limitations

This is a hackathon/MVP implementation, not a production security
certification. A production release would require formal threat
modeling, penetration testing, least-privilege review, retention/privacy
review, backup/restore validation, and operational secret-rotation
procedures.

## Demo Security Checklist

-   rotate credentials exposed during development
-   inspect Git history for secrets
-   redact real customer information
-   avoid exposing AWS account credentials
