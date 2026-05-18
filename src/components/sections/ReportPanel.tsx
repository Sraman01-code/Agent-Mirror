import type { DemoResult, QuestionCoverageItem } from "@/components/types";
import { COVERAGE_LABEL } from "@/components/types";
import { Panel } from "@/components/primitives/Panel";

const COVERAGE_STYLE: Record<QuestionCoverageItem["status"], string> = {
  answered: "bg-signal-good/15 text-signal-good",
  partially_answered: "bg-signal-warn/15 text-signal-warn",
  unanswered: "bg-signal-risk/15 text-signal-risk",
};

// M9.1 polish; M7.1 contract preserved (optional live overrides default to
// the static seed). Adds a real export CTA — the /api/report routes exist.
export function ReportPanel({
  data,
  acpPreview: acpOverride,
  questionCoverage: qcOverride,
  honestyNote: noteOverride,
  index = 5,
}: {
  data: DemoResult;
  acpPreview?: DemoResult["acpPreview"];
  questionCoverage?: DemoResult["questionCoverage"];
  honestyNote?: string;
  index?: number;
}) {
  const acpPreview = acpOverride ?? data.acpPreview;
  const questionCoverage = qcOverride ?? data.questionCoverage;
  const honestyNote = noteOverride ?? data.honestyNote;

  const counts = questionCoverage.reduce<Record<string, number>>((acc, q) => {
    acc[q.status] = (acc[q.status] ?? 0) + 1;
    return acc;
  }, {});

  const r = 34;
  const c = 2 * Math.PI * r;
  const off = c * (1 - acpPreview.coveragePct / 100);

  return (
    <Panel
      id="report"
      step={6}
      index={index}
      kicker="Report — share & export"
      title="Buyer-question coverage & export readiness"
      subtitle="Hand this to the team or agency — exportable, and honest about what it measures."
      meta={
        <div className="flex gap-2">
          <a
            href="/api/report?format=md"
            className="rounded-full bg-signal-warn px-4 py-2 text-xs font-semibold text-[#1a1206] transition hover:brightness-110"
          >
            Export Markdown
          </a>
          <a
            href="/api/report?format=json"
            className="rounded-full border border-line bg-surface-raised px-4 py-2 text-xs font-medium text-ink-muted transition hover:text-ink"
          >
            JSON
          </a>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-sunk p-6">
          <div className="flex items-center gap-5">
            <div className="relative h-[88px] w-[88px] shrink-0">
              <svg
                width="88"
                height="88"
                viewBox="0 0 88 88"
                className="-rotate-90"
                role="img"
                aria-label={`ACP feed coverage ${acpPreview.coveragePct} percent`}
              >
                <circle
                  cx="44"
                  cy="44"
                  r={r}
                  stroke="var(--surface-sunk)"
                  strokeWidth="9"
                  fill="none"
                />
                <circle
                  cx="44"
                  cy="44"
                  r={r}
                  stroke="rgb(var(--signal-good))"
                  strokeWidth="9"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={c}
                  strokeDashoffset={off}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-display text-xl tabular text-ink">
                {acpPreview.coveragePct}%
              </div>
            </div>
            <div>
              <p className="font-mono text-[0.66rem] uppercase tracking-kicker text-ink-faint">
                ACP / export field coverage
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {acpPreview.submissionNote}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-wide text-ink-faint">
                Warnings
              </p>
              <ul className="mt-1.5 space-y-1 text-ink-muted">
                {acpPreview.warnings.map((w) => (
                  <li key={w} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal-warn" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-wide text-ink-faint">
                Missing fields
              </p>
              <ul className="mt-1.5 space-y-1 font-mono text-xs text-ink-muted">
                {acpPreview.missingFields.map((m) => (
                  <li key={m.productId}>
                    <span className="text-ink">{m.productId}</span> ·{" "}
                    {m.fields.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-sunk p-6">
          <p className="font-mono text-[0.66rem] uppercase tracking-kicker text-ink-faint">
            Buyer question coverage
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              ["answered", "partially_answered", "unanswered"] as const
            ).map((s) => (
              <span
                key={s}
                className={`rounded-full px-3 py-1 text-xs font-medium ${COVERAGE_STYLE[s]}`}
              >
                {COVERAGE_LABEL[s]} · {counts[s] ?? 0}
              </span>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-line">
            {questionCoverage.map((q) => (
              <li key={q.questionId} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm text-ink">{q.questionText}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[0.66rem] font-medium ${COVERAGE_STYLE[q.status]}`}
                  >
                    {COVERAGE_LABEL[q.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-faint">
                  {q.bestAnswer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-5 flex gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted">
        <span aria-hidden className="select-none text-signal-cool">
          ⓘ
        </span>
        {honestyNote}
      </p>
    </Panel>
  );
}
