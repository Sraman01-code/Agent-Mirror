// Before → After ARQ climb. Two columns (amber "at risk" → lime "target")
// with the delta called out between them. Pure CSS, no chart library.
export function DeltaBar({
  before,
  after,
  max = 100,
}: {
  before: number;
  after: number;
  max?: number;
}) {
  const beforePct = Math.max(6, Math.min(100, (before / max) * 100));
  const afterPct = Math.max(6, Math.min(100, (after / max) * 100));
  const delta = after - before;

  return (
    <div>
      <div className="flex items-end justify-center gap-6">
        <Column
          label="Before"
          value={before}
          pct={beforePct}
          barClass="bg-gradient-to-t from-signal-warn/40 to-signal-warn"
          valueClass="text-signal-warn"
        />

        <div className="flex flex-col items-center pb-7">
          <span className="font-mono text-[0.62rem] uppercase tracking-kicker text-ink-faint">
            delta
          </span>
          <span className="mt-1 font-display text-3xl leading-none text-signal-good">
            +{delta}
          </span>
          <svg
            width="46"
            height="14"
            viewBox="0 0 46 14"
            className="mt-2 text-signal-good/70"
            aria-hidden
          >
            <path
              d="M0 7 H38 M32 2 L40 7 L32 12"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>

        <Column
          label="After"
          value={after}
          pct={afterPct}
          barClass="bg-gradient-to-t from-signal-good/40 to-signal-good"
          valueClass="text-signal-good"
        />
      </div>
      <p className="mt-5 text-center text-sm text-ink-muted">
        Same store, fixed data —{" "}
        <span className="font-medium text-signal-good">
          +{delta} ARQ
        </span>{" "}
        from the curated top fixes.
      </p>
    </div>
  );
}

function Column({
  label,
  value,
  pct,
  barClass,
  valueClass,
}: {
  label: string;
  value: number;
  pct: number;
  barClass: string;
  valueClass: string;
}) {
  return (
    <div className="flex w-20 flex-col items-center">
      <span className={`font-display text-2xl tabular ${valueClass}`}>
        {value}
      </span>
      <div className="mt-2 flex h-44 w-12 items-end overflow-hidden rounded-lg bg-surface-sunk ring-1 ring-inset ring-line">
        <div
          className={`w-full rounded-md ${barClass}`}
          style={{ height: `${pct}%` }}
        />
      </div>
      <span className="mt-2 font-mono text-[0.62rem] uppercase tracking-kicker text-ink-faint">
        {label}
      </span>
    </div>
  );
}
