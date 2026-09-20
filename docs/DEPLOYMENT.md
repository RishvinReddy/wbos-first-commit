# Deployment

## Prerequisites

-   AWS SAM CLI
-   AWS CLI
-   Python 3.12
-   Node.js/npm
-   Git
-   Meta WhatsApp Cloud API credentials

Use an authenticated AWS session. Do not create or commit permanent root
access keys.

## Backend

From repository root:

``` bash
sam validate --lint
sam build
sam deploy
```

First Commit stack:

``` text
Stack:  wbos-first-commit
Region: ap-south-1
```

## Deployment Verification

``` bash
aws cloudformation describe-stacks   --stack-name wbos-first-commit   --region ap-south-1   --query "Stacks[0].StackStatus"
```

Expected:

``` text
UPDATE_COMPLETE
```

## Catalog

Use the idempotent catalog seed script:

``` bash
python scripts/seed_catalog.py
```

Do not use the retired monolithic demo-data seeder.

## Dashboard

``` bash
cd dashboard
npm install
npm run build
```

Local development:

``` bash
npm run dev
```

Production hosting is through AWS Amplify.

## Environment

The dashboard uses configured API and Cognito build settings. Backend
secrets, especially Meta credentials, belong in AWS Secrets Manager.

## Meta Configuration

Configure the Meta application with the webhook callback, verification
token, App Secret, access token, and WhatsApp business account
configuration.

Store sensitive values in Secrets Manager.

## Post-Deployment Smoke Test

1.  Authenticate with Cognito/MFA.
2.  Verify dashboard connectivity.
3.  Send a WhatsApp message.
4.  Verify the conversation.
5.  Place a test order.
6.  Verify inventory.
7.  Verify the order appears in NEW.
8.  Test the Kanban lifecycle.
9.  Verify WhatsApp status notifications.

## Rollback

Use CloudFormation/SAM deployment history and inspect stack events
before rollback. Avoid undocumented manual database edits.

## Secret Handling

Never place AWS credentials, Meta tokens, App Secrets, webhook
verification tokens, or Cognito secrets in source control or
documentation.
