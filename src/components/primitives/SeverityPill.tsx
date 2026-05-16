import type { Severity } from "@/components/types";

const STYLES: Record<Severity, string> = {
  critical: "bg-red-500/15 text-red-400 ring-red-500/30",
  high: "bg-orange-500/15 text-orange-400 ring-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  low: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
};

export function SeverityPill({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide ring-1 ring-inset ${STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}
