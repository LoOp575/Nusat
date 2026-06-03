import { MarketList } from "@/components/dashboard/MarketList";
import type { NormalizedMarketData } from "@/lib/types/market";

type TopPumpListProps = {
  coins: NormalizedMarketData[];
  loading?: boolean;
  error?: string;
};

export function TopPumpList({ coins, loading, error }: TopPumpListProps) {
  return <MarketList title="Top 10 Pump" coins={coins} tone="success" loading={loading} error={error} />;
}
