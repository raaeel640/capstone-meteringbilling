

const express = require("express");
const stripeController = require("../controllers/stripeController");

const router = express.Router();
router.post(
  "/checkout",
  express.json(),
  stripeController.createCheckout
);

router.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeController.handleWebhook
);

module.exports = router;