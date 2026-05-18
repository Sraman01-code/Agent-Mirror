import { describe, it, expect, vi } from "vitest";
import type { Recommendation } from "@/domain/model";
import { audit } from "@/domain/audit";
import { score } from "@/domain/scoring";
import { demoStore, demoBrief } from "@/domain/store";
import {
  recommend,
  applyFixPatch,
  RECOMMENDATION_TEMPLATES,
} from "@/domain/recommend";

const baseFindings = () => audit(demoStore, demoBrief);
const baseArq = () => score(demoStore, demoBrief, baseFindings()).arq;

const LABELS = new Set([
  "quick_win",
  "blocks_trust",
  "blocks_recommendation",
  "needs_theme_change",
  "can_apply_now",
]);

describe("recommend() — M5.2 deterministic recommendation engine", () => {
  it("is deterministic — byte-identical across repeated runs", () => {
    const a = JSON.stringify(recommend(demoStore, demoBrief, baseFindings()));
    const b = JSON.stringify(recommend(demoStore, demoBrief, baseFindings()));
    expect(a).toBe(b);
  });

  it("is sorted by priorityScore descending (with deterministic tiebreaks)", () => {
    const recs = recommend(demoStore, demoBrief, baseFindings());
    expect(recs.length).toBeGreaterThan(0);
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i - 1].priorityScore).toBeGreaterThanOrEqual(
        recs[i].priorityScore,
      );
    }
  });

  it("every Recommendation has all required DATA_MODEL §5 fields", () => {
    const recs = recommend(demoStore, demoBrief, baseFindings());
    for (const r of recs) {
      expect(typeof r.id).toBe("string");
      expect(r.id.length).toBeGreaterThan(0);
      expect(typeof r.templateId).toBe("string");
      expect(typeof r.title).toBe("string");
      expect(typeof r.rationale).toBe("string");
      expect(Array.isArray(r.affectedEntities)).toBe(true);
      expect(r.affectedEntities.length).toBeGreaterThan(0);
      for (const e of r.affectedEntities) {
        expect(["store", "product"]).toContain(e.scope);
        expect(typeof e.id).toBe("string");
      }
      expect(Array.isArray(r.resolvesFindingIds)).toBe(true);
      expect(r.resolvesFindingIds.length).toBeGreaterThan(0);
      expect(typeof r.predictedArqGain).toBe("number");
      expect(r.conversionImportance).toBeGreaterThanOrEqual(0);
      expect(r.conversionImportance).toBeLessThanOrEqual(1);
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
      expect(r.effort).toBeGreaterThan(0);
      expect(typeof r.priorityScore).toBe("number");
      expect(LABELS.has(r.label)).toBe(true);
      expect(r.fixPatch).toBeTruthy();
      expect(Array.isArray(r.fixPatch.ops)).toBe(true);
    }
  });

  it("every Recommendation has a valid FixPatch (DATA_MODEL §6 ops only)", () => {
    const recs = recommend(demoStore, demoBrief, baseFindings());
    for (const r of recs) {
      expect(r.fixPatch.ops.length).toBeGreaterThan(0);
      for (const op of r.fixPatch.ops) {
        if (op.op === "set" || op.op === "add") {
          expect(typeof op.path).toBe("string");
          expect(op.path.length).toBeGreaterThan(0);
          expect("value" in op).toBe(true);
        } else {
          expect(op.op).toBe("fillAttribute");
          expect(typeof op.productId).toBe("string");
          expect(op.productId.length).toBeGreaterThan(0);
          expect(typeof op.key).toBe("string");
          expect(op.key.length).toBeGreaterThan(0);
          expect(typeof op.value).toBe("string");
        }
      }
    }
  });

  it("every Recommendation carries non-empty merchant-facing fix copy", () => {
    const recs = recommend(demoStore, demoBrief, baseFindings());
    for (const r of recs) {
      expect(r.title.trim().length).toBeGreaterThan(0);
      expect(r.rationale.trim().length).toBeGreaterThan(0);
    }
  });

  it("predictedArqGain equals an independent re-score of the patched clone", () => {
    const base = baseArq();
    const recs = recommend(demoStore, demoBrief, baseFindings());
    for (const r of recs) {
      const patched = applyFixPatch(demoStore, r.fixPatch);
      const independent =
        score(patched, demoBrief, audit(patched, demoBrief)).arq - base;
      expect(r.predictedArqGain).toBe(independent);
    }
  });

  it("never mutates the source store", () => {
    const before = JSON.stringify(demoStore);
    const beforeFindings = JSON.stringify(baseFindings());
    const recs = recommend(demoStore, demoBrief, baseFindings());
    // Apply every patch too — applier must also deep-clone.
    for (const r of recs) applyFixPatch(demoStore, r.fixPatch);
    expect(JSON.stringify(demoStore)).toBe(before);
    expect(JSON.stringify(audit(demoStore, demoBrief))).toBe(beforeFindings);
  });

  it("applying ALL recommendations' patches then re-scoring strictly increases ARQ", () => {
    const base = baseArq();
    const recs = recommend(demoStore, demoBrief, baseFindings());
    let cur = demoStore;
    for (const r of recs) cur = applyFixPatch(cur, r.fixPatch);
    const after = score(cur, demoBrief, audit(cur, demoBrief)).arq;
    expect(after).toBeGreaterThan(base);
  });

  it("return policy and shipping clarity rank near the top", () => {
    const recs = recommend(demoStore, demoBrief, baseFindings());
    const topIds = recs.slice(0, 3).map((r) => r.templateId);
    expect(topIds).toContain("clarify-return-policy");
    expect(topIds).toContain("add-shipping-details");
    // and they are the two single highest-priority actions.
    expect(recs[0].templateId).toBe("clarify-return-policy");
    expect(recs[1].templateId).toBe("add-shipping-details");
  });

  it("templates are keyed to reasonCodes the seeded audit actually emits", () => {
    const emitted = new Set(baseFindings().map((f) => f.reasonCode));
    const covered = new Set(
      RECOMMENDATION_TEMPLATES.flatMap((t) => t.resolvesReasonCodes),
    );
    for (const code of emitted) {
      expect(covered.has(code), `no template resolves ${code}`).toBe(true);
    }
  });

  it("makes ZERO network/LLM calls (LLM only enriches copy, never ranking)", () => {
    const spy = vi.fn(() => {
      throw new Error("NETWORK CALL ATTEMPTED in recommend");
    });
    vi.stubGlobal("fetch", spy);
    try {
      const recs = recommend(demoStore, demoBrief, baseFindings());
      for (const r of recs) applyFixPatch(demoStore, r.fixPatch);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("empty findings ⇒ no recommendations (nothing to resolve)", () => {
    const recs: Recommendation[] = recommend(demoStore, demoBrief, []);
    expect(recs).toEqual([]);
  });
});
