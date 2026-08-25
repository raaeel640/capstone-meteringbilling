const usageService = require("../services/usageService");

async function getUsage(req, res) {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({
        error: "tenantId is required"
      });
    }

    const result = await usageService.getUsage(tenantId);

    res.json(result);
  } catch (error) {
    console.error("Usage error:", error.message);

    res.status(error.statusCode || 500).json({
      error: error.message
    });
  }
}

module.exports = {
  getUsage
};