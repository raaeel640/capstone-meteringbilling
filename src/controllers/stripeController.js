const stripe = require("../config/stripe");
const pool = require("../config/database");

async function createCheckout(req, res) {
  console.log("CHECKOUT ROUTE HIT");

  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        error: "tenantId is required"
      });
    }

    const tenantResult = await pool.query(
      `SELECT id FROM tenants WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        error: "Tenant not found"
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Pro Plan"
            },
            unit_amount: 1000,
            recurring: {
              interval: "month"
            }
          },
          quantity: 1
        }
      ],

      metadata: {
        tenantId
      },
      subscription_data: {
  metadata: {
    tenantId
  }
},

      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
    });

    console.log("STRIPE SESSION CREATED:", session.id);
    console.log("CHECKOUT URL:", session.url);

    return res.status(200).json({
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error("CHECKOUT ERROR MESSAGE:", error.message);
    console.error("CHECKOUT ERROR TYPE:", error.type);
    console.error("CHECKOUT ERROR CODE:", error.code);

    return res.status(500).json({
      error: "Failed to create checkout session"
    });
  }
}

async function handleWebhook(req, res) {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Invalid Stripe webhook:", error.message);

    return res.status(400).json({
      error: "Invalid webhook signature"
    });
  }

  try {
    const existing = await pool.query(
      `SELECT id FROM stripe_events WHERE event_id = $1`,
      [event.id]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({
        received: true,
        duplicate: true
      });
    }

    await pool.query(
      `INSERT INTO stripe_events (event_id, event_type)
       VALUES ($1, $2)`,
      [event.id, event.type]
    );
    if (event.type === "customer.subscription.created") {
  const subscription = event.data.object;

  const tenantId = subscription.metadata?.tenantId;

  if (tenantId) {
    await pool.query(
      `UPDATE subscriptions
       SET plan_id = (
         SELECT id FROM plans WHERE name = 'Pro'
       ),
       status = 'active'
       WHERE tenant_id = $1`,
      [tenantId]
    );

    console.log("Tenant upgraded to Pro:", tenantId);
  }
}

    console.log("Stripe event processed:", event.type);

    return res.status(200).json({
      received: true,
      duplicate: false
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return res.status(500).json({
      error: "Webhook processing failed"
    });
  }
}

module.exports = {
  handleWebhook,
  createCheckout
};