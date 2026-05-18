import type { ReactNode } from "react";

// Editorial section shell shared by every dashboard step. A faint serif step
// numeral watermark + monospace kicker + serif title gives the report a
// consistent, premium "instrument page" rhythm. Server component; the only
// motion is one staggered page-load reveal (reduced-motion safe via globals).

export function Panel({
  id,
  step,
  kicker,
  title,
  subtitle,
  meta,
  index = 0,
  children,
}: {
  id: string;
  step: number;
  kicker: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  index?: number;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="animate-rise relative scroll-mt-24 overflow-hidden rounded-card border border-line bg-surface shadow-panel"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* oversized step numeral, bled into the corner as a watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-3 -top-10 select-none font-display text-[8.5rem] leading-none text-white/[0.03]"
      >
        {step}
      </span>

      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line px-6 py-5 sm:px-8">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-kicker text-signal-warn">
            <span className="tabular">
              {String(step).padStart(2, "0")}
            </span>
            <span className="h-px w-6 bg-signal-warn/50" />
            {kicker}
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight text-ink sm:text-[1.7rem]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">
              {subtitle}
            </p>
          )}
        </div>
        {meta && <div className="shrink-0">{meta}</div>}
      </header>

      <div className="px-6 py-6 sm:px-8 sm:py-7">{children}</div>
    </section>
  );
}
