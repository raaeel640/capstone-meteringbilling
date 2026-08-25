const express = require("express");
const pool = require("./config/database");
const meterRoutes = require("./routes/meterRoutes");
const usageRoutes = require("./routes/usageRoutes");
const stripeRoutes = require("./routes/stripeRoutes");

const app = express();


app.use("/", stripeRoutes);
app.use(express.json());

app.use("/", meterRoutes);
app.use("/", usageRoutes);
app.get("/success", (req, res) => {
  res.send(`
    <h1>Payment Successful 🎉</h1>
    <p>Your Pro subscription has been created successfully.</p>
  `);
});

app.get("/cancel", (req, res) => {
  res.send(`
    <h1>Checkout Cancelled</h1>
    <p>Your payment was cancelled.</p>
  `);
});
app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      status: "ok",
      service: "usage-metering-billing-engine",
      database: "connected",
      time: result.rows[0].time
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});


module.exports = app;