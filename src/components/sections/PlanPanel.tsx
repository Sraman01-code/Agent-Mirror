import type { DemoResult, Recommendation } from "@/components/types";
import { REC_LABEL } from "@/components/types";
import { Panel } from "@/components/primitives/Panel";
import { Meter } from "@/components/primitives/Meter";

const LABEL_STYLE: Record<Recommendation["label"], string> = {
  quick_win: "bg-signal-cool/15 text-signal-cool",
  blocks_trust: "bg-signal-risk/15 text-signal-risk",
  blocks_recommendation: "bg-signal-high/15 text-signal-high",
  needs_theme_change: "bg-signal-warn/15 text-signal-warn",
  can_apply_now: "bg-signal-good/15 text-signal-good",
};

export function PlanPanel({
  data,
  index = 3,
}: {
  data: DemoResult;
  index?: number;
}) {
  const plan = [...data.plan].sort(
    (a, b) => b.priorityScore - a.priorityScore,
  );
  const maxGain = Math.max(...plan.map((r) => r.predictedArqGain), 1);
  const maxEffort = Math.max(...plan.map((r) => r.effort), 1);

  return (
    <Panel
      id="plan"
      step={4}
      index={index}
      kicker="Plan — what to fix first"
      title="Ranked action queue"
      subtitle="Impact × conversion importance × confidence ÷ effort. Gains are computed by actually re-scoring the fixed store — not guessed."
    >
      <ol className="space-y-3">
        {plan.map((r, i) => {
          const top = i < 2;
          return (
            <li
              key={r.id}
              className={`rounded-xl border p-5 ${
                top
                  ? "border-signal-warn/35 bg-signal-warn/[0.05]"
                  : "border-line bg-surface"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-lg tabular ${
                    top
                      ? "bg-signal-warn/20 text-signal-warn"
                      : "bg-surface-raised text-ink-muted"
                  }`}
                >
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <p className="font-display text-lg leading-snug text-ink">
                      {r.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-signal-good/15 px-2.5 py-1 font-mono text-xs font-semibold text-signal-good">
                        +{r.predictedArqGain} ARQ
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.68rem] font-medium ${LABEL_STYLE[r.label]}`}
                      >
                        {REC_LABEL[r.label]}
                      </span>
                    </div>
                  </div>

                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {r.rationale}
                  </p>

                  <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-3">
                    <Meter
                      label="Impact"
                      value={r.predictedArqGain}
                      max={maxGain}
                      tone="good"
                      valueLabel={`+${r.predictedArqGain} ARQ`}
                      delay={i * 50}
                    />
                    <Meter
                      label="Confidence"
                      value={Math.round(r.confidence * 100)}
                      max={100}
                      tone="cool"
                      valueLabel={`${Math.round(r.confidence * 100)}%`}
                      delay={i * 50 + 40}
                    />
                    <Meter
                      label="Effort"
                      value={maxEffort - r.effort + 1}
                      max={maxEffort}
                      tone="warn"
                      valueLabel={`${r.effort}/5`}
                      delay={i * 50 + 80}
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
