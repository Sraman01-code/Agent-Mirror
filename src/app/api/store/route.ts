import { NextResponse } from "next/server";
import { mockStore } from "@/domain/store";

// GET /api/store?source=mock|shopify  (API_PLAN.md)
// Transport-only: pick the StoreSource, call the domain, return the typed
// envelope. No business logic here. Phase 2 ships `mock`; `shopify` is a
// Phase 8 read-only adapter — until then it honestly reports SOURCE_UNAVAILABLE
// (no Shopify integration is introduced in this milestone).
export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get("source") ?? "mock";

  if (source === "shopify") {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SOURCE_UNAVAILABLE",
          message: "The shopify store source is not available until Phase 8.",
        },
      },
      { status: 503 },
    );
  }

  if (source !== "mock") {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "BAD_INPUT",
          message: `Unknown store source "${source}". Expected "mock" or "shopify".`,
        },
      },
      { status: 400 },
    );
  }

  const store = await mockStore.getStore();
  return NextResponse.json({ ok: true, data: store });
}
