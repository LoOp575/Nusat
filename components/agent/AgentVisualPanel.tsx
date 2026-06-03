import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreCard } from "@/components/ui/ScoreCard";
import type { AnalyzeApiError, EngineAnalysis } from "@/lib/types/market";

type AgentVisualPanelProps = {
  analysis?: EngineAnalysis | null;
  error?: AnalyzeApiError | null;
  loadingLabel?: string;
};

function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (Math.abs(value) < 0.01) return value.toPrecision(4);
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function QualityBadge({ quality }: { quality: EngineAnalysis["dataQuality"]["quality"] }) {
  const styles = {
    full: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    partial: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    insufficient: "border-rose-400/30 bg-rose-400/10 text-rose-300"
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles[quality]}`}>{quality}</span>;
}

export function AgentVisualPanel({ analysis, error, loadingLabel }: AgentVisualPanelProps) {
  if (error) {
    return (
      <section className="rounded-3xl border border-rose-400/30 bg-rose-400/10 p-6 shadow-glow">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-300">Analysis Error</p>
        <h2 className="mt-2 text-xl font-semibold text-rose-100">{error.message}</h2>
        <p className="mt-2 text-sm text-rose-100/80">Reason: {error.reason}</p>
        {error.details ? <p className="mt-2 text-xs text-rose-100/70">{error.details}</p> : null}
        {error.dataQuality ? (
          <pre className="mt-4 overflow-auto rounded-2xl border border-rose-400/20 bg-slate-950/60 p-4 text-xs text-rose-100/80">
            {JSON.stringify(error.dataQuality, null, 2)}
          </pre>
        ) : null}
      </section>
    );
  }

  if (!analysis) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center shadow-glow">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
          ◌
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-100">Agent analysis empty</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
          Ketik command seperti <span className="text-cyan-200">cek koin ZEC</span>. Market data akan dikirim ke Python AI Neuron Engine lewat server route.
        </p>
        {loadingLabel ? <p className="mt-4 text-sm text-cyan-200">{loadingLabel}</p> : null}
      </section>
    );
  }

  const { decision, pressure, neuralScores, marketMaking, scenarios, dataQuality } = analysis;

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Python AI Output</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{analysis.symbol} neuron map</h2>
        </div>
        <QualityBadge quality={dataQuality.quality} />
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Current Decision</p>
            <h3 className="mt-2 text-3xl font-bold text-white">{decision.decision}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Confidence</p>
            <p className="text-3xl font-bold text-cyan-200">{decision.confidence}%</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm">
            <p className="text-slate-500">Dominant side</p>
            <p className="mt-1 font-semibold capitalize text-slate-100">{decision.dominantSide}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm">
            <p className="text-slate-500">Trade mode</p>
            <p className="mt-1 font-semibold capitalize text-slate-100">{decision.tradeMode}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm">
            <p className="text-slate-500">Risk level</p>
            <p className="mt-1 font-semibold capitalize text-slate-100">{decision.riskLevel}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {decision.dominantReasons.map((reason) => (
            <span key={reason} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
              {reason}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">Invalidation: {decision.invalidationHint}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ScoreCard label="Bullish Pressure" value={neuralScores.bullishPressure} description="Python fusion score" />
        <ScoreCard label="Bearish Pressure" value={neuralScores.bearishPressure} description="Python fusion score" />
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Pressure Battle</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 flex justify-between text-sm"><span>Buy pressure</span><span>{pressure.buyPressureIntegral}%</span></div>
            <ProgressBar value={pressure.buyPressureIntegral} tone="success" />
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm"><span>Sell pressure</span><span>{pressure.sellPressureIntegral}%</span></div>
            <ProgressBar value={pressure.sellPressureIntegral} tone="danger" />
          </div>
          <ScoreCard label="Momentum Velocity" value={pressure.momentumVelocity} />
          <ScoreCard label="Momentum Acceleration" value={pressure.momentumAcceleration} />
          <ScoreCard label="Volatility Pressure" value={pressure.volatilityPressure} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <ScoreCard label="Trap Probability" value={neuralScores.trapProbability} />
        <ScoreCard label="Risk Score" value={neuralScores.riskScore} />
        <ScoreCard label="Liquidity Dominance" value={neuralScores.liquidityDominance} />
        <ScoreCard label="Market Strength" value={neuralScores.marketStrength} />
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Scenario Probability</h3>
        <div className="mt-5 space-y-4">
          {scenarios.map((scenario) => (
            <div key={scenario.name}>
              <div className="mb-2 flex justify-between text-sm"><span>{scenario.name}</span><span>{scenario.probability}%</span></div>
              <ProgressBar value={scenario.probability} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Avellaneda Market Making</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm"><p className="text-slate-500">Reservation</p><p className="mt-1 font-semibold">{formatPrice(marketMaking.reservationPrice)}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm"><p className="text-slate-500">Bid</p><p className="mt-1 font-semibold">{formatPrice(marketMaking.bidPrice)}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm"><p className="text-slate-500">Ask</p><p className="mt-1 font-semibold">{formatPrice(marketMaking.askPrice)}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm"><p className="text-slate-500">Spread</p><p className="mt-1 font-semibold">{formatPrice(marketMaking.totalSpread)}</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm"><p className="text-slate-500">Liquidity Risk</p><p className="mt-1 font-semibold">{marketMaking.liquidityRisk}%</p></div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
        Data quality notes: {dataQuality.notes.length ? dataQuality.notes.join(" · ") : "none"}
      </div>
    </section>
  );
}
