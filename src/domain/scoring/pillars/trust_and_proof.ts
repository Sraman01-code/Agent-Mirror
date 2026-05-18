// trust_and_proof pillar (max 15). Reviews/ratings, organization/contact
// data, credibility cues. Pure.

import type {
  Finding,
  PillarScore,
  RepresentationBrief,
  Store,
} from "@/domain/model";
import { scorePillarFromFindings } from "../_shared";

export function trustAndProof(
  _store: Store,
  _brief: RepresentationBrief | undefined,
  findings: Finding[],
): PillarScore {
  void _store;
  void _brief;
  return scorePillarFromFindings("trust_and_proof", findings);
}
