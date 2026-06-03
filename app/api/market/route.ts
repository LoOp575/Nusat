import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Use /api/market/top-pump, /api/market/top-dump, or /api/market/coin/[symbol]. This route does not return mock data."
  });
}
