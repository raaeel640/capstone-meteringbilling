const pool = require("../config/database");
getAllMonthlyUsage


async function findByIdempotencyKey(tenantId, idempotencyKey) {
  const result = await pool.query(
    `SELECT *
     FROM usage_events
     WHERE tenant_id = $1
       AND idempotency_key = $2`,
    [tenantId, idempotencyKey]
  );

  return result.rows[0] || null;
}

async function createUsageEvent(
  tenantId,
  usageType,
  quantity,
  idempotencyKey
) {
  const result = await pool.query(
    `INSERT INTO usage_events
      (tenant_id, usage_type, quantity, idempotency_key)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [tenantId, usageType, quantity, idempotencyKey]
  );

  return result.rows[0];
}

async function getMonthlyUsage(tenantId, usageType) {
  const result = await pool.query(
    `SELECT COALESCE(SUM(quantity), 0) AS used
     FROM usage_events
     WHERE tenant_id = $1
       AND usage_type = $2
       AND created_at >= date_trunc('month', NOW())`,
    [tenantId, usageType]
  );

  return Number(result.rows[0].used);
}

module.exports = {
  findByIdempotencyKey,
  createUsageEvent,
  getMonthlyUsage,
  getAllMonthlyUsage
};

async function getAllMonthlyUsage(tenantId) {
  const result = await pool.query(
    `SELECT
       usage_type,
       COALESCE(SUM(quantity), 0) AS used
     FROM usage_events
     WHERE tenant_id = $1
       AND created_at >= date_trunc('month', NOW())
     GROUP BY usage_type`,
    [tenantId]
  );

  return result.rows;
}