import type { DemoResult } from "@/components/types";
import { Panel } from "@/components/primitives/Panel";
import { DeltaBar } from "@/components/primitives/DeltaBar";

// M9.1 polish; M6.1 wiring contract preserved: the panel renders the curated
// before/after (which the deterministic engine reproduces exactly — 58 → 76,
// Δ+18, band At Risk). A parent inside a <SimulationProvider> may pass a live
// `simulation` override; when omitted the static seed value is used.
export function SimulatePanel({
  data,
  simulation: override,
  index = 4,
}: {
  data: DemoResult;
  simulation?: DemoResult["simulation"];
  index?: number;
}) {
  const simulation = override ?? data.simulation;
  const sample = simulation.sampleAnswers[0];
  const planById = new Map(data.plan.map((r) => [r.id, r]));
  const applied = simulation.appliedRecommendationIds
    .map((id) => planById.get(id))
    .filter(Boolean) as DemoResult["plan"];

  return (
    <Panel
      id="simulate"
      step={5}
      index={index}
      kicker="Simulate — prove the lift"
      title="Before / after representation"
      subtitle="Apply the curated top fixes, re-audit, re-score. Deterministic and rehearsable."
    >
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="flex items-center justify-center rounded-xl border border-line bg-surface-sunk p-6">
          <DeltaBar
            before={simulation.before.arq}
            after={simulation.after.arq}
          />
        </div>

        <div className="space-y-2.5">
          {simulation.after.pillars.map((ap) => {
            const bp = simulation.before.pillars.find(
              (x) => x.pillar === ap.pillar,
            );
            const from = bp?.score ?? 0;
            const gain = ap.score - from;
            return (
              <div
                key={ap.pillar}
                className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-2.5 text-sm"
              >
                <span className="text-ink-muted">{ap.label}</span>
                <span className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-ink-faint">{from}</span>
                  <span className="text-ink-faint">→</span>
                  <span className="text-ink">{ap.score}</span>
                  {gain > 0 && (
                    <span className="rounded bg-signal-good/15 px-1.5 py-0.5 text-signal-good">
                      +{gain}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-line bg-surface-sunk p-5">
        <p className="font-mono text-[0.66rem] uppercase tracking-kicker text-ink-faint">
          Selected fixes applied
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {applied.map((r) => (
            <span
              key={r.id}
              className="inline-flex items-center gap-2 rounded-full border border-signal-good/25 bg-signal-good/[0.06] px-3 py-1 text-xs text-ink"
            >
              <span className="text-signal-good">✓</span>
              {r.title}
              <span className="font-mono text-[0.66rem] text-signal-good">
                +{r.predictedArqGain}
              </span>
            </span>
          ))}
        </div>
        {simulation.drivers.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm text-ink-muted">
            {simulation.drivers.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal-good" />
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>

      {sample && (
        <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          <div className="bg-signal-risk/[0.05] p-5">
            <p className="font-mono text-[0.66rem] uppercase tracking-kicker text-signal-risk">
              Before · hedged
            </p>
            <p className="mt-2 text-sm italic leading-relaxed text-ink-muted">
              “{sample.before}”
            </p>
          </div>
          <div className="bg-signal-good/[0.05] p-5">
            <p className="font-mono text-[0.66rem] uppercase tracking-kicker text-signal-good">
              After · confident
            </p>
            <p className="mt-2 text-sm italic leading-relaxed text-ink">
              “{sample.after}”
            </p>
          </div>
        </div>
      )}
    </Panel>
  );
}
