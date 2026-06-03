import { MarketList } from "@/components/dashboard/MarketList";
import type { MarketCoin } from "@/lib/types/market";

type TopPumpListProps = {
  coins: MarketCoin[];
};

export function TopPumpList({ coins }: TopPumpListProps) {
  return <MarketList title="Top 10 Pump" coins={coins} tone="success" />;
}
