const pool = require("../config/database");

async function getTenantSubscription(tenantId) {
  const result = await pool.query(
    `SELECT
       s.tenant_id,
       s.status,
       p.id AS plan_id,
       p.name AS plan_name,
       p.api_call_limit,
       p.ai_token_limit
     FROM subscriptions s
     JOIN plans p ON p.id = s.plan_id
     WHERE s.tenant_id = $1`,
    [tenantId]
  );

  return result.rows[0] || null;
}

module.exports = {
  getTenantSubscription
};