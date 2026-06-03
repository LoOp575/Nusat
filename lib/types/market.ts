export type MarketDirection = "pump" | "dump";

export type MarketCoin = {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volumeScore: number;
  direction: MarketDirection;
};

export type Scenario = {
  label: string;
  probability: number;
};

export type AgentAnalysis = {
  symbol: string;
  signalScore: number;
  liquidityScore: number;
  crowdScore: number;
  riskLevel: "low" | "medium" | "high";
  scenarios: Scenario[];
};
