import type { DemoResult } from "@/components/types";
import { DeltaBar } from "@/components/primitives/DeltaBar";

// M6.1 wiring: the panel is unchanged for the static demo (it renders the
// curated before/after, which the deterministic M6.1 engine reproduces
// EXACTLY — base 58 → after 76, Δ+18, band At Risk, via the priority-ranked
// curated subset clarify-return-policy + add-shipping-details +
// add-product-specs). For interactive use, a parent inside a
// <SimulationProvider> may pass `simulation` to drive the same view from a
// live `POST /api/simulate` SimulationResult. When omitted, output is
// byte-identical to M1.2 (no restyle, no number change, no other panel).
export function SimulatePanel({
  data,
  simulation: override,
}: {
  data: DemoResult;
  simulation?: DemoResult["simulation"];
}) {
  const simulation = override ?? data.simulation;
  const sample = simulation.sampleAnswers[0];

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Step 5 · Simulate — prove the lift
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          Before / after representation
        </h2>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-5">
          <DeltaBar before={simulation.before.arq} after={simulation.after.arq} />
        </div>

        <div className="space-y-3">
          {simulation.after.pillars.map((ap) => {
            const bp = simulation.before.pillars.find(
              (x) => x.pillar === ap.pillar,
            );
            const from = bp?.score ?? 0;
            const gain = ap.score - from;
            return (
              <div
                key={ap.pillar}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm"
              >
                <span className="text-neutral-300">{ap.label}</span>
                <span className="tabular-nums text-neutral-400">
                  {from} → {ap.score}
                  {gain > 0 && (
                    <span className="ml-2 text-emerald-400">+{gain}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          What drove the improvement
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-300">
          {simulation.drivers.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>

      {sample && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
              Before
            </p>
            <p className="mt-2 text-sm italic text-neutral-300">
              “{sample.before}”
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              After
            </p>
            <p className="mt-2 text-sm italic text-neutral-300">
              “{sample.after}”
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
