// policy_clarity pillar (max 15). Return, shipping, privacy, terms, seller
// identity — explicit, linkable, machine-readable. Pure.

import type {
  Finding,
  PillarScore,
  RepresentationBrief,
  Store,
} from "@/domain/model";
import { scorePillarFromFindings } from "../_shared";

export function policyClarity(
  _store: Store,
  _brief: RepresentationBrief | undefined,
  findings: Finding[],
): PillarScore {
  void _store;
  void _brief;
  return scorePillarFromFindings("policy_clarity", findings);
}
