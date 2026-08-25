const {
  calculateApiCallCost,
  calculateAiTokenCost
} = require("./costService");

const usageRepository = require("../repositories/usageRepository");
const subscriptionRepository = require("../repositories/subscriptionRepository");

async function getUsage(tenantId) {
  const subscription =
    await subscriptionRepository.getTenantSubscription(tenantId);

  if (!subscription) {
    const error = new Error("Tenant subscription not found");
    error.statusCode = 404;
    throw error;
  }

  const usageRows =
    await usageRepository.getAllMonthlyUsage(tenantId);

  const usage = {
    apiCalls: 0,
    aiTokens: 0
  };

  for (const row of usageRows) {
    if (row.usage_type === "api_call") {
      usage.apiCalls = Number(row.used);
    }

    if (row.usage_type === "ai_token") {
      usage.aiTokens = Number(row.used);
    }
  }

  const apiCallCost = calculateApiCallCost(usage.apiCalls);

const aiTokenCost = calculateAiTokenCost({
  inputTokens: usage.aiTokens,
  cachedInputTokens: 0,
  outputTokens: 0,
  reasoningTokens: 0
});

const totalCost = apiCallCost + aiTokenCost;

  return {
  tenantId,
  plan: subscription.plan_name,
  usage: {
    apiCalls: {
      used: usage.apiCalls,
      limit: subscription.api_call_limit
    },
    aiTokens: {
      used: usage.aiTokens,
      limit: subscription.ai_token_limit
    }
  },
  cost: {
    apiCallsCents: apiCallCost,
    aiTokensCents: aiTokenCost,
    totalCents: totalCost
  }
};
}

module.exports = {
  getUsage
};