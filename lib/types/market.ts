export type MarketDirection = "pump" | "dump";

export type NormalizedCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type NormalizedPricePoint = {
  timestamp: number;
  price: number;
};

export type DataQuality = {
  hasSpotData: boolean;
  hasDerivativesData: boolean;
  hasCandles: boolean;
  hasPriceSeries?: boolean;
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
  priceSeries?: NormalizedPricePoint[];
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

export type DecisionName = "LONG_NOW" | "SHORT_NOW" | "SCALP_ONLY" | "WAIT_FOR_CONFIRMATION" | "AVOID";

export type EngineDataQuality = {
  quality: "full" | "partial" | "insufficient";
  notes: string[];
};

export type EngineAnalysis = {
  symbol: string;
  decision: {
    decision: DecisionName;
    confidence: number;
    tradeMode: string;
    riskLevel: "low" | "medium" | "high";
    dominantSide: "bullish" | "bearish" | "neutral";
    invalidationHint: string;
    dominantReasons: string[];
  };
  pressure: {
    buyPressureIntegral: number;
    sellPressureIntegral: number;
    momentumVelocity: number;
    momentumAcceleration: number;
    volatilityPressure: number;
  };
  neuralScores: {
    bullishPressure: number;
    bearishPressure: number;
    trapProbability: number;
    riskScore: number;
    liquidityDominance: number;
    marketStrength: number;
  };
  marketMaking: {
    reservationPrice: number;
    totalSpread: number;
    bidPrice: number;
    askPrice: number;
    liquidityRisk: number;
  };
  scenarios: Array<{
    name: string;
    probability: number;
  }>;
  dataQuality: EngineDataQuality;
};

export type AnalyzeApiSuccess = {
  ok: true;
  source: "python_ai_engine";
  analysis: EngineAnalysis;
};

export type AnalyzeApiError = {
  ok: false;
  reason: "invalid_symbol" | "data_incomplete" | "python_engine_offline" | "python_engine_error" | "market_data_error";
  message: string;
  dataQuality?: unknown;
  details?: string;
};

export type AnalyzeApiResponse = AnalyzeApiSuccess | AnalyzeApiError;
