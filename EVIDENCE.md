# Evidence — Usage Metering & Billing Engine

This document records the verification evidence for the completed capstone.

## 1. Database Evidence

PostgreSQL tables verified:

```text
plans
subscriptions
tenants
usage_events
stripe_events
```

## 2. Usage Metering Evidence

Usage endpoint successfully returned tenant usage information.

Verified API-call usage:

```text
used: 1000
limit: 1000
```

Verified AI-token usage after recording 5,000 tokens:

```text
used: 5000
limit: 100000
```

## 3. Idempotency Evidence

A repeated usage request using the same idempotency key returned:

```text
success: true
duplicate: true
```

This confirms duplicate usage events are detected.

## 4. Stripe Checkout Evidence

Stripe Checkout successfully generated a test subscription checkout URL.

The Stripe Checkout page displayed the Pro subscription amount.

Test payment was completed using Stripe test mode.

## 5. Stripe Webhook Evidence

Stripe CLI successfully forwarded events to:

```text
POST http://localhost:3000/webhooks/stripe
```

The following events were observed:

```text
charge.succeeded
invoice.finalized
invoice.paid
payment_method.attached
customer.created
customer.updated
customer.subscription.created
payment_intent.succeeded
payment_intent.created
invoice.created
invoice.payment_succeeded
checkout.session.completed
invoice_payment.paid
```

Webhook requests returned:

```text
HTTP 200
```

## 6. Webhook Processing Evidence

The application server logged successful processing of Stripe events, including:

```text
Stripe event processed: charge.succeeded
Stripe event processed: invoice.paid
Stripe event processed: invoice.finalized
Stripe event processed: payment_method.attached
Stripe event processed: customer.created
Stripe event processed: invoice.created
Stripe event processed: invoice.payment_succeeded
Stripe event processed: customer.updated
Stripe event processed: customer.subscription.created
Stripe event processed: payment_intent.succeeded
Stripe event processed: payment_intent.created
Stripe event processed: checkout.session.completed
Stripe event processed: invoice_payment.paid
```

## 7. Subscription Upgrade Evidence

Before Stripe subscription processing:

```text
Demo Tenant | Free | active
```

After successful Stripe subscription processing:

```text
Demo Tenant | Pro | active
```

This verifies the Free → Pro upgrade flow.

## 8. Pro Usage Evidence

After upgrading, the usage endpoint returned:

```text
plan: Pro
```

The tenant's usage limits were updated to the Pro plan limits.

## 9. Automated Test Evidence

Jest was executed directly with:

```bash
node ./node_modules/jest/bin/jest.js --runInBand
```

Result:

```text
PASS tests/costService.test.js

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

All four cost calculation tests passed.

## 10. Security Evidence

The project uses environment variables for secrets.

Real Stripe credentials are excluded from the repository.

Stripe webhook signatures are verified using the configured webhook signing secret.

Duplicate Stripe events are detected using the stored Stripe event ID.

## Final Result

The capstone's core metering, billing, usage, idempotency, Stripe Checkout, webhook, and subscription-upgrade flows were implemented and manually verified successfully.
