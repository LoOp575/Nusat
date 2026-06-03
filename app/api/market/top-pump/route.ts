import { NextResponse } from "next/server";
import { getTopPumpCoins } from "@/lib/services/marketDataService";

export async function GET() {
  try {
    const data = await getTopPumpCoins();
    return NextResponse.json({ status: "success", data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown top pump API error";
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to load real top pump market data",
        details: message
      },
      { status: 502 }
    );
  }
}
