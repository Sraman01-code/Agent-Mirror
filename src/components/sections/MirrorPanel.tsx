import type { DemoResult } from "@/components/types";

const RISK_STYLE: Record<string, string> = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-emerald-500/15 text-emerald-400",
  none: "bg-neutral-700/40 text-neutral-300",
};

export function MirrorPanel({ data }: { data: DemoResult }) {
  const q = data.representation[0]?.questions[0];

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Step 2 · Mirror — how AI represents you today
        </p>
        <h2 className="mt-1 text-xl font-semibold">Current vs desired</h2>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
            Current AI perception
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-200">
            {data.currentPerception}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Desired representation
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-200">
            {data.desiredRepresentation}
          </p>
        </div>
      </div>

      {q && (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Simulated agent answer · AquaTrail Pro
            </p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                RISK_STYLE[q.misrepresentationRisk] ?? RISK_STYLE.none
              }`}
            >
              Misrepresentation risk: {q.misrepresentationRisk.toUpperCase()}
            </span>
          </div>
          <p className="mt-2 text-sm italic text-neutral-300">“{q.answer}”</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {q.missingToAnswer.map((m) => (
              <span
                key={m}
                className="rounded-full border border-neutral-700 bg-neutral-800/60 px-3 py-1 text-xs text-neutral-300"
              >
                missing: {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
