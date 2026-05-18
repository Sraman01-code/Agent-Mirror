// offer_reliability pillar (max 20). Consistency of price, availability, sale
// pricing and admin↔public parity. Pure: score from this pillar's findings.

import type {
  Finding,
  PillarScore,
  RepresentationBrief,
  Store,
} from "@/domain/model";
import { scorePillarFromFindings } from "../_shared";

export function offerReliability(
  _store: Store,
  _brief: RepresentationBrief | undefined,
  findings: Finding[],
): PillarScore {
  void _store;
  void _brief;
  return scorePillarFromFindings("offer_reliability", findings);
}
