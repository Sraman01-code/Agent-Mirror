import type { DemoResult } from "@/components/types";
import { Panel } from "@/components/primitives/Panel";

export function ConnectBriefPanel({
  data,
  index = 0,
}: {
  data: DemoResult;
  index?: number;
}) {
  const { store, syncStatus, brief } = data;
  const stats = [
    { label: "Products synced", value: syncStatus.productsSynced },
    { label: "Collections scanned", value: syncStatus.collectionsScanned },
    { label: "Public pages crawled", value: syncStatus.publicPagesCrawled },
    { label: "Policy / FAQ gaps", value: syncStatus.policyFaqGaps },
  ];

  return (
    <Panel
      id="connect"
      step={1}
      index={index}
      kicker="Connect & Brief"
      title={store.name}
      subtitle="The store, and — crucially — how the merchant wants to be represented."
      meta={
        <span className="rounded-full border border-line bg-surface-raised px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-wide text-ink-muted">
          {syncStatus.lastSyncedLabel}
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface px-4 py-5">
            <div className="font-display text-3xl tabular text-ink">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-ink-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-signal-warn/25 bg-signal-warn/[0.05] p-6">
        <p className="font-mono text-[0.66rem] uppercase tracking-kicker text-signal-warn">
          Representation brief — desired positioning
        </p>
        <p className="mt-3 font-display text-xl leading-relaxed text-ink sm:text-2xl">
          “{brief.positioning}”
        </p>
        {brief.targetBuyer && (
          <p className="mt-4 text-sm text-ink-muted">
            <span className="text-ink-faint">Target buyer — </span>
            {brief.targetBuyer}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {brief.mustSayFacts.map((f) => (
            <span
              key={f}
              className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-muted"
            >
              must say · {f}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}
