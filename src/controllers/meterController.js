const meterService = require("../services/meterService");

async function generate(req, res) {
  try {
    const tenantId = req.body.tenantId;
    const { usageType, quantity } = req.body;
    const idempotencyKey = req.header("Idempotency-Key");

    if (!tenantId || !usageType || !quantity) {
      return res.status(400).json({
        error: "tenantId, usageType and quantity are required"
      });
    }

    if (!idempotencyKey) {
      return res.status(400).json({
        error: "Idempotency-Key header is required"
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: "quantity must be a positive integer"
      });
    }

    const result = await meterService.recordUsage({
      tenantId,
      usageType,
      quantity,
      idempotencyKey
    });

    return res.status(result.duplicate ? 200 : 201).json({
      success: true,
      duplicate: result.duplicate,
      usageEvent: result.event
    });
  } catch (error) {
    console.error("Generate error:", error.message);

    return res.status(error.statusCode || 500).json({
      error: error.message,
      code: error.code || "INTERNAL_ERROR"
    });
  }
}

module.exports = {
  generate
};