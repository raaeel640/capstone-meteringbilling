const PRICING = require("../config/pricing");

function calculateApiCallCost(quantity) {
  return quantity * PRICING.apiCall.centsPerCall;
}

function calculateAiTokenCost({
  inputTokens = 0,
  cachedInputTokens = 0,
  outputTokens = 0,
  reasoningTokens = 0
}) {
  const freshInputTokens =
    Math.max(inputTokens - cachedInputTokens, 0);

  const totalOutputTokens =
    outputTokens + reasoningTokens;

  const inputCost =
    Math.ceil(
      (freshInputTokens * PRICING.aiTokens.inputCentsPerMillion) /
        1_000_000
    );

  const cachedInputCost =
    Math.ceil(
      (cachedInputTokens *
        PRICING.aiTokens.cachedInputCentsPerMillion) /
        1_000_000
    );

  const outputCost =
    Math.ceil(
      (totalOutputTokens *
        PRICING.aiTokens.outputCentsPerMillion) /
        1_000_000
    );

  return inputCost + cachedInputCost + outputCost;
}

module.exports = {
  calculateApiCallCost,
  calculateAiTokenCost
};