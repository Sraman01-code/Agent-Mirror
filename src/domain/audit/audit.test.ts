import { describe, it, expect } from "vitest";
import type { Finding, FindingKind } from "@/domain/model";
import { audit } from "@/domain/audit";
import { demoStore, demoBrief } from "@/domain/store";

const REQUIRED_KINDS: FindingKind[] = [
  "missing_field",
  "thin_content",
  "ambiguous_value",
  "contradiction",
  "missing_attribute",
  "unanswered_question",
  "weak_differentiation",
  "trust_gap",
];

describe("audit() — M3.1 deterministic engine", () => {
  it("produces >=1 Finding for every planted seed defect kind", () => {
    const findings = audit(demoStore, demoBrief);
    const kinds = new Set(findings.map((f) => f.kind));
    for (const k of REQUIRED_KINDS) {
      expect(kinds.has(k), `expected at least one "${k}" finding`).toBe(true);
    }
  });

  it("is deterministic — byte-identical across runs", () => {
    const a = JSON.stringify(audit(demoStore, demoBrief));
    const b = JSON.stringify(audit(demoStore, demoBrief));
    expect(a).toBe(b);
  });

  it("returns a stably-ordered list (matches the documented comparator)", () => {
    const findings = audit(demoStore, demoBrief);
    // Field-wise comparator mirroring src/domain/audit/index.ts orderFindings
    // (no lossy delimiter join — '.' vs '|' would reorder prefixes).
    const c = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
    const rank = (f: Finding) => (f.scope === "store" ? 0 : 1);
    const ordered = [...findings].sort(
      (a, b) =>
        rank(a) - rank(b) ||
        c(a.entityId, b.entityId) ||
        c(a.fieldPath, b.fieldPath) ||
        c(a.reasonCode, b.reasonCode) ||
        c(a.kind, b.kind) ||
        c(a.id, b.id),
    );
    expect(findings.map((f) => f.id)).toEqual(ordered.map((f) => f.id));
  });

  it("every Finding has all required fields, non-empty", () => {
    const findings = audit(demoStore, demoBrief);
    expect(findings.length).toBeGreaterThan(0);
    for (const f of findings) {
      for (const field of [
        "id",
        "kind",
        "reasonCode",
        "severity",
        "scope",
        "entityId",
        "fieldPath",
        "message",
        "pillar",
      ] as const) {
        expect(typeof f[field], `${field} on ${f.id}`).toBe("string");
        expect((f[field] as string).length, `${field} on ${f.id}`).toBeGreaterThan(0);
      }
      expect(["critical", "high", "medium", "low"]).toContain(f.severity);
      expect(["store", "product"]).toContain(f.scope);
    }
  });

  it("Finding ids are stable for the same input", () => {
    const ids1 = audit(demoStore, demoBrief).map((f) => f.id);
    const ids2 = audit(demoStore, demoBrief).map((f) => f.id);
    expect(ids1).toEqual(ids2);
    // ids derived only from kind+entityId+fieldPath+reasonCode → unique here.
    expect(new Set(ids1).size).toBe(ids1.length);
  });

  it("does not compute any score in this milestone (findings only)", () => {
    const findings = audit(demoStore, demoBrief) as unknown as Record<
      string,
      unknown
    >[];
    for (const f of findings) {
      expect(f.arq).toBeUndefined();
      expect(f.score).toBeUndefined();
      expect(f.delta).toBeUndefined();
    }
  });
});
