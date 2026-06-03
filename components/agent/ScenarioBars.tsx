import { ProgressBar } from "@/components/ui/ProgressBar";

type Scenario = {
  name: string;
  probability: number;
};

type ScenarioBarsProps = {
  scenarios: Scenario[];
};

export function ScenarioBars({ scenarios }: ScenarioBarsProps) {
  return (
    <div className="space-y-4">
      {scenarios.map((scenario) => (
        <div key={scenario.name} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-300">{scenario.name}</span>
            <span className="font-semibold text-cyan-200">{scenario.probability}%</span>
          </div>
          <ProgressBar value={scenario.probability} />
        </div>
      ))}
    </div>
  );
}
