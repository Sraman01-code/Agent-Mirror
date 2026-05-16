import type { DemoResult } from "@/components/types";

export function ConnectBriefPanel({ data }: { data: DemoResult }) {
  const { store, syncStatus, brief } = data;
  const stats = [
    { label: "Products synced", value: syncStatus.productsSynced },
    { label: "Collections scanned", value: syncStatus.collectionsScanned },
    { label: "Public pages crawled", value: syncStatus.publicPagesCrawled },
    { label: "Policy / FAQ gaps", value: syncStatus.policyFaqGaps },
  ];

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Step 1 · Connect &amp; Brief
          </p>
          <h2 className="mt-1 text-xl font-semibold">{store.name}</h2>
        </div>
        <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
          {syncStatus.lastSyncedLabel}
        </span>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4"
          >
            <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
            <div className="mt-1 text-xs text-neutral-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Representation brief — how the merchant wants to be seen
        </p>
        <p className="mt-2 text-lg leading-relaxed text-neutral-100">
          “{brief.positioning}”
        </p>
        {brief.targetBuyer && (
          <p className="mt-3 text-sm text-neutral-400">
            <span className="text-neutral-500">Target buyer:</span>{" "}
            {brief.targetBuyer}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {brief.mustSayFacts.map((f) => (
            <span
              key={f}
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
