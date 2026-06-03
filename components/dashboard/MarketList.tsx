import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { MarketCoin } from "@/lib/types/market";

type MarketListProps = {
  title: string;
  coins: MarketCoin[];
  tone: "success" | "danger";
};

export function MarketList({ title, coins, tone }: MarketListProps) {
  const isPump = tone === "success";

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-glow">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPump ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
          Mock data
        </span>
      </div>

      <div className="space-y-3">
        {coins.map((coin) => (
          <Link
            href={`/coin/${coin.symbol}`}
            key={coin.symbol}
            className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-cyan-400/40 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">#{coin.rank}</span>
                  <strong className="text-sm text-slate-100">{coin.symbol}</strong>
                  <span className="truncate text-xs text-slate-500">{coin.name}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Vol neuron {coin.volumeScore}/100</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-100">${coin.price.toLocaleString()}</p>
                <p className={`text-sm font-semibold ${isPump ? "text-emerald-300" : "text-rose-300"}`}>
                  {coin.change24h > 0 ? "+" : ""}{coin.change24h}%
                </p>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={coin.volumeScore} tone={tone} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
