import type { Severity } from "@/components/types";

const STYLES: Record<Severity, string> = {
  critical: "bg-signal-risk/15 text-signal-risk ring-signal-risk/30",
  high: "bg-signal-high/15 text-signal-high ring-signal-high/30",
  medium: "bg-signal-warn/15 text-signal-warn ring-signal-warn/30",
  low: "bg-signal-cool/15 text-signal-cool ring-signal-cool/30",
};

export function SeverityPill({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[0.62rem] font-medium uppercase tracking-wide ring-1 ring-inset ${STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}
