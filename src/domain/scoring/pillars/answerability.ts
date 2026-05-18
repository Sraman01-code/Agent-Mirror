// answerability pillar (max 15). Canonical buyer questions answerable from
// the store graph / FAQ coverage. Pure.

import type {
  Finding,
  PillarScore,
  RepresentationBrief,
  Store,
} from "@/domain/model";
import { scorePillarFromFindings } from "../_shared";

export function answerability(
  _store: Store,
  _brief: RepresentationBrief | undefined,
  findings: Finding[],
): PillarScore {
  void _store;
  void _brief;
  return scorePillarFromFindings("answerability", findings);
}
