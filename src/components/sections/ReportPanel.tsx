import type { DemoResult, QuestionCoverageItem } from "@/components/types";
import { COVERAGE_LABEL } from "@/components/types";

const COVERAGE_STYLE: Record<QuestionCoverageItem["status"], string> = {
  answered: "bg-emerald-500/15 text-emerald-400",
  partially_answered: "bg-amber-500/15 text-amber-400",
  unanswered: "bg-red-500/15 text-red-400",
};

export function ReportPanel({ data }: { data: DemoResult }) {
  const { acpPreview, questionCoverage, honestyNote } = data;
  const counts = questionCoverage.reduce<Record<string, number>>((acc, q) => {
    acc[q.status] = (acc[q.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Step 6 · Report — share &amp; export
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          Buyer-question coverage &amp; export readiness
        </h2>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              ACP / export field coverage
            </p>
            <span className="text-3xl font-semibold tabular-nums text-emerald-400">
              {acpPreview.coveragePct}%
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${acpPreview.coveragePct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            {acpPreview.submissionNote}
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-neutral-400">Warnings</p>
            <ul className="list-disc space-y-1 pl-5 text-neutral-300">
              {acpPreview.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <p className="pt-2 text-neutral-400">Missing fields</p>
            <ul className="space-y-1 text-neutral-300">
              {acpPreview.missingFields.map((m) => (
                <li key={m.productId} className="font-mono text-xs">
                  {m.productId}: {m.fields.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Buyer question coverage
          </p>
          <div className="mt-3 flex gap-2">
            {(
              ["answered", "partially_answered", "unanswered"] as const
            ).map((s) => (
              <span
                key={s}
                className={`rounded-full px-3 py-1 text-xs font-medium ${COVERAGE_STYLE[s]}`}
              >
                {COVERAGE_LABEL[s]}: {counts[s] ?? 0}
              </span>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-neutral-800">
            {questionCoverage.map((q) => (
              <li key={q.questionId} className="py-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-neutral-200">{q.questionText}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${COVERAGE_STYLE[q.status]}`}
                  >
                    {COVERAGE_LABEL[q.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">{q.bestAnswer}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-5 rounded-lg border border-neutral-800 bg-neutral-950/40 p-3 text-xs text-neutral-500">
        {honestyNote}
      </p>
    </section>
  );
}
