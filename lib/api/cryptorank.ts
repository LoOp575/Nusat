import type { NormalizedMarketData } from "@/lib/types/market";

const CRYPTORANK_BASE_URL = "https://api.cryptorank.io/v1";

type CryptoRankCurrency = {
  symbol?: string;
  name?: string;
  price?: number;
  values?: {
    USD?: {
      price?: number;
      percentChange24h?: number;
      volume24h?: number;
      marketCap?: number;
    };
  };
};

type CryptoRankResponse = {
  status?: {
    success?: boolean;
    message?: string;
  };
  data?: CryptoRankCurrency[] | CryptoRankCurrency;
};

function getCryptoRankKey(): string {
  const key = process.env.CRYPTORANK_API_KEY;
  if (!key) {
    throw new Error("Missing CRYPTORANK_API_KEY environment variable");
  }
  return key;
}

async function cryptoRankFetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${CRYPTORANK_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString(), {
    headers: {
      "X-Api-Key": getCryptoRankKey()
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`CryptoRank request failed: ${response.status} ${response.statusText}${body ? ` - ${body.slice(0, 180)}` : ""}`);
  }

  return response.json() as Promise<T>;
}

function normalizeCryptoRankCurrency(asset: CryptoRankCurrency): Partial<NormalizedMarketData> | null {
  const usd = asset.values?.USD;
  const symbol = asset.symbol?.toUpperCase();
  if (!symbol || !usd) return null;

  return {
    symbol,
    name: asset.name,
    price: usd.price ?? asset.price,
    change24h: usd.percentChange24h,
    volume24h: usd.volume24h,
    marketCap: usd.marketCap
  };
}

export async function searchCryptoRankMarketData(symbol: string): Promise<Partial<NormalizedMarketData> | null> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const result = await cryptoRankFetch<CryptoRankResponse>("/currencies", {
    symbols: normalizedSymbol,
    limit: 10
  });

  const data = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
  const exact = data.find((asset) => asset.symbol?.toUpperCase() === normalizedSymbol) ?? data[0];
  return exact ? normalizeCryptoRankCurrency(exact) : null;
}
