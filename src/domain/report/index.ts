// Report assembler + export (Milestone M7.1).
//
// `buildReport(store, brief)` assembles the canonical `ReportPayload`
// (DATA_MODEL §7) by composing the EXISTING domain engines — audit → score →
// represent → recommend → simulate → ACP preview — with NO duplicated logic
// and NO HTTP hop. The numeric path (score/recommend/simulate/acp) is pure &
// deterministic and LLM-free; only the advisory representation narrative uses
// the deterministic mock evaluator. Identical (store, brief) ⇒ byte-identical
// report once the informational `generatedAt` / nested `computedAt` are
// excluded (no Date.now / Math.random in hashable output).
//
// HONESTY RULE (PROJECT_MEMORY §7): the report is an evidence-based *likely*
// representation simulation. It does NOT measure real proprietary AI-engine
// rankings, and the ACP section is a readiness PREVIEW, not a live submission.

import type {
  Finding,
  QuestionCoverage,
  QuestionRepresentation,
  RepresentationBrief,
  ReportPayload,
  Severity,
  Store,
} from "@/domain/model";
import { audit } from "@/domain/audit";
import { score } from "@/domain/scoring";
import { recommend } from "@/domain/recommend";
import { simulate } from "@/domain/simulate";
import { represent, mockLlm, CANONICAL_QUESTIONS } from "@/domain/represent";
import { computeAcpPreview } from "./acpSchema";

export { ACP_FIELDS, computeAcpPreview } from "./acpSchema";

export const HONESTY_NOTE =
  "Honesty note: this report is an evidence-based simulation of how an AI " +
  "shopping agent would LIKELY represent this store, derived from " +
  "machine-readable store data and deterministic evaluation rules. It does " +
  "NOT measure or claim to measure any real proprietary AI engine's actual " +
  "rankings or behaviour. The ACP/feed section is a readiness preview only — " +
  "no live submission to any external feed or engine is performed.";

// The M6.1 curated subset (priority-ranked top-3) that deterministically
// reproduces the locked before/after 58 → 76, Δ+18, band At Risk.
const CURATED_TEMPLATE_IDS = [
  "clarify-return-policy",
  "add-shipping-details",
  "add-product-specs",
];

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function classify(
  q: QuestionRepresentation,
): QuestionCoverage["status"] {
  if (q.confidence >= 0.7 && q.misrepresentationRisk === "none")
    return "answered";
  if (q.confidence < 0.35) return "unanswered";
  return "partially_answered";
}

/** Deterministic canonical ReportPayload from the real pipeline. */
export async function buildReport(
  store: Store,
  brief: RepresentationBrief,
): Promise<ReportPayload> {
  const findings: Finding[] = audit(store, brief);
  const scoreResult = score(store, brief, findings);
  const plan = recommend(store, brief, findings);

  const [assessment] = await represent(store, brief, {
    client: mockLlm,
    scope: "store",
  });

  const curatedIds = plan
    .filter((r) => CURATED_TEMPLATE_IDS.includes(r.templateId))
    .map((r) => r.id);
  const simulation = await simulate(
    store,
    brief,
    findings,
    plan,
    curatedIds,
  );

  // Question coverage across the canonical shopper question set.
  const questionCoverage: QuestionCoverage[] = CANONICAL_QUESTIONS.map((cq) => {
    const q = assessment.questions.find((x) => x.questionId === cq.id);
    const r: QuestionRepresentation =
      q ?? {
        questionId: cq.id,
        answer: "",
        confidence: 0,
        citedFields: [],
        missingToAnswer: [],
        misrepresentationRisk: "low",
        ambiguityFlags: [],
      };
    const status = classify(r);
    const coverage: QuestionCoverage = {
      questionId: cq.id,
      status,
      bestAnswer: r.answer,
      matchedSources: r.citedFields,
      missingInformation: r.missingToAnswer,
    };
    if (status !== "answered") {
      coverage.faqCandidate = {
        shouldCreate: true,
        question: cq.text,
        answer: r.answer,
      };
    }
    return coverage;
  });

  // Top findings: most severe first, then the audit's stable order.
  const topFindings: Finding[] = [...findings]
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .slice(0, 8);

  const acpPreview = computeAcpPreview(store);

  return {
    // Informational only — excluded from determinism/hash (tests strip it).
    generatedAt: new Date().toISOString(),
    store: { id: store.profile.id, name: store.profile.name, source: store.source },
    brief,
    score: scoreResult,
    representation: [assessment],
    questionCoverage,
    topFindings,
    plan,
    simulation,
    acpPreview,
  };
}

// ── Export helpers ─────────────────────────────────────────────────────────

/** Stable JSON artifact (pretty-printed). Mirrors the ReportPayload exactly. */
export function reportToJson(report: ReportPayload): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Coherent Markdown artifact matching the on-screen data. Deterministic
 * (no timestamps embedded). Includes the store, hero product, the locked
 * ARQ / after / delta / ACP numbers, and the honesty note.
 */
export function reportToMarkdown(report: ReportPayload): string {
  const { store, brief, score: sc, simulation: sim, acpPreview } = report;
  const heroId = brief.heroProductIds[0];
  const heroRec = report.plan[0];
  const after = sim ? sim.after.arq : sc.arq;
  const delta = sim ? sim.delta : 0;

  const lines: string[] = [];
  lines.push(`# Agent Mirror — Representation Report: ${store.name}`);
  lines.push("");
  lines.push(
    "_Evidence-based simulation of likely AI-agent representation — not a " +
      "measurement of any real AI engine._",
  );
  lines.push("");
  lines.push("## Score");
  lines.push("");
  lines.push(
    `- Current **ARQ ${sc.arq} / 100** — band: **${sc.band === "at_risk" ? "At Risk" : sc.band}**`,
  );
  lines.push(
    `- Simulated **After ${after} / 100** · **Delta +${delta}** (curated fixes applied)`,
  );
  lines.push(`- Hero product: \`${heroId}\``);
  lines.push("");
  lines.push("## Pillars");
  lines.push("");
  lines.push("| Pillar | Score | Max |");
  lines.push("|---|---:|---:|");
  for (const p of sc.pillars) {
    lines.push(`| ${p.pillar} | ${p.score} | ${p.maxPoints} |`);
  }
  lines.push("");
  lines.push("## Top recommendation");
  lines.push("");
  if (heroRec) {
    lines.push(`- **${heroRec.title}** — ${heroRec.rationale}`);
  }
  lines.push("");
  lines.push("## Buyer-question coverage");
  lines.push("");
  for (const q of report.questionCoverage) {
    lines.push(`- \`${q.questionId}\`: **${q.status}**`);
  }
  lines.push("");
  lines.push("## Top findings");
  lines.push("");
  for (const f of report.topFindings) {
    lines.push(`- [${f.severity}] ${f.message}`);
  }
  lines.push("");
  lines.push("## Export readiness");
  lines.push("");
  lines.push(`- **ACP ${acpPreview.coveragePct}%** feed-field coverage`);
  for (const w of acpPreview.warnings) lines.push(`- ${w}`);
  lines.push("");
  lines.push(`> ${HONESTY_NOTE}`);
  lines.push("");
  return lines.join("\n");
}
