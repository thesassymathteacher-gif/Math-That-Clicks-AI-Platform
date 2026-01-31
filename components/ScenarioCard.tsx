import { Scenario } from "@/lib/scenarios";

type ScenarioCardProps = {
  scenario: Scenario;
  recommended?: boolean;
  selected: boolean;
  onSelect: (id: Scenario["id"]) => void;
};

export default function ScenarioCard({ scenario, recommended, selected, onSelect }: ScenarioCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(scenario.id)}
      className={`flex h-full w-full flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition focus:outline-none ${
        selected ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white"
      }`}
      aria-pressed={selected}
    >
      <div className="flex w-full items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{scenario.title}</h3>
        {recommended && (
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            Recommended
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600">{scenario.description}</p>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Same math, different world</span>
    </button>
  );
}
