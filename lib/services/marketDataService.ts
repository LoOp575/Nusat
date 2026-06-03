import { getCoinalyzeDerivativesData } from "@/lib/api/coinalyze";
import { getCoinRankingCoins, searchCoinRankingCoin } from "@/lib/api/coinranking";
import { searchCryptoRankMarketData } from "@/lib/api/cryptorank";
import type { NormalizedMarketData } from "@/lib/types/market";

const TOP_LIMIT = 10;

function uniqueSources(sources: string[]): string[] {
  return Array.from(new Set(sources));
}

function computeMissingFields(data: Partial<NormalizedMarketData>): string[] {
  const requiredOptionalFields: Array<keyof NormalizedMarketData> = [
    "marketCap",
    "fundingRate",
    "openInterest",
    "longShortRatio",
    "candles",
    "priceSeries"
  ];

  return requiredOptionalFields.filter((field) => {
    if (field === "candles") return !data.candles?.length;
    if (field === "priceSeries") return !data.priceSeries?.length;
    return data[field] === undefined;
  });
}

function enrichDataQuality(data: NormalizedMarketData, sourcesUsed: string[]): NormalizedMarketData {
  const missingFields = computeMissingFields(data);

  return {
    ...data,
    dataQuality: {
      hasSpotData: true,
      hasDerivativesData:
        data.fundingRate !== undefined || data.openInterest !== undefined || data.longShortRatio !== undefined,
      hasCandles: Boolean(data.candles?.length),
      hasPriceSeries: Boolean(data.priceSeries?.length),
      missingFields,
      sourcesUsed: uniqueSources([...data.dataQuality.sourcesUsed, ...sourcesUsed])
    }
  };
}

async function tryGetCryptoRank(symbol: string): Promise<Partial<NormalizedMarketData> | null> {
  try {
    return await searchCryptoRankMarketData(symbol);
  } catch {
    return null;
  }
}

async function tryGetCoinalyze(symbol: string) {
  try {
    return await getCoinalyzeDerivativesData(symbol);
  } catch {
    return null;
  }
}

export async function getTopPumpCoins(): Promise<NormalizedMarketData[]> {
  const coins = await getCoinRankingCoins(100);
  return coins
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, TOP_LIMIT)
    .map((coin) => enrichDataQuality(coin, ["CoinRanking"]));
}

export async function getTopDumpCoins(): Promise<NormalizedMarketData[]> {
  const coins = await getCoinRankingCoins(100);
  return coins
    .sort((a, b) => a.change24h - b.change24h)
    .slice(0, TOP_LIMIT)
    .map((coin) => enrichDataQuality(coin, ["CoinRanking"]));
}

export async function getCoinMarketData(symbol: string): Promise<NormalizedMarketData> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  if (!normalizedSymbol) {
    throw new Error("Symbol is required");
  }

  const spot = await searchCoinRankingCoin(normalizedSymbol);
  if (!spot) {
    throw new Error(`No real spot market data found for symbol ${normalizedSymbol}`);
  }

  const [cryptoRank, derivatives] = await Promise.all([
    tryGetCryptoRank(normalizedSymbol),
    tryGetCoinalyze(normalizedSymbol)
  ]);

  const sourcesUsed = ["CoinRanking"];
  if (cryptoRank) sourcesUsed.push("CryptoRank");
  if (derivatives) sourcesUsed.push("Coinalyze");

  const merged: NormalizedMarketData = {
    ...spot,
    name: spot.name ?? cryptoRank?.name,
    price: spot.price,
    change24h: spot.change24h,
    volume24h: spot.volume24h,
    marketCap: spot.marketCap ?? cryptoRank?.marketCap,
    fundingRate: derivatives?.fundingRate,
    openInterest: derivatives?.openInterest,
    longShortRatio: derivatives?.longShortRatio,
    candles: derivatives?.candles,
    priceSeries: derivatives?.candles?.length
      ? derivatives.candles.map((candle) => ({ timestamp: candle.timestamp, price: candle.close }))
      : spot.priceSeries,
    dataQuality: {
      hasSpotData: true,
      hasDerivativesData: false,
      hasCandles: false,
      hasPriceSeries: false,
      missingFields: [],
      sourcesUsed
    }
  };

  return enrichDataQuality(merged, sourcesUsed);
}
