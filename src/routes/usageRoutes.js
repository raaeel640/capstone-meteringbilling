const express = require("express");
const usageController = require("../controllers/usageController");

const router = express.Router();

router.get("/usage/:tenantId", usageController.getUsage);

module.exports = router;