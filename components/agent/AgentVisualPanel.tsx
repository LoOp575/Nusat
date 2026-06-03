import { RiskBadge } from "@/components/agent/RiskBadge";
import { ScenarioBars } from "@/components/agent/ScenarioBars";
import { ScoreCard } from "@/components/ui/ScoreCard";
import type { AgentAnalysis } from "@/lib/types/market";

type AgentVisualPanelProps = {
  analysis?: AgentAnalysis;
};

export function AgentVisualPanel({ analysis }: AgentVisualPanelProps) {
  if (!analysis) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center shadow-glow">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
          ◌
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-100">Agent analysis empty</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
          Ketik command seperti <span className="text-cyan-200">cek koin ZEC</span>. Di tahap skeleton ini belum ada engine asli, jadi panel disiapkan sebagai tempat output visual neuron nanti.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-glow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Agent Output</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{analysis.symbol} neuron map</h2>
        </div>
        <RiskBadge level={analysis.riskLevel} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ScoreCard label="Signal" value={analysis.signalScore} description="Mock weighted neuron score" />
        <ScoreCard label="Liquidity" value={analysis.liquidityScore} description="Mock liquidity dominance" />
        <ScoreCard label="Crowd" value={analysis.crowdScore} description="Mock psychology pressure" />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Scenario probability</h3>
        <ScenarioBars scenarios={analysis.scenarios} />
      </div>
    </section>
  );
}
