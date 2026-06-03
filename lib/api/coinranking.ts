import type { NormalizedMarketData } from "@/lib/types/market";

const COINRANKING_BASE_URL = "https://api.coinranking.com/v2";

type CoinRankingCoin = {
  uuid: string;
  symbol: string;
  name: string;
  price?: string;
  change?: string;
  "24hVolume"?: string;
  marketCap?: string;
};

type CoinRankingCoinsResponse = {
  status: string;
  data?: {
    coins?: CoinRankingCoin[];
  };
};

type CoinRankingCoinResponse = {
  status: string;
  data?: {
    coin?: CoinRankingCoin;
  };
};

function getCoinRankingKey(): string {
  const key = process.env.COINRANKING_API_KEY;
  if (!key) {
    throw new Error("Missing COINRANKING_API_KEY environment variable");
  }
  return key;
}

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

async function coinRankingFetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${COINRANKING_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString(), {
    headers: {
      "x-access-token": getCoinRankingKey()
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`CoinRanking request failed: ${response.status} ${response.statusText}${body ? ` - ${body.slice(0, 180)}` : ""}`);
  }

  return response.json() as Promise<T>;
}

export function normalizeCoinRankingCoin(coin: CoinRankingCoin): NormalizedMarketData | null {
  const price = toNumber(coin.price);
  const change24h = toNumber(coin.change);
  const volume24h = toNumber(coin["24hVolume"]);

  if (price === undefined || change24h === undefined || volume24h === undefined) {
    return null;
  }

  const marketCap = toNumber(coin.marketCap);
  const missingFields: string[] = [];
  if (marketCap === undefined) missingFields.push("marketCap");
  missingFields.push("fundingRate", "openInterest", "longShortRatio", "candles");

  return {
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price,
    change24h,
    volume24h,
    marketCap,
    dataQuality: {
      hasSpotData: true,
      hasDerivativesData: false,
      hasCandles: false,
      missingFields,
      sourcesUsed: ["CoinRanking"]
    }
  };
}

export async function getCoinRankingCoins(limit = 100): Promise<NormalizedMarketData[]> {
  const result = await coinRankingFetch<CoinRankingCoinsResponse>("/coins", {
    limit,
    orderBy: "change",
    orderDirection: "desc"
  });

  const coins = result.data?.coins ?? [];
  return coins
    .map(normalizeCoinRankingCoin)
    .filter((coin): coin is NormalizedMarketData => coin !== null);
}

export async function searchCoinRankingCoin(symbol: string): Promise<NormalizedMarketData | null> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const result = await coinRankingFetch<CoinRankingCoinsResponse>("/coins", {
    search: normalizedSymbol,
    limit: 25
  });

  const coins = result.data?.coins ?? [];
  const exact = coins.find((coin) => coin.symbol.toUpperCase() === normalizedSymbol) ?? coins[0];
  return exact ? normalizeCoinRankingCoin(exact) : null;
}

export async function getCoinRankingCoinByUuid(uuid: string): Promise<NormalizedMarketData | null> {
  const result = await coinRankingFetch<CoinRankingCoinResponse>(`/coin/${uuid}`);
  const coin = result.data?.coin;
  return coin ? normalizeCoinRankingCoin(coin) : null;
}
