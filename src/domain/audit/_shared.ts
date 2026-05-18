// Internal audit helpers (Milestone M3.1). Pure, deterministic, no Date/
// random/shared mutable state. Not part of the public surface — detectors and
// the pipeline import from here; consumers import from src/domain/audit/index.

import type { Finding, FindingKind, PillarId, Severity } from "@/domain/model";

// Deterministic 32-bit FNV-1a → base36. Stable across runs/machines, no deps.
function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // 32-bit FNV prime multiply via shifts (keeps it in uint32 range).
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(36);
}

export interface FindingInput {
  kind: FindingKind;
  reasonCode: string;
  severity: Severity;
  scope: "store" | "product";
  entityId: string;
  fieldPath: string;
  message: string;
  pillar: PillarId;
  evidence?: string;
}

// Builds a Finding with a stable id derived ONLY from
// kind + entityId + fieldPath + reasonCode (per task spec) — so the same
// defect always yields the same id, and re-running audit is byte-identical.
export function makeFinding(input: FindingInput): Finding {
  const id =
    "f" +
    fnv1a(
      `${input.kind}|${input.entityId}|${input.fieldPath}|${input.reasonCode}`,
    );
  const finding: Finding = {
    id,
    kind: input.kind,
    reasonCode: input.reasonCode,
    severity: input.severity,
    scope: input.scope,
    entityId: input.entityId,
    fieldPath: input.fieldPath,
    message: input.message,
    pillar: input.pillar,
  };
  if (input.evidence !== undefined) finding.evidence = input.evidence;
  return finding;
}

export const cmp = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

// A token is "present & meaningful" if non-empty after trimming and not an
// obvious placeholder. Used by several detectors for consistent judgement.
const PLACEHOLDERS = new Set([
  "",
  "n/a",
  "na",
  "none",
  "tbd",
  "unknown",
  "varies",
  "-",
  ".",
]);

export function isMeaningful(value: string | undefined | null): boolean {
  if (value == null) return false;
  return !PLACEHOLDERS.has(value.trim().toLowerCase());
}

export const hasNumber = (s: string | undefined): boolean =>
  !!s && /\d/.test(s);
