import type { AgentAnalysis, MarketCoin } from "@/lib/types/market";

export const topPumpCoins: MarketCoin[] = [
  { rank: 1, symbol: "ZEC", name: "Zcash", price: 84.12, change24h: 18.6, volumeScore: 91, direction: "pump" },
  { rank: 2, symbol: "SOL", name: "Solana", price: 173.44, change24h: 12.3, volumeScore: 87, direction: "pump" },
  { rank: 3, symbol: "TIA", name: "Celestia", price: 9.42, change24h: 10.8, volumeScore: 82, direction: "pump" },
  { rank: 4, symbol: "RNDR", name: "Render", price: 11.25, change24h: 9.7, volumeScore: 79, direction: "pump" },
  { rank: 5, symbol: "INJ", name: "Injective", price: 31.09, change24h: 8.9, volumeScore: 78, direction: "pump" },
  { rank: 6, symbol: "AVAX", name: "Avalanche", price: 39.74, change24h: 7.8, volumeScore: 74, direction: "pump" },
  { rank: 7, symbol: "NEAR", name: "Near", price: 7.13, change24h: 7.1, volumeScore: 72, direction: "pump" },
  { rank: 8, symbol: "ARB", name: "Arbitrum", price: 1.34, change24h: 6.8, volumeScore: 69, direction: "pump" },
  { rank: 9, symbol: "OP", name: "Optimism", price: 2.87, change24h: 6.2, volumeScore: 67, direction: "pump" },
  { rank: 10, symbol: "LINK", name: "Chainlink", price: 18.41, change24h: 5.9, volumeScore: 65, direction: "pump" }
];

export const topDumpCoins: MarketCoin[] = [
  { rank: 1, symbol: "WIF", name: "dogwifhat", price: 2.11, change24h: -16.4, volumeScore: 89, direction: "dump" },
  { rank: 2, symbol: "PEPE", name: "Pepe", price: 0.000011, change24h: -13.7, volumeScore: 84, direction: "dump" },
  { rank: 3, symbol: "DOGE", name: "Dogecoin", price: 0.16, change24h: -11.2, volumeScore: 80, direction: "dump" },
  { rank: 4, symbol: "SHIB", name: "Shiba Inu", price: 0.000024, change24h: -10.5, volumeScore: 78, direction: "dump" },
  { rank: 5, symbol: "BONK", name: "Bonk", price: 0.000029, change24h: -9.4, volumeScore: 75, direction: "dump" },
  { rank: 6, symbol: "LDO", name: "Lido DAO", price: 2.08, change24h: -8.8, volumeScore: 70, direction: "dump" },
  { rank: 7, symbol: "SEI", name: "Sei", price: 0.54, change24h: -8.1, volumeScore: 68, direction: "dump" },
  { rank: 8, symbol: "APT", name: "Aptos", price: 8.91, change24h: -7.2, volumeScore: 65, direction: "dump" },
  { rank: 9, symbol: "SUI", name: "Sui", price: 1.73, change24h: -6.6, volumeScore: 62, direction: "dump" },
  { rank: 10, symbol: "MATIC", name: "Polygon", price: 0.72, change24h: -6.1, volumeScore: 60, direction: "dump" }
];

export const mockAgentAnalysis: AgentAnalysis = {
  symbol: "ZEC",
  signalScore: 74,
  liquidityScore: 68,
  crowdScore: 61,
  riskLevel: "medium",
  scenarios: [
    { label: "Long continuation", probability: 46 },
    { label: "Retest / pullback", probability: 34 },
    { label: "Short trap", probability: 20 }
  ]
};

export function findMockCoin(symbol: string): MarketCoin | undefined {
  const upperSymbol = symbol.toUpperCase();
  return [...topPumpCoins, ...topDumpCoins].find((coin) => coin.symbol === upperSymbol);
}
