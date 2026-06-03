import Link from "next/link";
import { AgentVisualPanel } from "@/components/agent/AgentVisualPanel";
import { AppShell } from "@/components/ui/AppShell";
import { findMockCoin, mockAgentAnalysis } from "@/lib/services/mock-market-data";

type CoinPageProps = {
  params: {
    symbol: string;
  };
};

export default function CoinPage({ params }: CoinPageProps) {
  const symbol = params.symbol.toUpperCase();
  const coin = findMockCoin(symbol);
  const analysis = { ...mockAgentAnalysis, symbol };

  return (
    <AppShell title={`${symbol} Analysis`} subtitle="Single coin page skeleton with mock visual agent output.">
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-glow">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Coin profile</p>
          <h2 className="mt-3 text-4xl font-bold text-white">{symbol}</h2>
          {coin ? (
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-200">{coin.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">Price</span>
                <span className="font-medium text-slate-200">${coin.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-500">24h change</span>
                <span className={coin.change24h >= 0 ? "font-medium text-emerald-300" : "font-medium text-rose-300"}>
                  {coin.change24h > 0 ? "+" : ""}{coin.change24h}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Direction</span>
                <span className="font-medium capitalize text-slate-200">{coin.direction}</span>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-slate-400">
              Coin ini belum ada di mock list. Halaman tetap aktif supaya route dinamis bisa dites.
            </p>
          )}
          <Link href="/dashboard" className="mt-6 inline-flex rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400/50">
            Back to dashboard
          </Link>
        </section>

        <AgentVisualPanel analysis={analysis} />
      </div>
    </AppShell>
  );
}
