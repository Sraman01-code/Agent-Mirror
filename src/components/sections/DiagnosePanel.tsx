import type { DemoResult } from "@/components/types";
import { ScoreGauge } from "@/components/primitives/ScoreGauge";
import { SeverityPill } from "@/components/primitives/SeverityPill";

export function DiagnosePanel({ data }: { data: DemoResult }) {
  const { score, findings } = data;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Step 3 · Diagnose — score &amp; why
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          AI Representation Quality
        </h2>
      </header>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center">
          <ScoreGauge score={score.arq} band={score.band} />
        </div>

        <div className="space-y-3">
          {score.pillars.map((p) => {
            const pct = (p.score / p.maxPoints) * 100;
            return (
              <div key={p.pillar}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-neutral-300">{p.label}</span>
                  <span className="tabular-nums text-neutral-400">
                    {p.score}/{p.maxPoints}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-emerald-400/80"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Diagnosis findings — every red item is a reason an AI agent gets you
          wrong
        </p>
        <ul className="divide-y divide-neutral-800 rounded-xl border border-neutral-800">
          {findings.map((f) => (
            <li
              key={f.id}
              className="flex items-start gap-3 p-4 text-sm"
            >
              <SeverityPill severity={f.severity} />
              <div>
                <p className="text-neutral-200">{f.message}</p>
                <p className="mt-0.5 font-mono text-xs text-neutral-500">
                  {f.fieldPath}
                  {f.evidence ? ` · ${f.evidence}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
