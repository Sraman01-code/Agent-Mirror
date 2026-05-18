import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { LlmEvalRequest } from "./LlmClient";
import {
  CANONICAL_QUESTIONS,
  HONESTY_PREFIX,
  makeAnthropicLlm,
  represent,
  representWithMeta,
} from "@/domain/represent";
import { demoStore, demoBrief } from "@/domain/store";

const ENV_KEYS = ["AGENT_MIRROR_LLM", "ANTHROPIC_API_KEY"] as const;
let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = {};
  for (const k of ENV_KEYS) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// A global fetch that FAILS the test if any code makes a real/unstubbed call.
function installNoNetworkGuard() {
  const guard = vi.fn(() => {
    throw new Error("NETWORK CALL ATTEMPTED — tests must be offline");
  });
  vi.stubGlobal("fetch", guard);
  return guard;
}

describe("M4.2 — env-gated client selection + safe mock fallback", () => {
  it("AGENT_MIRROR_LLM unset → mock, zero network, no meta", async () => {
    const guard = installNoNetworkGuard();
    const res = await representWithMeta(demoStore, demoBrief);
    expect(res.meta).toBeUndefined();
    expect(guard).not.toHaveBeenCalled();
    expect(JSON.stringify(res.assessments)).toBe(
      JSON.stringify(await represent(demoStore, demoBrief)),
    );
  });

  it("AGENT_MIRROR_LLM=mock → mock, zero network, no meta", async () => {
    process.env.AGENT_MIRROR_LLM = "mock";
    const guard = installNoNetworkGuard();
    const res = await representWithMeta(demoStore, demoBrief);
    expect(res.meta).toBeUndefined();
    expect(guard).not.toHaveBeenCalled();
  });

  it("AGENT_MIRROR_LLM=anthropic + missing key → mock fallback + LLM_DEGRADED, zero network", async () => {
    process.env.AGENT_MIRROR_LLM = "anthropic";
    const guard = installNoNetworkGuard();
    const res = await representWithMeta(demoStore, demoBrief);
    expect(res.meta).toEqual({ degraded: true, code: "LLM_DEGRADED" });
    expect(guard).not.toHaveBeenCalled();
    expect(JSON.stringify(res.assessments)).toBe(
      JSON.stringify(await represent(demoStore, demoBrief)),
    );
  });

  it("AGENT_MIRROR_LLM=anthropic + key + network error → mock fallback + LLM_DEGRADED (no real network)", async () => {
    process.env.AGENT_MIRROR_LLM = "anthropic";
    process.env.ANTHROPIC_API_KEY = "test-key-not-real";
    const stub = vi.fn(async () => {
      throw new Error("ECONNREFUSED (stubbed, no real network)");
    });
    vi.stubGlobal("fetch", stub);
    const res = await representWithMeta(demoStore, demoBrief);
    expect(res.meta).toEqual({ degraded: true, code: "LLM_DEGRADED" });
    expect(stub).toHaveBeenCalled(); // adapter attempted, then fell back
    expect(JSON.stringify(res.assessments)).toBe(
      JSON.stringify(await represent(demoStore, demoBrief)),
    );
  });

  it("explicitly injected client bypasses env selection (no degraded)", async () => {
    process.env.AGENT_MIRROR_LLM = "anthropic"; // would degrade if consulted
    const res = await representWithMeta(demoStore, demoBrief, {
      client: { id: "mock", evaluate: (r: LlmEvalRequest) => mockEval(r) },
    });
    expect(res.meta).toBeUndefined();
  });
});

// Minimal valid model payload for the canonical question set.
function validModelText(): string {
  return JSON.stringify({
    questions: CANONICAL_QUESTIONS.map((q) => ({
      questionId: q.id,
      answer: `model answer for ${q.id}`,
      confidence: 0.5,
      citedFields: [],
      missingToAnswer: [],
      misrepresentationRisk: "low",
      ambiguityFlags: [],
    })),
    summary: "Model summary without the honesty preamble.",
  });
}

function jsonResponse(text: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ content: [{ type: "text", text }] }),
  } as unknown as Response;
}

function mockEval(req: LlmEvalRequest) {
  // tiny stand-in just to satisfy the injected-client test
  return {
    scope: req.scope,
    entityId: req.entityId,
    questions: req.questions.map((q) => ({
      questionId: q.id,
      answer: "x",
      confidence: 0,
      citedFields: [],
      missingToAnswer: [],
      misrepresentationRisk: "low" as const,
      ambiguityFlags: [],
    })),
    summary: `${HONESTY_PREFIX} stub`,
  };
}

describe("M4.2 — anthropic adapter resilience & honesty (no real network)", () => {
  it("invalid JSON twice → onDegraded + deterministic mock fallback", async () => {
    const reasons: string[] = [];
    const fetchImpl = vi.fn(async () => jsonResponse("not json at all"));
    const client = makeAnthropicLlm({
      apiKey: "k",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      onDegraded: (r) => reasons.push(r),
    });
    const a = await client.evaluate({
      scope: "store",
      entityId: demoStore.profile.id,
      questions: CANONICAL_QUESTIONS,
      context: { store: { id: "s", name: "S", hasAbout: false, aboutLength: 0, shipping: { present: false }, returns: { present: false }, hasSustainability: false, currency: "USD", productCount: 0 } },
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2); // initial + one repair retry
    expect(reasons).toEqual(["anthropic_parse_failed"]);
    expect(a.summary.startsWith(HONESTY_PREFIX)).toBe(true); // mock fallback
  });

  it("valid JSON → adapter result with ENFORCED honesty prefix, schema-conformant", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(validModelText()));
    const client = makeAnthropicLlm({
      apiKey: "k",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const a = await client.evaluate({
      scope: "store",
      entityId: "trailhead-supply-co",
      questions: CANONICAL_QUESTIONS,
      context: { store: { id: "s", name: "S", hasAbout: false, aboutLength: 0, shipping: { present: false }, returns: { present: false }, hasSustainability: false, currency: "USD", productCount: 0 } },
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(a.summary.startsWith(HONESTY_PREFIX)).toBe(true);
    expect(a.scope).toBe("store");
    expect(a.entityId).toBe("trailhead-supply-co");
    expect(a.questions.map((q) => q.questionId)).toEqual(
      CANONICAL_QUESTIONS.map((q) => q.id),
    );
    for (const q of a.questions) {
      expect(q.confidence).toBeGreaterThanOrEqual(0);
      expect(q.confidence).toBeLessThanOrEqual(1);
      expect(["none", "low", "medium", "high"]).toContain(
        q.misrepresentationRisk,
      );
    }
    const rec = a as unknown as Record<string, unknown>;
    expect(rec.arq).toBeUndefined();
    expect(rec.score).toBeUndefined();
  });

  it("non-OK HTTP → mock fallback (no throw)", async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }) as unknown as Response);
    const reasons: string[] = [];
    const client = makeAnthropicLlm({
      apiKey: "k",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      onDegraded: (r) => reasons.push(r),
    });
    const a = await client.evaluate({
      scope: "store",
      entityId: "s",
      questions: CANONICAL_QUESTIONS,
      context: { store: { id: "s", name: "S", hasAbout: false, aboutLength: 0, shipping: { present: false }, returns: { present: false }, hasSustainability: false, currency: "USD", productCount: 0 } },
    });
    expect(reasons[0]).toMatch(/anthropic_error/);
    expect(a.summary.startsWith(HONESTY_PREFIX)).toBe(true);
  });
});
