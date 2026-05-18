// Thin labeled instrument bar reused by Diagnose (pillars) and Plan
// (impact/effort/confidence). Pure CSS; the fill grows from the left on load.

type Tone = "warn" | "good" | "risk" | "cool" | "neutral";

const FILL: Record<Tone, string> = {
  warn: "bg-signal-warn",
  good: "bg-signal-good",
  risk: "bg-signal-risk",
  cool: "bg-signal-cool",
  neutral: "bg-ink-faint",
};

export function Meter({
  label,
  value,
  max,
  tone = "warn",
  valueLabel,
  delay = 0,
}: {
  label: string;
  value: number;
  max: number;
  tone?: Tone;
  valueLabel?: string;
  delay?: number;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate text-ink-muted">{label}</span>
        <span className="tabular shrink-0 font-mono text-xs text-ink">
          {valueLabel ?? `${value}/${max}`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunk ring-1 ring-inset ring-line">
        <div
          className={`animate-grow h-full origin-left rounded-full ${FILL[tone]}`}
          style={{ width: `${pct}%`, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}
