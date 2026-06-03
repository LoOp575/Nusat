import { ProgressBar } from "@/components/ui/ProgressBar";

type ScoreCardProps = {
  label: string;
  value: number;
  description?: string;
};

export function ScoreCard({ label, value, description }: ScoreCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
        </div>
        <strong className="text-2xl text-slate-100">{value}</strong>
      </div>
      <div className="mt-4">
        <ProgressBar value={value} />
      </div>
    </div>
  );
}
