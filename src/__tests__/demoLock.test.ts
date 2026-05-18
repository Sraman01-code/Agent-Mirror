import { describe, it, expect } from "vitest";
import demoRaw from "../../seed/demoResult.json";
import { audit } from "@/domain/audit";
import { score } from "@/domain/scoring";
import { buildReport } from "@/domain/report";
import { demoStore, demoBrief } from "@/domain/store";

// M9.1 demo-lock guard. The judge demo is only rehearsable if the locked
// numbers can never silently drift — neither in the static seed the
// dashboard renders, nor in the live engine the API serves. This test fails
// loudly if either changes (see docs/DEMO_SCRIPT.md "Locked Demo Numbers").

const demo = demoRaw as {
  store: { name: string };
  score: { arq: number; band: string };
  simulation: { delta: number; before: { arq: number }; after: { arq: number } };
  acpPreview: { coveragePct: number };
};

describe("Locked demo numbers — DEMO_SCRIPT contract", () => {
  it("static seed/demoResult.json keeps the locked figures", () => {
    expect(demo.store.name).toBe("Trailhead Supply Co.");
    expect(demo.score.arq).toBe(58);
    expect(demo.score.band).toBe("at_risk");
    expect(demo.simulation.before.arq).toBe(58);
    expect(demo.simulation.after.arq).toBe(76);
    expect(demo.simulation.delta).toBe(18);
    expect(demo.acpPreview.coveragePct).toBe(92);
  });

  it("the live deterministic engine reproduces the same locked figures", async () => {
    const findings = audit(demoStore, demoBrief);
    const s = score(demoStore, demoBrief, findings);
    expect(s.arq).toBe(58);
    expect(s.band).toBe("at_risk");

    const report = await buildReport(demoStore, demoBrief);
    expect(report.score.arq).toBe(58);
    expect(report.score.band).toBe("at_risk");
    expect(report.simulation?.before.arq).toBe(58);
    expect(report.simulation?.after.arq).toBe(76);
    expect(report.simulation?.delta).toBe(18);
    expect(report.acpPreview.coveragePct).toBe(92);
  });
});
