import { topDumpCoins, topPumpCoins } from "@/lib/services/mock-market-data";

export async function getMockMarketSnapshot() {
  return {
    pumps: topPumpCoins,
    dumps: topDumpCoins,
    updatedAt: new Date().toISOString()
  };
}
