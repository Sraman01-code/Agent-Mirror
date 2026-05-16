import Link from "next/link";
import type { Metadata } from "next";
import demoRaw from "../../../seed/demoResult.json";
import type { DemoResult } from "@/components/types";
import { ConnectBriefPanel } from "@/components/sections/ConnectBriefPanel";
import { MirrorPanel } from "@/components/sections/MirrorPanel";
import { DiagnosePanel } from "@/components/sections/DiagnosePanel";
import { PlanPanel } from "@/components/sections/PlanPanel";
import { SimulatePanel } from "@/components/sections/SimulatePanel";
import { ReportPanel } from "@/components/sections/ReportPanel";

// M1.2: 100% static. All numbers come from seed/demoResult.json.
// No computation, no scoring, no LLM, no Shopify, no DB.
const demo = demoRaw as unknown as DemoResult;

export const metadata: Metadata = {
  title: "Agent Mirror — Trailhead Supply Co.",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Agent Mirror · AI Representation Optimizer
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            {demo.store.name} — representation report
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-400 transition hover:text-neutral-100"
        >
          ← Home
        </Link>
      </div>

      <div className="space-y-6">
        <ConnectBriefPanel data={demo} />
        <MirrorPanel data={demo} />
        <DiagnosePanel data={demo} />
        <PlanPanel data={demo} />
        <SimulatePanel data={demo} />
        <ReportPanel data={demo} />
      </div>

      <p className="mt-10 text-center text-xs text-neutral-600">
        Static demo spine (Phase 1 · M1.2). Engine, scoring, and live ingestion
        arrive in later milestones.
      </p>
    </main>
  );
}
