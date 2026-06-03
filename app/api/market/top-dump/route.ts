import { NextResponse } from "next/server";
import { getTopDumpCoins } from "@/lib/services/marketDataService";

export async function GET() {
  try {
    const data = await getTopDumpCoins();
    return NextResponse.json({ status: "success", data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown top dump API error";
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to load real top dump market data",
        details: message
      },
      { status: 502 }
    );
  }
}
