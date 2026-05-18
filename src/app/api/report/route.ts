import { NextResponse } from "next/server";
import { demoStore, demoBrief } from "@/domain/store";
import { buildReport, reportToMarkdown } from "@/domain/report";

// GET /api/report?format=json|md   (API_PLAN.md, Phase 7)
// Server composes the domain pipeline directly (no HTTP hop) over the seeded
// store + brief and returns a coherent artifact matching the on-screen demo
// data. Transport-only: no business logic here. Deterministic (the
// informational generatedAt/computedAt are the only volatile fields). No live
// ACP/feed submission; no real LLM in the numeric path.
//
//  - format=json (default) → { ok:true, data:{ report: ReportPayload } }
//  - format=md             → { ok:true, data:{ markdown: string } }

function badInput(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "BAD_INPUT", message } },
    { status: 400 },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "json").toLowerCase();

  if (format !== "json" && format !== "md") {
    return badInput('Query "format" must be "json" or "md".');
  }

  const report = await buildReport(demoStore, demoBrief);

  if (format === "md") {
    return NextResponse.json({
      ok: true,
      data: { markdown: reportToMarkdown(report) },
    });
  }
  return NextResponse.json({ ok: true, data: { report } });
}
