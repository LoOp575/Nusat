import { NextRequest, NextResponse } from "next/server";
import { getCoinMarketData } from "@/lib/services/marketDataService";

type RouteContext = {
  params: {
    symbol: string;
  };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const data = await getCoinMarketData(params.symbol);
    return NextResponse.json({ status: "success", data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown coin market API error";
    return NextResponse.json(
      {
        status: "error",
        message: `Failed to load real market data for ${params.symbol.toUpperCase()}`,
        details: message
      },
      { status: 502 }
    );
  }
}
