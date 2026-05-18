import { describe, it, expect } from "vitest";
import type { RepresentationAssessment } from "@/domain/model";
import {
  CANONICAL_QUESTIONS,
  HONESTY_PREFIX,
  mockLlm,
  represent,
} from "@/domain/represent";
import { demoStore, demoBrief } from "@/domain/store";

const RISK = ["none", "low", "medium", "high"];

function assertConforms(a: RepresentationAssessment) {
  expect(["store", "product"]).toContain(a.scope);
  expect(typeof a.entityId).toBe("string");
  expect(a.entityId.length).toBeGreaterThan(0);
  expect(typeof a.summary).toBe("string");
  expect(a.summary.length).toBeGreaterThan(0);
  expect(Array.isArray(a.questions)).toBe(true);
  expect(a.questions.length).toBe(CANONICAL_QUESTIONS.length);
  for (const q of a.questions) {
    expect(typeof q.questionId).toBe("string");
    expect(q.questionId.length).toBeGreaterThan(0);
    expect(typeof q.answer).toBe("string");
    expect(q.answer.length).toBeGreaterThan(0);
    expect(typeof q.confidence).toBe("number");
    expect(q.confidence).toBeGreaterThanOrEqual(0);
    expect(q.confidence).toBeLessThanOrEqual(1);
    expect(Array.isArray(q.citedFields)).toBe(true);
    expect(Array.isArray(q.missingToAnswer)).toBe(true);
    expect(RISK).toContain(q.misrepresentationRisk);
    expect(Array.isArray(q.ambiguityFlags)).toBe(true);
  }
}

describe("represent() — M4.1 deterministic mock evaluator", () => {
  it("mock is the offline default (id 'mock', no key/network)", () => {
    expect(mockLlm.id).toBe("mock");
  });

  it("store-scope output conforms to DATA_MODEL §4", async () => {
    const [a] = await represent(demoStore, demoBrief);
    expect(a.scope).toBe("store");
    expect(a.entityId).toBe(demoStore.profile.id);
    assertConforms(a);
  });

  it("product-scope output conforms; unknown entityId throws", async () => {
    const [a] = await represent(demoStore, demoBrief, {
      scope: "product",
      entityId: "aquatrail-pro",
    });
    expect(a.scope).toBe("product");
    expect(a.entityId).toBe("aquatrail-pro");
    assertConforms(a);
    await expect(
      represent(demoStore, demoBrief, { scope: "product", entityId: "nope" }),
    ).rejects.toThrow();
  });

  it("is deterministic — byte-identical across runs (store & product)", async () => {
    const s1 = JSON.stringify(await represent(demoStore, demoBrief));
    const s2 = JSON.stringify(await represent(demoStore, demoBrief));
    expect(s1).toBe(s2);
    const p1 = JSON.stringify(
      await represent(demoStore, demoBrief, { scope: "product", entityId: "aquatrail-pro" }),
    );
    const p2 = JSON.stringify(
      await represent(demoStore, demoBrief, { scope: "product", entityId: "aquatrail-pro" }),
    );
    expect(p1).toBe(p2);
  });

  it("covers exactly the canonical shopper question set, in order", async () => {
    const [a] = await represent(demoStore, demoBrief);
    expect(a.questions.map((q) => q.questionId)).toEqual(
      CANONICAL_QUESTIONS.map((q) => q.id),
    );
  });

  it("honors the honesty rule — likely-representation framing, no real-engine claims", async () => {
    const [store] = await represent(demoStore, demoBrief);
    const [prod] = await represent(demoStore, demoBrief, {
      scope: "product",
      entityId: "aquatrail-pro",
    });
    for (const a of [store, prod]) {
      expect(a.summary.startsWith(HONESTY_PREFIX)).toBe(true);
      expect(a.summary.toLowerCase()).toContain("likely representation");
      const forbidden =
        /(measured|actual (chatgpt|claude|gemini|perplexity)|real engine behaviour was|we queried)/i;
      expect(forbidden.test(a.summary)).toBe(false);
      for (const q of a.questions) expect(forbidden.test(q.answer)).toBe(false);
    }
  });

  it("does not emit any ARQ/score number (LLM is advisory only)", async () => {
    const [a] = (await represent(demoStore, demoBrief)) as unknown as Record<
      string,
      unknown
    >[];
    expect(a.arq).toBeUndefined();
    expect(a.score).toBeUndefined();
    expect(a.band).toBeUndefined();
  });
});
