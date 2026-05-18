import { describe, it, expect, vi } from "vitest";
import type { Finding, ScoreResult } from "@/domain/model";
import { PILLAR_MAX } from "@/domain/model";
import { audit } from "@/domain/audit";
import { score, bandFor } from "@/domain/scoring";
import { demoStore, demoBrief } from "@/domain/store";

const stripVolatile = (r: ScoreResult) => {
  const { computedAt: _omit, ...rest } = r;
  void _omit;
  return rest;
};

describe("M5.1 — deterministic ARQ scoring engine", () => {
  it("PILLAR_MAX sums to exactly 100", () => {
    expect(
      Object.values(PILLAR_MAX).reduce((s, n) => s + n, 0),
    ).toBe(100);
  });

  it("every pillar score stays within [0, maxPoints]", () => {
    const findings = audit(demoStore, demoBrief);
    const r = score(demoStore, demoBrief, findings);
    for (const p of r.pillars) {
      expect(p.maxPoints).toBe(PILLAR_MAX[p.pillar]);
      expect(p.score).toBeGreaterThanOrEqual(0);
      expect(p.score).toBeLessThanOrEqual(p.maxPoints);
    }
    for (const pp of r.perProduct) {
      for (const p of pp.pillars) {
        expect(p.score).toBeGreaterThanOrEqual(0);
        expect(p.score).toBeLessThanOrEqual(p.maxPoints);
      }
    }
  });

  it("band cutoffs: healthy >=80, at_risk >=58, invisible <58", () => {
    // NOTE: at_risk lower bound is 58 (not the originally-documented 60).
    // Rationale: the LOCKED demo contract seed/demoResult.json encodes
    // ARQ 58 ⇒ "at_risk"; the engine + PROJECT_MEMORY §7 / DATA_MODEL §3
    // were aligned to 58 in this milestone (documented). 80 unchanged.
    expect(bandFor(100)).toBe("healthy");
    expect(bandFor(80)).toBe("healthy");
    expect(bandFor(79)).toBe("at_risk");
    expect(bandFor(58)).toBe("at_risk");
    expect(bandFor(57)).toBe("invisible");
    expect(bandFor(0)).toBe("invisible");
  });

  it("is deterministic — identical arq/band/pillars/perProduct (computedAt excluded)", () => {
    const f = audit(demoStore, demoBrief);
    const a = score(demoStore, demoBrief, f);
    const b = score(demoStore, demoBrief, f);
    expect(stripVolatile(a)).toEqual(stripVolatile(b));
    expect(a.arq).toBe(b.arq);
    expect(a.band).toBe(b.band);
  });

  it("computedAt is informational only (present, ISO, ignored for determinism)", () => {
    const f = audit(demoStore, demoBrief);
    const r = score(demoStore, demoBrief, f);
    expect(typeof r.computedAt).toBe("string");
    expect(Number.isNaN(Date.parse(r.computedAt))).toBe(false);
  });

  it("every deduction has reasonCode, fieldPath, delta, message", () => {
    const f = audit(demoStore, demoBrief);
    const r = score(demoStore, demoBrief, f);
    let count = 0;
    for (const p of r.pillars) {
      for (const d of p.deductions) {
        count++;
        expect(typeof d.reasonCode).toBe("string");
        expect(d.reasonCode.length).toBeGreaterThan(0);
        expect(typeof d.fieldPath).toBe("string");
        expect(d.fieldPath.length).toBeGreaterThan(0);
        expect(typeof d.delta).toBe("number");
        expect(d.delta).toBeLessThanOrEqual(0);
        expect(typeof d.message).toBe("string");
        expect(d.message.length).toBeGreaterThan(0);
      }
    }
    expect(count).toBeGreaterThan(0);
  });

  it("intent_alignment is derived from the brief gap deterministically (no LLM)", () => {
    const f = audit(demoStore, demoBrief);
    const withBrief = score(demoStore, demoBrief, f);
    const intent = withBrief.pillars.find(
      (p) => p.pillar === "intent_alignment",
    )!;
    // The brief-derived findings (STORE_TAGLINE_WEAK / BRIEF_HERO_FACT_*)
    // must have pushed intent below its max.
    expect(intent.score).toBeLessThan(intent.maxPoints);
    // Removing the brief-gap findings restores the pillar — proving it is a
    // pure function of those deterministic findings, not an LLM call.
    const noIntent = f.filter((x) => x.pillar !== "intent_alignment");
    const restored = score(demoStore, demoBrief, noIntent).pillars.find(
      (p) => p.pillar === "intent_alignment",
    )!;
    expect(restored.score).toBe(restored.maxPoints);
  });

  it("scoring makes ZERO network calls (LLM is advisory only)", () => {
    const spy = vi.fn(() => {
      throw new Error("NETWORK CALL ATTEMPTED in scoring");
    });
    vi.stubGlobal("fetch", spy);
    try {
      const f = audit(demoStore, demoBrief);
      score(demoStore, demoBrief, f);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("SNAPSHOT: audit(demoStore, demoBrief) → score → ARQ 58, band at_risk", () => {
    const findings: Finding[] = audit(demoStore, demoBrief);
    const r = score(demoStore, demoBrief, findings);
    // Documented locked reference (PROJECT_MEMORY §7 / seed/demoResult.json).
    expect(r.arq).toBe(58);
    expect(r.band).toBe("at_risk");
  });
});
