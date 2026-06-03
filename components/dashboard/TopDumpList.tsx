import { MarketList } from "@/components/dashboard/MarketList";
import type { MarketCoin } from "@/lib/types/market";

type TopDumpListProps = {
  coins: MarketCoin[];
};

export function TopDumpList({ coins }: TopDumpListProps) {
  return <MarketList title="Top 10 Dump" coins={coins} tone="danger" />;
}
