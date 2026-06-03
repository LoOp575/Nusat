import type { EngineAnalysis } from "@/lib/types/market";

type RiskBadgeProps = {
  level: EngineAnalysis["decision"]["riskLevel"];
};

const styles = {
  low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  high: "border-rose-400/30 bg-rose-400/10 text-rose-300"
};

export function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles[level]}`}>
      {level} risk
    </span>
  );
}
