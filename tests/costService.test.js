const {
  calculateApiCallCost,
  calculateAiTokenCost
} = require("../src/services/costService");

describe("Cost calculation", () => {
  test("calculates API call cost in integer cents", () => {
    expect(calculateApiCallCost(100)).toBe(100);
  });

  test("cached input tokens are cheaper than fresh input", () => {
    const cost = calculateAiTokenCost({
      inputTokens: 1_000_000,
      cachedInputTokens: 500_000,
      outputTokens: 0,
      reasoningTokens: 0
    });

    expect(cost).toBe(63);
  });

  test("reasoning tokens are billed as output tokens", () => {
    const cost = calculateAiTokenCost({
      inputTokens: 0,
      cachedInputTokens: 0,
      outputTokens: 500_000,
      reasoningTokens: 500_000
    });

    expect(cost).toBe(300);
  });

  test("token categories are not double counted", () => {
    const cost = calculateAiTokenCost({
      inputTokens: 1_000_000,
      cachedInputTokens: 200_000,
      outputTokens: 500_000,
      reasoningTokens: 100_000
    });

    expect(cost).toBe(265);
  });
});