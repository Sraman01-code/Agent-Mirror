import type { DemoResult, Recommendation } from "@/components/types";
import { REC_LABEL } from "@/components/types";

const LABEL_STYLE: Record<Recommendation["label"], string> = {
  quick_win: "bg-sky-500/15 text-sky-400",
  blocks_trust: "bg-red-500/15 text-red-400",
  blocks_recommendation: "bg-orange-500/15 text-orange-400",
  needs_theme_change: "bg-purple-500/15 text-purple-400",
  can_apply_now: "bg-emerald-500/15 text-emerald-400",
};

export function PlanPanel({ data }: { data: DemoResult }) {
  const plan = [...data.plan].sort(
    (a, b) => b.priorityScore - a.priorityScore,
  );

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Step 4 · Plan — what to fix first
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          Ranked action plan
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Ordered by impact × conversion importance × confidence ÷ effort
        </p>
      </header>

      <ol className="space-y-3">
        {plan.map((r, i) => (
          <li
            key={r.id}
            className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-neutral-300">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-neutral-100">{r.title}</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {r.rationale}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-400">
                  +{r.predictedArqGain} ARQ
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${LABEL_STYLE[r.label]}`}
                >
                  {REC_LABEL[r.label]}
                </span>
                <span className="text-xs text-neutral-500">
                  effort {r.effort} · priority{" "}
                  {r.priorityScore.toFixed(2)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
