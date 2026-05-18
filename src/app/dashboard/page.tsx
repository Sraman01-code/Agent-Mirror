import Link from "next/link";
import type { Metadata } from "next";
import demoRaw from "../../../seed/demoResult.json";
import type { DemoResult } from "@/components/types";
import { BAND_LABEL } from "@/components/types";
import { ConnectBriefPanel } from "@/components/sections/ConnectBriefPanel";
import { MirrorPanel } from "@/components/sections/MirrorPanel";
import { DiagnosePanel } from "@/components/sections/DiagnosePanel";
import { PlanPanel } from "@/components/sections/PlanPanel";
import { SimulatePanel } from "@/components/sections/SimulatePanel";
import { ReportPanel } from "@/components/sections/ReportPanel";
import { mockStore } from "@/domain/store";

// M9.1: presentational polish only. Every visible number still comes from the
// locked seed/demoResult.json (no computation/scoring/LLM/Shopify here); the
// typed Store is read through the StoreSource port exactly as before.
const demo = demoRaw as unknown as DemoResult;

export const metadata: Metadata = {
  title: "Agent Mirror — Trailhead Supply Co. representation report",
};

const NAV = [
  { id: "connect", label: "Connect" },
  { id: "mirror", label: "Mirror" },
  { id: "diagnose", label: "Diagnose" },
  { id: "plan", label: "Plan" },
  { id: "simulate", label: "Simulate" },
  { id: "report", label: "Report" },
];

export default async function DashboardPage() {
  const store = await mockStore.getStore();
  const { arq, band } = demo.score;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-8 sm:px-6">
      <header className="animate-rise flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="font-mono text-[0.68rem] uppercase tracking-kicker text-ink-faint transition hover:text-ink-muted"
          >
            ← Agent Mirror
          </Link>
          <h1 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
            {store.profile.name}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            How an AI shopping agent likely represents this store today.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2">
          <span className="font-display text-2xl tabular text-signal-warn">
            {arq}
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-kicker text-ink-faint">
            ARQ
            <br />/ 100
          </span>
          <span className="ml-1 rounded-full bg-signal-warn/15 px-2.5 py-1 text-xs font-medium text-signal-warn">
            {BAND_LABEL[band]}
          </span>
        </div>
      </header>

      <nav
        className="animate-rise sticky top-3 z-10 mt-7 flex flex-wrap gap-1 rounded-full border border-line bg-[#0c0d11]/85 p-1.5 backdrop-blur"
        style={{ animationDelay: "60ms" }}
        aria-label="Report sections"
      >
        {NAV.map((n, i) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface-raised hover:text-ink"
          >
            <span className="font-mono text-[0.6rem] text-ink-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            {n.label}
          </a>
        ))}
      </nav>

      <div className="mt-7 space-y-6">
        <ConnectBriefPanel data={demo} index={0} />
        <MirrorPanel data={demo} index={1} />
        <DiagnosePanel data={demo} index={2} />
        <PlanPanel data={demo} index={3} />
        <SimulatePanel data={demo} index={4} />
        <ReportPanel data={demo} index={5} />
      </div>

      <p className="mt-12 text-center font-mono text-[0.66rem] leading-relaxed tracking-wide text-ink-faint">
        Likely representation based on machine-readable evidence and
        shopping-agent evaluation rules — not a measurement of any real AI
        engine. Deterministic seeded demo.
      </p>
    </div>
  );
}
