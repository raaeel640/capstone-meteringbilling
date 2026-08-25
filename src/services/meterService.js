const usageRepository = require("../repositories/usageRepository");
const subscriptionRepository = require("../repositories/subscriptionRepository");

async function recordUsage({
  tenantId,
  usageType,
  quantity,
  idempotencyKey
}) {
  const existingEvent =
    await usageRepository.findByIdempotencyKey(
      tenantId,
      idempotencyKey
    );

  if (existingEvent) {
    return {
      duplicate: true,
      event: existingEvent
    };
  }

  const subscription =
    await subscriptionRepository.getTenantSubscription(tenantId);

  if (!subscription) {
    const error = new Error("Tenant subscription not found");
    error.statusCode = 404;
    throw error;
  }

  let limit;

  if (usageType === "api_call") {
    limit = subscription.api_call_limit;
  } else if (usageType === "ai_token") {
    limit = subscription.ai_token_limit;
  } else {
    const error = new Error("Unsupported usage type");
    error.statusCode = 400;
    throw error;
  }

  const currentUsage =
    await usageRepository.getMonthlyUsage(
      tenantId,
      usageType
    );

  if (currentUsage + quantity > limit) {
    const error = new Error(
      `${usageType} quota exceeded. Current usage: ${currentUsage}, requested: ${quantity}, limit: ${limit}`
    );

    error.statusCode = 429;
    error.code = "QUOTA_EXCEEDED";

    throw error;
  }

  const event = await usageRepository.createUsageEvent(
    tenantId,
    usageType,
    quantity,
    idempotencyKey
  );

  return {
    duplicate: false,
    event
  };
}

module.exports = {
  recordUsage
};