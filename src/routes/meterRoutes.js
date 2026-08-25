const express = require("express");
const meterController = require("../controllers/meterController");

const router = express.Router();

router.post("/generate", meterController.generate);

module.exports = router;