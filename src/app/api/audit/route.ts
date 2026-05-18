import { NextResponse } from "next/server";
import type { RepresentationBrief, Store } from "@/domain/model";
import { audit } from "@/domain/audit";

// POST /api/audit  (API_PLAN.md, Phase 3)
// Body: { store: Store, brief?: RepresentationBrief }
// Transport-only: validate at the boundary → call the pure domain audit →
// return the typed envelope. No scoring, no LLM, no mutation.

function badInput(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "BAD_INPUT", message } },
    { status: 400 },
  );
}

// Minimal structural guard. The domain assumes already-valid typed input
// (API_PLAN "Validation & Safety"); we only reject obviously malformed bodies.
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
  const { store, brief } = body as {
    store?: unknown;
    brief?: unknown;
  };

  if (!isStoreShaped(store)) {
    return badInput(
      'Body must include a valid "store" (with profile.id and products[]).',
    );
  }
  if (
    brief !== undefined &&
    (typeof brief !== "object" || brief === null)
  ) {
    return badInput('"brief", if provided, must be an object.');
  }

  const findings = audit(
    store as Store,
    brief as RepresentationBrief | undefined,
  );
  return NextResponse.json({ ok: true, data: { findings } });
}
