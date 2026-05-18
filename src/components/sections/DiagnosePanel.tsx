import type { DemoResult, Finding } from "@/components/types";
import { Panel } from "@/components/primitives/Panel";
import { ScoreGauge } from "@/components/primitives/ScoreGauge";
import { SeverityPill } from "@/components/primitives/SeverityPill";
import { Meter } from "@/components/primitives/Meter";

const SEV_ORDER = ["critical", "high", "medium", "low"] as const;

function pillarTone(ratio: number): "risk" | "warn" | "good" {
  if (ratio < 0.45) return "risk";
  if (ratio < 0.7) return "warn";
  return "good";
}

export function DiagnosePanel({
  data,
  index = 2,
}: {
  data: DemoResult;
  index?: number;
}) {
  const { score, findings } = data;

  const groups = SEV_ORDER.map((sev) => ({
    sev,
    items: findings.filter((f) => f.severity === sev),
  })).filter((g) => g.items.length > 0);

  return (
    <Panel
      id="diagnose"
      step={3}
      index={index}
      kicker="Diagnose — the score & why"
      title="AI Representation Quality"
      subtitle="This isn't SEO. Every finding is a concrete reason an AI agent gets the store wrong."
    >
      <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center lg:border-r lg:border-line lg:pr-8">
          <ScoreGauge score={score.arq} band={score.band} />
        </div>

        <div className="space-y-4">
          <p className="font-mono text-[0.66rem] uppercase tracking-kicker text-ink-faint">
            Six point-budgeted pillars
          </p>
          {score.pillars.map((p, i) => (
            <Meter
              key={p.pillar}
              label={p.label}
              value={p.score}
              max={p.maxPoints}
              tone={pillarTone(p.score / p.maxPoints)}
              delay={i * 70}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-3">
          <p className="font-mono text-[0.66rem] uppercase tracking-kicker text-ink-faint">
            Diagnosis findings
          </p>
          <span className="h-px flex-1 bg-line" />
          <span className="font-mono text-[0.66rem] text-ink-faint">
            {findings.length} total
          </span>
        </div>

        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.sev}>
              <div className="mb-2 flex items-center gap-2">
                <SeverityPill severity={g.sev} />
                <span className="font-mono text-[0.66rem] uppercase tracking-wide text-ink-faint">
                  {g.items.length}{" "}
                  {g.items.length === 1 ? "finding" : "findings"}
                </span>
              </div>
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                {g.items.map((f: Finding) => (
                  <li
                    key={f.id}
                    className="flex flex-col gap-1 bg-surface px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <p className="text-sm leading-relaxed text-ink">
                      {f.message}
                    </p>
                    <p className="shrink-0 font-mono text-[0.66rem] text-ink-faint sm:max-w-[42%] sm:text-right">
                      {f.fieldPath}
                      {f.evidence ? (
                        <span className="text-ink-muted">
                          {" "}
                          · {f.evidence}
                        </span>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
