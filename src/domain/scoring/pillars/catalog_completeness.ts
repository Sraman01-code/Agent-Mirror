// catalog_completeness pillar (max 25). Product identity + decision-support
// data: titles, descriptions, category, specs, variant data, media richness.
// Pure: score derived solely from the audit findings mapped to this pillar.

import type {
  Finding,
  PillarScore,
  RepresentationBrief,
  Store,
} from "@/domain/model";
import { scorePillarFromFindings } from "../_shared";

export function catalogCompleteness(
  _store: Store,
  _brief: RepresentationBrief | undefined,
  findings: Finding[],
): PillarScore {
  void _store;
  void _brief;
  return scorePillarFromFindings("catalog_completeness", findings);
}
