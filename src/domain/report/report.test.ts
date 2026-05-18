import { describe, it, expect, vi } from "vitest";
import type { ReportPayload } from "@/domain/model";
import { demoStore, demoBrief } from "@/domain/store";
import {
  buildReport,
  reportToJson,
  reportToMarkdown,
  computeAcpPreview,
  HONESTY_NOTE,
} from "@/domain/report";

const CANONICAL_IDS = [
  "fit",
  "materials",
  "use_case",
  "comparison",
  "shipping",
  "returns",
  "sustainability",
  "trust",
];

// Strip the only informational/volatile fields (generatedAt + nested
// ScoreResult.computedAt) so the payload can be compared byte-stably.
function stripVolatile(r: ReportPayload) {
  const c = JSON.parse(JSON.stringify(r)) as ReportPayload & {
    generatedAt?: string;
  };
  delete (c as { generatedAt?: string }).generatedAt;
  delete (c.score as { computedAt?: string }).computedAt;
  if (c.simulation) {
    delete (c.simulation.before as { computedAt?: string }).computedAt;
    delete (c.simulation.after as { computedAt?: string }).computedAt;
  }
  return c;
}

describe("buildReport() — M7.1 report assembler + export", () => {
  it("ACP coverage is deterministically 92% for the seed", () => {
    const acp = computeAcpPreview(demoStore);
    expect(acp.coveragePct).toBe(92);
    // pure: identical store ⇒ identical preview
    expect(computeAcpPreview(demoStore)).toEqual(acp);
  });

  it("is deterministic across runs (generatedAt/computedAt excluded)", async () => {
    const a = await buildReport(demoStore, demoBrief);
    const b = await buildReport(demoStore, demoBrief);
    expect(JSON.stringify(stripVolatile(a))).toBe(
      JSON.stringify(stripVolatile(b)),
    );
  });

  it("assembles a canonical ReportPayload from the real pipeline", async () => {
    const r = await buildReport(demoStore, demoBrief);
    expect(r.store).toEqual({
      id: "trailhead-supply-co",
      name: "Trailhead Supply Co.",
      source: "mock",
    });
    expect(r.brief).toEqual(demoBrief);
    expect(r.score.arq).toBe(58);
    expect(r.score.band).toBe("at_risk");
    expect(r.representation.length).toBeGreaterThan(0);
    expect(r.topFindings.length).toBeGreaterThan(0);
    expect(r.topFindings.length).toBeLessThanOrEqual(8);
    expect(r.plan.length).toBeGreaterThan(0);
    expect(r.simulation).toBeTruthy();
    expect(r.simulation!.before.arq).toBe(58);
    expect(r.simulation!.after.arq).toBe(76);
    expect(r.simulation!.delta).toBe(18);
    expect(r.simulation!.after.band).toBe("at_risk");
    expect(r.acpPreview.coveragePct).toBe(92);
    expect(typeof r.generatedAt).toBe("string");
  });

  it("QuestionCoverage covers the canonical shopper question set", async () => {
    const r = await buildReport(demoStore, demoBrief);
    expect(r.questionCoverage.map((q) => q.questionId)).toEqual(
      CANONICAL_IDS,
    );
    for (const q of r.questionCoverage) {
      expect(["answered", "partially_answered", "unanswered"]).toContain(
        q.status,
      );
      expect(typeof q.bestAnswer).toBe("string");
      expect(Array.isArray(q.matchedSources)).toBe(true);
      expect(Array.isArray(q.missingInformation)).toBe(true);
    }
  });

  it("JSON export round-trips to the exact ReportPayload", async () => {
    const r = await buildReport(demoStore, demoBrief);
    expect(JSON.parse(reportToJson(r))).toEqual(JSON.parse(JSON.stringify(r)));
  });

  it("Markdown export contains the locked demo facts + honesty note", async () => {
    const r = await buildReport(demoStore, demoBrief);
    const md = reportToMarkdown(r);
    expect(md).toContain("Trailhead Supply Co.");
    expect(md).toContain("AquaTrail Pro");
    expect(md).toContain("ARQ 58");
    expect(md).toContain("After 76");
    expect(md).toContain("Delta +18");
    expect(md).toContain("ACP 92%");
    expect(md).toContain(HONESTY_NOTE);
    expect(md).toContain("Honesty note:");
  });

  it("the numeric path makes ZERO network/LLM calls", async () => {
    const spy = vi.fn(() => {
      throw new Error("NETWORK CALL ATTEMPTED in report numeric path");
    });
    vi.stubGlobal("fetch", spy);
    try {
      const r = await buildReport(demoStore, demoBrief);
      expect(spy).not.toHaveBeenCalled();
      expect(r.score.arq).toBe(58);
      expect(r.acpPreview.coveragePct).toBe(92);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
