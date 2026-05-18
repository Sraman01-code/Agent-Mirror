import { NextResponse } from "next/server";
import { selectStoreSource } from "@/domain/store";

// GET /api/store?source=mock|shopify  (API_PLAN.md)
// Transport-only: resolve the StoreSource via the domain factory, call it,
// return the typed envelope. No business logic here.
//  - default / source=mock     → deterministic mock Store (unchanged, M2.2)
//  - source=shopify + env      → read-only Shopify adapter (M8.1)
//  - source=shopify, no env    → 503 SOURCE_UNAVAILABLE (mock stays default)
//  - unknown source            → 400 BAD_INPUT
// Secrets (admin token) are read server-side only and never appear in any
// response or error here.
export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get("source");
  const selected = selectStoreSource(source);

  if (!selected.ok) {
    const status = selected.code === "SOURCE_UNAVAILABLE" ? 503 : 400;
    return NextResponse.json(
      { ok: false, error: { code: selected.code, message: selected.message } },
      { status },
    );
  }

  try {
    const store = await selected.source.getStore();
    return NextResponse.json({ ok: true, data: store });
  } catch {
    // Generic — never echo the token, domain credentials, or upstream body.
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SOURCE_UNAVAILABLE",
          message:
            "The shopify store source could not be read. Mock remains the default.",
        },
      },
      { status: 503 },
    );
  }
}
