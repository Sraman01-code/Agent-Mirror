import { NextResponse } from "next/server";
import type {
  Finding,
  Recommendation,
  RepresentationBrief,
  Store,
} from "@/domain/model";
import { simulate } from "@/domain/simulate";

// POST /api/simulate  (API_PLAN.md, Phase 6)
// Body: { store, brief, findings, recommendations, selectedRecommendationIds }
// Transport-only: validate at the boundary → call the deterministic
// simulation engine → typed envelope. The numeric path is audit + score +
// the M5.2 FixPatch applier ONLY; sample-answer narrative uses the
// deterministic mock evaluator (no real LLM, no network, no key). Identical
// body ⇒ byte-identical SimulationResult (computedAt excluded).

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

  const { store, brief, findings, recommendations, selectedRecommendationIds } =
    body as {
      store?: unknown;
      brief?: unknown;
      findings?: unknown;
      recommendations?: unknown;
      selectedRecommendationIds?: unknown;
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
  if (!Array.isArray(recommendations)) {
    return badInput('Body must include a "recommendations" array.');
  }
  if (
    !Array.isArray(selectedRecommendationIds) ||
    !selectedRecommendationIds.every((x) => typeof x === "string")
  ) {
    return badInput(
      'Body must include "selectedRecommendationIds" (string[]).',
    );
  }

  const simulation = await simulate(
    store as Store,
    brief as RepresentationBrief,
    findings as Finding[],
    recommendations as Recommendation[],
    selectedRecommendationIds as string[],
  );
  return NextResponse.json({ ok: true, data: { simulation } });
}
