import { NextResponse } from "next/server";
import type { Finding, RepresentationBrief, Store } from "@/domain/model";
import { recommend } from "@/domain/recommend";

// POST /api/recommend  (API_PLAN.md, Phase 5)
// Body: { store: Store, brief: RepresentationBrief, findings: Finding[] }
// Transport-only: validate at the boundary → call the pure deterministic
// recommendation engine → typed envelope. NO LLM (the LLM only enriches copy
// later, never ranking/scope/numbers — AI_PROMPTS §3), no mutation, no Date in
// the response. Deterministic: identical body ⇒ byte-identical recommendations.

function badInput(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "BAD_INPUT", message } },
    { status: 400 },
  );
}

function isStoreShaped(v: unknown): v is Store {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  if (typeof s.profile !== "object" || s.profile === null) return false;
  if (typeof (s.profile as Record<string, unknown>).id !== "string") return false;
  if (!Array.isArray(s.products)) return false;
  return true;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badInput("Request body must be valid JSON.");
  }
  if (typeof body !== "object" || body === null) {
    return badInput("Request body must be an object.");
  }

  const { store, brief, findings } = body as {
    store?: unknown;
    brief?: unknown;
    findings?: unknown;
  };

  if (!isStoreShaped(store)) {
    return badInput(
      'Body must include a valid "store" (with profile.id and products[]).',
    );
  }
  if (typeof brief !== "object" || brief === null) {
    return badInput('Body must include a "brief" object.');
  }
  if (!Array.isArray(findings)) {
    return badInput('Body must include a "findings" array.');
  }

  const recommendations = recommend(
    store as Store,
    brief as RepresentationBrief,
    findings as Finding[],
  );
  return NextResponse.json({ ok: true, data: { recommendations } });
}
