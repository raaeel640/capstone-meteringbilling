# Build Log — Usage Metering & Billing Engine

## Project

**Usage Metering & Billing Engine**

## Objective

Build a backend service that tracks tenant usage, enforces plan limits, calculates billing costs, and integrates Stripe subscription billing.

## Implementation Progress

### 1. Project Setup

* Created Node.js project.
* Configured Express server.
* Added PostgreSQL connection.
* Added environment-based configuration.
* Added Docker Compose configuration.

### 2. Database

Implemented PostgreSQL persistence for:

* Tenants
* Plans
* Subscriptions
* Usage events
* Stripe events

Added initial schema and seed migrations.

### 3. Usage Metering

Implemented usage recording for:

* API calls
* AI tokens

Usage is associated with a tenant and persisted in PostgreSQL.

### 4. Idempotency

Added idempotency handling for usage events.

Repeated requests using the same idempotency key are detected as duplicates and do not create another billable usage event.

Verified duplicate handling successfully.

### 5. Cost Calculation

Implemented pricing and cost calculation in integer cents.

Unit tests cover:

* API-call pricing
* Cached input tokens
* Reasoning tokens
* Token-category deduplication

Final test result:

```text
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

### 6. Usage Limits

Implemented plan-based usage limits.

The system reports current usage, limits, and calculated costs for each tenant.

### 7. Stripe Integration

Added Stripe SDK integration and Checkout Session creation.

Implemented:

* Subscription-mode Checkout
* Pro Plan pricing
* Stripe test-mode payments
* Success and cancel routes

### 8. Stripe Webhooks

Implemented:

```text
POST /webhooks/stripe
```

Webhook processing includes:

* Stripe signature verification
* Event persistence
* Duplicate event detection
* Event acknowledgement

Verified Stripe CLI forwarding successfully.

Observed events included:

```text
checkout.session.completed
customer.subscription.created
payment_intent.succeeded
invoice.paid
invoice.payment_succeeded
charge.succeeded
```

All forwarded events received HTTP 200 responses.

### 9. Subscription Upgrade

Added handling for:

```text
customer.subscription.created
```

The Stripe subscription contains tenant metadata.

When the subscription is created successfully, the corresponding tenant subscription is updated from Free to Pro.

Verified result:

```text
Demo Tenant | Pro | active
```

### 10. Final Verification

Verified:

* API usage tracking
* AI-token usage tracking
* Idempotency
* Cost calculation
* Stripe Checkout
* Stripe test payment
* Stripe webhook forwarding
* Stripe event storage
* Free → Pro subscription upgrade
* Pro usage limits
* Jest tests

## Final Status

**Core capstone implementation completed and verified successfully.**
