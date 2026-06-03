export type NeuronScoreInput = {
  momentum: number;
  liquidity: number;
  crowd: number;
  risk: number;
};

export function calculateMockNeuronScore(input: NeuronScoreInput): number {
  const weighted = input.momentum * 0.35 + input.liquidity * 0.25 + input.crowd * 0.2 - input.risk * 0.2;
  return Math.max(0, Math.min(100, Math.round(weighted)));
}
