import type { NormalizedCandle } from "@/lib/types/market";

const COINALYZE_BASE_URL = "https://api.coinalyze.net/v1";

type CoinalyzeMarket = {
  symbol: string;
  base_asset?: string;
  quote_asset?: string;
  exchange?: string;
  is_perpetual?: boolean;
};

type CoinalyzeHistoryPoint = {
  t?: number;
  o?: number;
  h?: number;
  l?: number;
  c?: number;
  v?: number;
  value?: number;
  long?: number;
  short?: number;
  ratio?: number;
};

type CoinalyzeHistoryResponse = {
  history?: CoinalyzeHistoryPoint[];
};

export type CoinalyzeDerivativesData = {
  fundingRate?: number;
  openInterest?: number;
  longShortRatio?: number;
  candles?: NormalizedCandle[];
  sourceSymbol?: string;
};

function getCoinalyzeKey(): string {
  const key = process.env.COINALYZE_API_KEY;
  if (!key) {
    throw new Error("Missing COINALYZE_API_KEY environment variable");
  }
  return key;
}

async function coinalyzeFetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${COINALYZE_BASE_URL}${path}`);
  url.searchParams.set("api_key", getCoinalyzeKey());
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString(), { cache: "no-store" });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Coinalyze request failed: ${response.status} ${response.statusText}${body ? ` - ${body.slice(0, 180)}` : ""}`);
  }

  return response.json() as Promise<T>;
}

function pickBestMarket(markets: CoinalyzeMarket[], symbol: string): CoinalyzeMarket | undefined {
  const normalizedSymbol = symbol.toUpperCase();
  const candidates = markets.filter((market) => {
    const base = market.base_asset?.toUpperCase();
    const marketSymbol = market.symbol.toUpperCase();
    return base === normalizedSymbol || marketSymbol.startsWith(`${normalizedSymbol}.`) || marketSymbol.includes(`${normalizedSymbol}USDT`);
  });

  return (
    candidates.find((market) => market.is_perpetual && market.quote_asset?.toUpperCase() === "USDT") ??
    candidates.find((market) => market.quote_asset?.toUpperCase() === "USDT") ??
    candidates[0]
  );
}

async function getMarkets(): Promise<CoinalyzeMarket[]> {
  return coinalyzeFetch<CoinalyzeMarket[]>("/markets");
}

function latestValue(response: CoinalyzeHistoryResponse[] | CoinalyzeHistoryResponse): number | undefined {
  const bucket = Array.isArray(response) ? response[0] : response;
  const history = bucket?.history ?? [];
  const latest = history[history.length - 1];
  const value = latest?.c ?? latest?.value ?? latest?.ratio;
  return Number.isFinite(Number(value)) ? Number(value) : undefined;
}

function normalizeCandles(response: CoinalyzeHistoryResponse[] | CoinalyzeHistoryResponse): NormalizedCandle[] | undefined {
  const bucket = Array.isArray(response) ? response[0] : response;
  const history = bucket?.history ?? [];
  const candles = history
    .map((point) => {
      if (
        point.t === undefined ||
        point.o === undefined ||
        point.h === undefined ||
        point.l === undefined ||
        point.c === undefined
      ) {
        return null;
      }

      return {
        timestamp: Number(point.t),
        open: Number(point.o),
        high: Number(point.h),
        low: Number(point.l),
        close: Number(point.c),
        volume: Number(point.v ?? 0)
      };
    })
    .filter((candle): candle is NormalizedCandle => candle !== null);

  return candles.length > 0 ? candles : undefined;
}

async function safeDerivativeCall<T>(callback: () => Promise<T>): Promise<T | undefined> {
  try {
    return await callback();
  } catch {
    return undefined;
  }
}

export async function getCoinalyzeDerivativesData(symbol: string): Promise<CoinalyzeDerivativesData | null> {
  const markets = await getMarkets();
  const market = pickBestMarket(markets, symbol);
  if (!market) return null;

  const now = Math.floor(Date.now() / 1000);
  const from = now - 60 * 60 * 24;
  const commonParams = {
    symbols: market.symbol,
    interval: "1hour",
    from,
    to: now
  };

  const [funding, openInterest, longShort, ohlcv] = await Promise.all([
    safeDerivativeCall(() => coinalyzeFetch<CoinalyzeHistoryResponse[]>("/funding-rate-history", commonParams)),
    safeDerivativeCall(() => coinalyzeFetch<CoinalyzeHistoryResponse[]>("/open-interest-history", commonParams)),
    safeDerivativeCall(() => coinalyzeFetch<CoinalyzeHistoryResponse[]>("/long-short-ratio-history", commonParams)),
    safeDerivativeCall(() => coinalyzeFetch<CoinalyzeHistoryResponse[]>("/ohlcv-history", commonParams))
  ]);

  return {
    fundingRate: funding ? latestValue(funding) : undefined,
    openInterest: openInterest ? latestValue(openInterest) : undefined,
    longShortRatio: longShort ? latestValue(longShort) : undefined,
    candles: ohlcv ? normalizeCandles(ohlcv) : undefined,
    sourceSymbol: market.symbol
  };
}
