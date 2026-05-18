// Dashboard loading skeleton. The report renders synchronously from the
// seeded literal so this rarely shows in practice, but it keeps the demo
// graceful on a cold/slow first paint. Server component, on-brand, no JS.
export default function DashboardLoading() {
  return (
    <div
      className="mx-auto max-w-5xl px-5 pb-24 pt-8 sm:px-6"
      aria-busy="true"
      aria-label="Loading the representation report"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded bg-surface-raised" />
          <div className="h-7 w-64 rounded bg-surface-raised" />
          <div className="h-3 w-80 rounded bg-surface" />
        </div>
        <div className="h-12 w-40 rounded-full bg-surface-raised" />
      </div>

      <div className="mt-7 h-10 w-full rounded-full bg-surface-raised" />

      <div className="mt-7 space-y-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-card border border-line bg-surface shadow-panel"
          >
            <div className="border-b border-line px-6 py-5 sm:px-8">
              <div className="h-3 w-40 rounded bg-surface-raised" />
              <div className="mt-3 h-6 w-72 rounded bg-surface-raised" />
            </div>
            <div className="space-y-3 px-6 py-7 sm:px-8">
              <div className="h-3 w-full rounded bg-surface" />
              <div className="h-3 w-5/6 rounded bg-surface" />
              <div className="h-3 w-2/3 rounded bg-surface" />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center font-mono text-[0.66rem] uppercase tracking-kicker text-ink-faint">
        Loading deterministic seeded report…
      </p>
    </div>
  );
}
