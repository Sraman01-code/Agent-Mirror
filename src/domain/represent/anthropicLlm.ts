// Anthropic adapter for the LlmClient port (Milestone M4.2).
//
// Implements the AI_PROMPTS §1 representation-evaluation prompt via the
// Anthropic Messages API using fetch only (no SDK dependency). It is created
// by a FACTORY — nothing here runs at module load, and no API key is read
// unless an anthropic client is explicitly constructed.
//
// Resilience contract (task M4.2): on missing key (handled by the factory),
// network failure, non-OK HTTP, invalid/non-JSON output (after one repair
// retry), or any error, the adapter DOES NOT THROW for normal usage — it
// invokes the deterministic mock fallback for that call and signals
// degradation via `onDegraded`. The honesty rule is enforced regardless of
// model output (PROJECT_MEMORY §7).

import type {
  QuestionRepresentation,
  RepresentationAssessment,
} from "@/domain/model";
import type { LlmClient, LlmEvalRequest } from "./LlmClient";
import { HONESTY_PREFIX, mockLlm } from "./mockLlm";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const RISKS = ["none", "low", "medium", "high"] as const;

export interface AnthropicDeps {
  apiKey: string;
  /** Injectable for tests — never makes a real network call in CI. */
  fetchImpl?: typeof fetch;
  /** Deterministic client used when the API path fails. Default: mockLlm. */
  fallback?: LlmClient;
  /** Called once per evaluate() that degrades to the fallback. */
  onDegraded?: (reason: string) => void;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const SYSTEM_PROMPT =
  "You simulate how a modern AI shopping agent would represent a store/product " +
  "to a shopper, using ONLY the structured data provided. Do not invent facts. " +
  "If data is missing or ambiguous, reflect that honestly in the answer and " +
  "flags. This is a likely, evidence-based simulation — never claim to measure " +
  "real ChatGPT/Gemini/Claude engine behaviour. Output STRICT JSON only, no prose.";

function buildUserPrompt(req: LlmEvalRequest): string {
  const questions = req.questions
    .map((q) => `- ${q.id}: ${q.text}`)
    .join("\n");
  return [
    "MERCHANT_BRIEF:",
    JSON.stringify(req.context.brief ?? null),
    "",
    "STORE_CONTEXT:",
    JSON.stringify({ store: req.context.store, product: req.context.product }),
    "",
    `SCOPE: ${req.scope} (entityId: ${req.entityId})`,
    "",
    "QUESTIONS:",
    questions,
    "",
    "Return how an AI shopping agent would most likely answer EACH question " +
      "about the " +
      req.scope +
      " given only STORE_CONTEXT, plus structured reflection and the gap " +
      "versus MERCHANT_BRIEF. If evidence conflicts → contradiction; if absent " +
      "→ missing; never invent facts.",
    "",
    "Output STRICT JSON ONLY in exactly this shape:",
    '{"questions":[{"questionId":"string","answer":"string (<=80 words)",' +
      '"confidence":0.0,"citedFields":["fieldPath"],"missingToAnswer":["string"],' +
      '"misrepresentationRisk":"none|low|medium|high","ambiguityFlags":["string"]}],' +
      '"summary":"string"}',
  ].join("\n");
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function coerceQuestion(
  raw: unknown,
  questionId: string,
): QuestionRepresentation | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.answer !== "string" || r.answer.trim() === "") return null;
  const confidence =
    typeof r.confidence === "number" && Number.isFinite(r.confidence)
      ? Math.min(1, Math.max(0, r.confidence))
      : null;
  if (confidence === null) return null;
  const risk = RISKS.includes(r.misrepresentationRisk as never)
    ? (r.misrepresentationRisk as QuestionRepresentation["misrepresentationRisk"])
    : null;
  if (risk === null) return null;
  return {
    questionId,
    answer: r.answer,
    confidence,
    citedFields: isStringArray(r.citedFields) ? r.citedFields : [],
    missingToAnswer: isStringArray(r.missingToAnswer) ? r.missingToAnswer : [],
    misrepresentationRisk: risk,
    ambiguityFlags: isStringArray(r.ambiguityFlags) ? r.ambiguityFlags : [],
  };
}

// Strict parse: every requested question must be present & valid, else null
// (caller does one repair retry, then falls back to the mock).
function parseAssessment(
  text: string,
  req: LlmEvalRequest,
): RepresentationAssessment | null {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof json !== "object" || json === null) return null;
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj.questions)) return null;

  const byId = new Map<string, unknown>();
  for (const q of obj.questions) {
    if (q && typeof q === "object" && typeof (q as Record<string, unknown>).questionId === "string") {
      byId.set((q as Record<string, unknown>).questionId as string, q);
    }
  }
  const questions: QuestionRepresentation[] = [];
  for (const cq of req.questions) {
    const coerced = coerceQuestion(byId.get(cq.id), cq.id);
    if (!coerced) return null;
    questions.push(coerced);
  }
  const summary =
    typeof obj.summary === "string" && obj.summary.trim() !== ""
      ? obj.summary
      : `Likely representation of ${req.scope} ${req.entityId}.`;

  return {
    scope: req.scope,
    entityId: req.entityId,
    questions,
    summary,
  };
}

// Honesty rule: the summary MUST be framed as a likely, evidence-based
// simulation regardless of what the model returned.
function enforceHonesty(a: RepresentationAssessment): RepresentationAssessment {
  if (a.summary.startsWith(HONESTY_PREFIX)) return a;
  return { ...a, summary: `${HONESTY_PREFIX} ${a.summary}` };
}

export function makeAnthropicLlm(deps: AnthropicDeps): LlmClient {
  const fallback = deps.fallback ?? mockLlm;
  const model = deps.model ?? process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";
  const temperature = deps.temperature ?? 0;
  const maxTokens = deps.maxTokens ?? 1500;

  async function call(
    fetchImpl: typeof fetch,
    userPrompt: string,
    repairOf: string | null,
  ): Promise<string> {
    const messages: { role: "user" | "assistant"; content: string }[] = [
      { role: "user", content: userPrompt },
    ];
    if (repairOf !== null) {
      messages.push({ role: "assistant", content: repairOf });
      messages.push({
        role: "user",
        content:
          "That was not valid JSON matching the required schema. Reply with " +
          "ONLY the JSON object, no prose, no code fences.",
      });
    }
    const res = await fetchImpl(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": deps.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
    if (!res.ok) {
      throw new Error(`anthropic_http_${res.status}`);
    }
    const data: unknown = await res.json();
    const content = (data as { content?: unknown }).content;
    if (!Array.isArray(content)) throw new Error("anthropic_bad_response");
    const first = content.find(
      (c) => c && typeof c === "object" && (c as { type?: string }).type === "text",
    );
    const textValue = (first as { text?: unknown } | undefined)?.text;
    if (typeof textValue !== "string") throw new Error("anthropic_no_text");
    return textValue;
  }

  return {
    id: "anthropic",
    async evaluate(
      req: LlmEvalRequest,
    ): Promise<RepresentationAssessment> {
      const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
      const userPrompt = buildUserPrompt(req);
      try {
        const raw = await call(fetchImpl, userPrompt, null);
        let parsed = parseAssessment(raw, req);
        if (!parsed) {
          const repaired = await call(fetchImpl, userPrompt, raw);
          parsed = parseAssessment(repaired, req);
        }
        if (!parsed) {
          deps.onDegraded?.("anthropic_parse_failed");
          return fallback.evaluate(req);
        }
        return enforceHonesty(parsed);
      } catch (err) {
        deps.onDegraded?.(
          `anthropic_error:${err instanceof Error ? err.message : "unknown"}`,
        );
        return fallback.evaluate(req);
      }
    },
  };
}
