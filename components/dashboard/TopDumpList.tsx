import { MarketList } from "@/components/dashboard/MarketList";
import type { NormalizedMarketData } from "@/lib/types/market";

type TopDumpListProps = {
  coins: NormalizedMarketData[];
  loading?: boolean;
  error?: string;
};

export function TopDumpList({ coins, loading, error }: TopDumpListProps) {
  return <MarketList title="Top 10 Dump" coins={coins} tone="danger" loading={loading} error={error} />;
}
