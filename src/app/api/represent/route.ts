import { NextResponse } from "next/server";
import type { RepresentationBrief, Store } from "@/domain/model";
import { representWithMeta } from "@/domain/represent";

// POST /api/represent  (API_PLAN.md, Phase 4)
// Body: { store: Store, scope?: "store"|"product", entityId?, brief? }
// Transport-only: validate → call the pipeline (deterministic mockLlm by
// default; env-gated Anthropic adapter via AGENT_MIRROR_LLM, M4.2) → typed
// envelope. `meta.degraded`/`LLM_DEGRADED` is surfaced only when the evaluator
// fell back to the mock. No scoring, no numbers fed to ARQ.

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

  const { store, scope, entityId, brief } = body as {
    store?: unknown;
    scope?: unknown;
    entityId?: unknown;
    brief?: unknown;
  };

  if (!isStoreShaped(store)) {
    return badInput(
      'Body must include a valid "store" (with profile.id and products[]).',
    );
  }
  if (scope !== undefined && scope !== "store" && scope !== "product") {
    return badInput('"scope", if provided, must be "store" or "product".');
  }
  if (scope === "product" && typeof entityId !== "string") {
    return badInput('scope "product" requires a string "entityId".');
  }
  if (brief !== undefined && (typeof brief !== "object" || brief === null)) {
    return badInput('"brief", if provided, must be an object.');
  }

  try {
    const { assessments, meta } = await representWithMeta(
      store as Store,
      brief as RepresentationBrief | undefined,
      {
        scope: scope as "store" | "product" | undefined,
        entityId: typeof entityId === "string" ? entityId : undefined,
      },
    );
    return NextResponse.json({
      ok: true,
      data: { assessments },
      ...(meta ? { meta } : {}),
    });
  } catch (err) {
    return badInput(
      err instanceof Error ? err.message : "Unable to evaluate representation.",
    );
  }
}
