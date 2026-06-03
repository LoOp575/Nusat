import Link from "next/link";
import { AgentVisualPanel } from "@/components/agent/AgentVisualPanel";
import { AppShell } from "@/components/ui/AppShell";
import { getCoinMarketData } from "@/lib/services/marketDataService";

type CoinPageProps = {
  params: {
    symbol: string;
  };
};

function formatUsd(value: number): string {
  if (value < 0.01) return `$${value.toPrecision(4)}`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}

export default async function CoinPage({ params }: CoinPageProps) {
  const symbol = params.symbol.toUpperCase();
  let coin = null;
  let error = "";

  try {
    coin = await getCoinMarketData(symbol);
  } catch (caughtError) {
    error = caughtError instanceof Error ? caughtError.message : "Unknown market data error";
  }

  return (
    <AppShell title={`${symbol} Analysis`} subtitle="Single coin page with real server-side market data only.">
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-glow">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Coin profile</p>
          <h2 className="mt-3 text-4xl font-bold text-white">{symbol}</h2>
          {coin ? (
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-200">{coin.name ?? "Unknown"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">Price</span>
                <span className="font-medium text-slate-200">{formatUsd(coin.price)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">24h change</span>
                <span className={coin.change24h >= 0 ? "font-medium text-emerald-300" : "font-medium text-rose-300"}>
                  {coin.change24h > 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">24h volume</span>
                <span className="font-medium text-slate-200">{formatUsd(coin.volume24h)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">Market cap</span>
                <span className="font-medium text-slate-200">{coin.marketCap ? formatUsd(coin.marketCap) : "Unavailable"}</span>
              </div>
              <div>
                <span className="text-slate-500">Sources</span>
                <p className="mt-2 text-xs text-slate-400">{coin.dataQuality.sourcesUsed.join(", ")}</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
              <p className="font-semibold">Real market data unavailable</p>
              <p className="mt-2 text-rose-100/80">{error}</p>
            </div>
          )}
          <Link href="/dashboard" className="mt-6 inline-flex rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400/50">
            Back to dashboard
          </Link>
        </section>

        <AgentVisualPanel />
      </div>
    </AppShell>
  );
}
