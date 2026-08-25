INSERT INTO plans (name, api_call_limit, ai_token_limit)
VALUES
    ('Free', 1000, 100000),
    ('Pro', 10000, 1000000)
ON CONFLICT (name) DO NOTHING;

INSERT INTO tenants (name)
VALUES ('Demo Tenant')
ON CONFLICT DO NOTHING;

INSERT INTO subscriptions (tenant_id, plan_id, status)
SELECT
    t.id,
    p.id,
    'active'
FROM tenants t
CROSS JOIN plans p
WHERE t.name = 'Demo Tenant'
  AND p.name = 'Free'
  AND NOT EXISTS (
      SELECT 1
      FROM subscriptions s
      WHERE s.tenant_id = t.id
  );