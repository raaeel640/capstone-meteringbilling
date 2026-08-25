# Usage Metering & Billing Engine

A backend usage-metering and billing engine built with **Node.js, Express, PostgreSQL, and Stripe**.

The system tracks tenant API and AI-token usage, applies plan limits, calculates usage costs in integer cents, prevents duplicate usage events with idempotency keys, and integrates Stripe Checkout for subscription billing.

## Features

* Multi-tenant usage tracking
* API-call and AI-token metering
* Free and Pro subscription plans
* Usage limits and quota enforcement
* Cost calculation in integer cents
* Idempotent usage recording
* PostgreSQL persistence
* Stripe Checkout subscription flow
* Stripe webhook signature verification
* Stripe event deduplication
* Automatic Free → Pro subscription upgrade
* Health-check endpoint
* Jest unit tests

## Tech Stack

* Node.js
* Express
* PostgreSQL
* Stripe
* Docker / Docker Compose
* Jest

## Project Structure

```text
src/
├── config/
│   ├── database.js
│   ├── pricing.js
│   └── stripe.js
├── controllers/
│   ├── meterController.js
│   ├── stripeController.js
│   └── usageController.js
├── repositories/
│   ├── subscriptionRepository.js
│   └── usageRepository.js
├── routes/
│   ├── meterRoutes.js
│   ├── stripeRoutes.js
│   └── usageRoutes.js
├── services/
│   ├── costService.js
│   ├── meterService.js
│   └── usageService.js
├── app.js
└── server.js

migrations/
tests/
```

## Environment Variables

Create a local `.env` file:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/metering_billing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

Never commit real credentials or Stripe secrets.

## Installation

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm run dev
```

The server runs on:

```text
http://localhost:3000
```

## Database

The application uses PostgreSQL.

Run the database through Docker Compose:

```bash
docker compose up -d
```

The database schema is located in:

```text
migrations/001_initial_schema.sql
```

Seed data is located in:

```text
migrations/002_seed_data.sql
```

## API Examples

### Health Check

```http
GET /health
```

### Record Usage

Usage events can be recorded for API calls and AI tokens.

Example:

```json
{
  "tenantId": "70206400-cdc8-49f8-8a4e-0efc83602b25",
  "usageType": "ai_token",
  "quantity": 5000
}
```

### Check Usage

```http
GET /usage/:tenantId
```

The response includes:

* Current plan
* API-call usage
* AI-token usage
* Usage limits
* Calculated cost

## Idempotency

Usage events support an `Idempotency-Key` header.

If the same key is submitted again, the system identifies the request as a duplicate instead of charging the tenant twice.

## Stripe Billing

The application creates Stripe Checkout sessions for Pro subscriptions.

Checkout uses Stripe test mode.

For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

The Stripe webhook endpoint is:

```text
POST /webhooks/stripe
```

The webhook:

1. Verifies the Stripe signature.
2. Detects duplicate Stripe events.
3. Stores processed events.
4. Handles subscription creation.
5. Upgrades the associated tenant from Free to Pro.

## Stripe Test Payment

For testing, use Stripe's test card:

```text
4242 4242 4242 4242
```

Use any future expiry date and any three-digit CVC.

## Testing

Run the Jest tests directly with:

```bash
node ./node_modules/jest/bin/jest.js --runInBand
```

Current verification:

```text
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

The tested cost-calculation cases include:

* API-call cost calculation
* Cached vs fresh input-token pricing
* Reasoning-token billing
* Token-category deduplication

## Subscription Verification

After a successful Stripe test checkout, the tenant subscription is upgraded:

```text
Demo Tenant | Pro | active
```

The usage endpoint also reports the Pro plan and its corresponding limits.

## Security

* Real `.env` files are excluded from Git.
* Stripe credentials are never stored in source code.
* Stripe webhook signatures are verified.
* Duplicate Stripe events are rejected.
* Usage requests support idempotency.

## License

MIT License.
