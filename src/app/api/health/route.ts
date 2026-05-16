import { NextResponse } from "next/server";

// Smoke endpoint used by VERIFICATION_CHECKLIST.md (M1.1) and demo failure
// drills. Shape mirrors the API_PLAN.md standard envelope.
export function GET() {
  return NextResponse.json({
    ok: true,
    data: {
      status: "up",
      phase: 1,
    },
  });
}
