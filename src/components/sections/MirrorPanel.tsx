import type { DemoResult } from "@/components/types";
import { Panel } from "@/components/primitives/Panel";

const RISK_STYLE: Record<string, string> = {
  high: "bg-signal-risk/15 text-signal-risk",
  medium: "bg-signal-warn/15 text-signal-warn",
  low: "bg-signal-good/15 text-signal-good",
  none: "bg-surface-raised text-ink-muted",
};

export function MirrorPanel({
  data,
  index = 1,
}: {
  data: DemoResult;
  index?: number;
}) {
  const q = data.representation[0]?.questions[0];

  return (
    <Panel
      id="mirror"
      step={2}
      index={index}
      kicker="Mirror — how AI sees you today"
      title="Current perception vs desired representation"
      subtitle="Technically present, semantically flattened. An unsure agent recommends a competitor."
    >
      <div className="relative grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
        <div className="bg-signal-risk/[0.05] p-6">
          <p className="flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-kicker text-signal-risk">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-risk" />
            Current AI perception
          </p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink">
            {data.currentPerception}
          </p>
        </div>
        <div className="bg-signal-good/[0.05] p-6">
          <p className="flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-kicker text-signal-good">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-good" />
            Desired representation
          </p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink">
            {data.desiredRepresentation}
          </p>
        </div>
        <div
          aria-hidden
          className="seam absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 md:block"
        />
      </div>

      {q && (
        <div className="mt-5 rounded-xl border border-line bg-surface-sunk p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[0.66rem] uppercase tracking-kicker text-ink-faint">
              Simulated agent answer · AquaTrail Pro
            </p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                RISK_STYLE[q.misrepresentationRisk] ?? RISK_STYLE.none
              }`}
            >
              Misrepresentation risk: {q.misrepresentationRisk.toUpperCase()}
            </span>
          </div>
          <p className="mt-3 border-l-2 border-signal-risk/40 pl-4 font-display text-lg italic leading-relaxed text-ink-muted">
            “{q.answer}”
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {q.missingToAnswer.map((m) => (
              <span
                key={m}
                className="rounded-full border border-signal-risk/25 bg-signal-risk/[0.06] px-3 py-1 font-mono text-[0.68rem] text-signal-risk/90"
              >
                missing · {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
