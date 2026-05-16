// Horizontal before/after bar. Pure CSS — no chart library.
export function DeltaBar({
  before,
  after,
  max = 100,
}: {
  before: number;
  after: number;
  max?: number;
}) {
  const beforePct = Math.max(0, Math.min(100, (before / max) * 100));
  const afterPct = Math.max(0, Math.min(100, (after / max) * 100));
  const delta = after - before;

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex justify-between text-xs text-neutral-400">
          <span>Before</span>
          <span className="tabular-nums">{before}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-amber-400/70"
            style={{ width: `${beforePct}%` }}
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs text-neutral-400">
          <span>After</span>
          <span className="tabular-nums">{after}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${afterPct}%` }}
          />
        </div>
      </div>
      <p className="text-sm font-medium text-emerald-400">
        +{delta} ARQ improvement
      </p>
    </div>
  );
}
