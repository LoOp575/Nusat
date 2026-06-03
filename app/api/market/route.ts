import { NextResponse } from "next/server";
import { getMockMarketSnapshot } from "@/lib/api/market";

export async function GET() {
  const snapshot = await getMockMarketSnapshot();
  return NextResponse.json(snapshot);
}
