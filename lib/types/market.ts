export type MarketDirection = "pump" | "dump";

export type NormalizedCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type DataQuality = {
  hasSpotData: boolean;
  hasDerivativesData: boolean;
  hasCandles: boolean;
  missingFields: string[];
  sourcesUsed: string[];
};

export type NormalizedMarketData = {
  symbol: string;
  name?: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  fundingRate?: number;
  openInterest?: number;
  longShortRatio?: number;
  candles?: NormalizedCandle[];
  dataQuality: DataQuality;
};

export type MarketApiError = {
  status: "error";
  message: string;
  details?: string;
};

export type MarketApiSuccess<T> = {
  status: "success";
  data: T;
};

export type MarketApiResponse<T> = MarketApiSuccess<T> | MarketApiError;

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
