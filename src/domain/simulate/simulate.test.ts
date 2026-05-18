import { describe, it, expect, vi } from "vitest";
import type { ScoreResult, SimulationResult } from "@/domain/model";
import { audit } from "@/domain/audit";
import { score } from "@/domain/scoring";
import { demoStore, demoBrief } from "@/domain/store";
import { recommend } from "@/domain/recommend";
import { simulate } from "@/domain/simulate";

// The curated demo subset (deterministically reproduces 58 → 76, Δ+18). It is
// exactly the priority-ranked top-3 recommendations and maps 1:1 to the demo
// narrative's first three actions (return policy → shipping → specs).
const CURATED_TEMPLATE_IDS = [
  "clarify-return-policy",
  "add-shipping-details",
  "add-product-specs",
];

const findings = () => audit(demoStore, demoBrief);
const recs = () => recommend(demoStore, demoBrief, findings());
const curatedIds = () =>
  recs()
    .filter((r) => CURATED_TEMPLATE_IDS.includes(r.templateId))
    .map((r) => r.id);

// Strip the informational `computedAt` from the nested ScoreResults so
// SimulationResult can be compared for byte-stable determinism.
const stripVolatile = (s: SimulationResult) => {
  const strip = (r: ScoreResult) => {
    const { computedAt: _omit, ...rest } = r;
    void _omit;
    return rest;
  };
  return { ...s, before: strip(s.before), after: strip(s.after) };
};

describe("simulate() — M6.1 before/after simulation engine", () => {
  it("before score equals the M5.1 base score (ARQ 58, at_risk)", async () => {
    const f = findings();
    const base = score(demoStore, demoBrief, f);
    const sim = await simulate(demoStore, demoBrief, f, recs(), []);
    expect(sim.before.arq).toBe(58);
    expect(sim.before.band).toBe("at_risk");
    expect(stripVolatile({ ...sim }).before).toEqual(
      stripVolatile({ ...sim, before: base } as SimulationResult).before,
    );
  });

  it("curated subset deterministically yields exactly 58 → 76, Δ+18, at_risk", async () => {
    const f = findings();
    const sim = await simulate(
      demoStore,
      demoBrief,
      f,
      recs(),
      curatedIds(),
    );
    expect(sim.before.arq).toBe(58);
    expect(sim.after.arq).toBe(76);
    expect(sim.delta).toBe(18);
    expect(sim.before.band).toBe("at_risk");
    expect(sim.after.band).toBe("at_risk");
    expect(sim.appliedRecommendationIds).toEqual(
      [...curatedIds()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    );
    expect(sim.changedFindingIds.resolved.length).toBeGreaterThan(0);
  });

  it("never mutates the source store or the source findings", async () => {
    const f = findings();
    const storeBefore = JSON.stringify(demoStore);
    const findingsBefore = JSON.stringify(f);
    await simulate(demoStore, demoBrief, f, recs(), curatedIds());
    // run all-recs too — applier must keep deep-cloning.
    await simulate(
      demoStore,
      demoBrief,
      f,
      recs(),
      recs().map((r) => r.id),
    );
    expect(JSON.stringify(demoStore)).toBe(storeBefore);
    expect(JSON.stringify(f)).toBe(findingsBefore);
  });

  it("is idempotent — same selection ⇒ byte-identical SimulationResult", async () => {
    const f = findings();
    const a = await simulate(demoStore, demoBrief, f, recs(), curatedIds());
    const b = await simulate(demoStore, demoBrief, f, recs(), curatedIds());
    expect(JSON.stringify(stripVolatile(a))).toBe(
      JSON.stringify(stripVolatile(b)),
    );
  });

  it("toggling is reversible — selecting then deselecting returns to before", async () => {
    const f = findings();
    const r = recs();
    const empty = await simulate(demoStore, demoBrief, f, r, []);
    const curated = await simulate(demoStore, demoBrief, f, r, curatedIds());
    const backToEmpty = await simulate(demoStore, demoBrief, f, r, []);
    expect(curated.after.arq).toBe(76);
    // empty selection ⇒ after == before, delta 0; reversible.
    expect(empty.after.arq).toBe(empty.before.arq);
    expect(empty.delta).toBe(0);
    expect(JSON.stringify(stripVolatile(empty))).toBe(
      JSON.stringify(stripVolatile(backToEmpty)),
    );
  });

  it("applying ALL recommendations strictly increases ARQ", async () => {
    const f = findings();
    const r = recs();
    const sim = await simulate(
      demoStore,
      demoBrief,
      f,
      r,
      r.map((x) => x.id),
    );
    expect(sim.after.arq).toBeGreaterThan(sim.before.arq);
  });

  it("the numeric path makes ZERO network/LLM calls (audit+score+patch only)", async () => {
    const spy = vi.fn(() => {
      throw new Error("NETWORK CALL ATTEMPTED in simulate numeric path");
    });
    vi.stubGlobal("fetch", spy);
    try {
      const f = findings();
      const sim = await simulate(
        demoStore,
        demoBrief,
        f,
        recs(),
        curatedIds(),
      );
      expect(spy).not.toHaveBeenCalled();
      // numeric result is the pure deterministic scorer's output.
      expect(sim.after.arq).toBe(76);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("sampleAnswers are present, deterministic narrative (advisory, not numeric)", async () => {
    const f = findings();
    const sim = await simulate(demoStore, demoBrief, f, recs(), curatedIds());
    expect(sim.sampleAnswers.length).toBeGreaterThan(0);
    for (const s of sim.sampleAnswers) {
      expect(typeof s.questionId).toBe("string");
      expect(typeof s.before).toBe("string");
      expect(typeof s.after).toBe("string");
    }
  });
});
