import { NextRequest, NextResponse } from "next/server";
import { getCoinMarketData } from "@/lib/services/marketDataService";
import type { EngineAnalysis, NormalizedMarketData } from "@/lib/types/market";

type AnalyzeRequestBody = {
  symbol?: string;
};

function getPythonEngineUrl(): string {
  return process.env.PYTHON_AI_ENGINE_URL ?? "http://localhost:8000";
}

function normalizeSymbol(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const symbol = value.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,15}$/.test(symbol)) return null;
  return symbol;
}

function buildEngineDataQuality(market: NormalizedMarketData) {
  const hasPrice = Number.isFinite(market.price);
  const hasVolume = Number.isFinite(market.volume24h);
  const hasCandles = Boolean(market.candles?.length);
  const hasPriceSeries = Boolean(market.priceSeries?.length);
  const missing = [...market.dataQuality.missingFields];

  if (!hasPrice && !missing.includes("price")) missing.push("price");
  if (!hasVolume && !missing.includes("volume24h")) missing.push("volume24h");
  if (!hasCandles && !missing.includes("candles")) missing.push("candles");
  if (!hasPriceSeries && !missing.includes("priceSeries")) missing.push("priceSeries");

  return {
    quality: hasCandles ? "full" : hasPriceSeries ? "partial" : "insufficient",
    hasPrice,
    hasVolume,
    hasCandles,
    hasPriceSeries,
    missing: Array.from(new Set(missing))
  };
}

function hasEnoughDataForNeuralAnalysis(market: NormalizedMarketData): boolean {
  return (
    Number.isFinite(market.price) &&
    Number.isFinite(market.change24h) &&
    Number.isFinite(market.volume24h) &&
    (Boolean(market.candles?.length) || Boolean(market.priceSeries?.length))
  );
}

function buildPythonPayload(market: NormalizedMarketData) {
  return {
    symbol: market.symbol,
    name: market.name,
    price: market.price,
    change24h: market.change24h,
    volume24h: market.volume24h,
    marketCap: market.marketCap,
    fundingRate: market.fundingRate,
    openInterest: market.openInterest,
    longShortRatio: market.longShortRatio,
    candles: market.candles ?? [],
    priceSeries: market.priceSeries ?? [],
    dataQuality: buildEngineDataQuality(market),
    settings: {
      inventory: 0,
      riskAversion: 0.1,
      timeRemaining: 1,
      liquidityK: 1.5
    }
  };
}

async function callPythonEngine(payload: ReturnType<typeof buildPythonPayload>): Promise<EngineAnalysis> {
  const engineUrl = getPythonEngineUrl().replace(/\/$/, "");

  let response: Response;
  try {
    response = await fetch(`${engineUrl}/analyze`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });
  } catch {
    throw new Error("python_engine_offline");
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`python_engine_error:${response.status}:${body.slice(0, 240)}`);
  }

  return response.json() as Promise<EngineAnalysis>;
}

export async function POST(request: NextRequest) {
  let body: AnalyzeRequestBody;

  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_symbol",
        message: "Request body must be valid JSON with symbol"
      },
      { status: 400 }
    );
  }

  const symbol = normalizeSymbol(body.symbol);
  if (!symbol) {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_symbol",
        message: "Symbol is required. Example: ZEC, BTC, ETH"
      },
      { status: 400 }
    );
  }

  let market: NormalizedMarketData;
  try {
    market = await getCoinMarketData(symbol);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        reason: "market_data_error",
        message: `Failed to load real market data for ${symbol}`,
        details: error instanceof Error ? error.message : "Unknown market data error"
      },
      { status: 502 }
    );
  }

  const dataQuality = buildEngineDataQuality(market);
  if (!hasEnoughDataForNeuralAnalysis(market)) {
    return NextResponse.json(
      {
        ok: false,
        reason: "data_incomplete",
        message: "Market data is incomplete for neural analysis",
        dataQuality
      },
      { status: 422 }
    );
  }

  try {
    const analysis = await callPythonEngine(buildPythonPayload(market));
    return NextResponse.json({
      ok: true,
      source: "python_ai_engine",
      analysis
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Python engine error";
    if (message === "python_engine_offline") {
      return NextResponse.json(
        {
          ok: false,
          reason: "python_engine_offline",
          message: "Python AI Neuron Engine is offline. Start FastAPI server on port 8000."
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        reason: "python_engine_error",
        message: "Python AI Neuron Engine failed to analyze market data",
        details: message
      },
      { status: 502 }
    );
  }
}
