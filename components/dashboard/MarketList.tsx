import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { NormalizedMarketData } from "@/lib/types/market";

type MarketListProps = {
  title: string;
  coins: NormalizedMarketData[];
  tone: "success" | "danger";
  loading?: boolean;
  error?: string;
};

function formatUsd(value: number): string {
  if (value < 0.01) return `$${value.toPrecision(4)}`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

function volumeScore(volume24h: number): number {
  if (!Number.isFinite(volume24h) || volume24h <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((Math.log10(volume24h) / 10) * 100)));
}

export function MarketList({ title, coins, tone, loading = false, error }: MarketListProps) {
  const isPump = tone === "success";

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-glow">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPump ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
          Real API
        </span>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">
          Loading real market data...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-5 text-sm text-rose-200">
          <p className="font-semibold">Failed to load real data</p>
          <p className="mt-2 text-rose-100/80">{error}</p>
        </div>
      ) : coins.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">
          No real market data returned from API.
        </div>
      ) : (
        <div className="space-y-3">
          {coins.map((coin, index) => {
            const score = volumeScore(coin.volume24h);

            return (
              <Link
                href={`/coin/${coin.symbol}`}
                key={`${coin.symbol}-${index}`}
                className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-cyan-400/40 hover:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">#{index + 1}</span>
                      <strong className="text-sm text-slate-100">{coin.symbol}</strong>
                      <span className="truncate text-xs text-slate-500">{coin.name ?? "Unknown"}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">24h volume {formatUsd(coin.volume24h)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-100">{formatUsd(coin.price)}</p>
                    <p className={`text-sm font-semibold ${coin.change24h >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                      {coin.change24h > 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={score} tone={tone} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
