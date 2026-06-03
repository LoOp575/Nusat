import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Scenario } from "@/lib/types/market";

type ScenarioBarsProps = {
  scenarios: Scenario[];
};

export function ScenarioBars({ scenarios }: ScenarioBarsProps) {
  return (
    <div className="space-y-4">
      {scenarios.map((scenario) => (
        <div key={scenario.label} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-300">{scenario.label}</span>
            <span className="font-semibold text-cyan-200">{scenario.probability}%</span>
          </div>
          <ProgressBar value={scenario.probability} />
        </div>
      ))}
    </div>
  );
}
