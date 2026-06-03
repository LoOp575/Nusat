type ProgressBarProps = {
  value: number;
  tone?: "success" | "danger" | "accent";
};

const toneClass = {
  success: "bg-emerald-400",
  danger: "bg-rose-400",
  accent: "bg-cyan-400"
};

export function ProgressBar({ value, tone = "accent" }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div className={`h-full rounded-full ${toneClass[tone]}`} style={{ width: `${safeValue}%` }} />
    </div>
  );
}
