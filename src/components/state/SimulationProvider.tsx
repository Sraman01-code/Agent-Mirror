"use client";

// SimulationProvider (Milestone M6.1).
//
// Client-side context that holds the merchant's selected recommendation set
// and the current before/after SimulationResult. It is intentionally a thin
// state shell: the NUMERIC simulation is owned by the deterministic domain
// engine (src/domain/simulate) — server-rendered for the static demo, or
// re-fetched from POST /api/simulate for interactive toggling. The provider
// never computes ARQ itself (determinism + "no LLM in numbers" stay intact).

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Recommendation, SimulationResult } from "@/domain/model";

export interface SimulationContextValue {
  /** All ranked recommendations available to toggle. */
  recommendations: Recommendation[];
  /** Currently selected recommendation ids (default = curated subset). */
  selectedRecommendationIds: string[];
  /** The current before/after result (curated subset for the static demo). */
  simulation: SimulationResult;
  /** Toggle a recommendation in/out of the applied set. */
  toggleRecommendation: (id: string) => void;
  /** Restore the curated default selection. */
  reset: () => void;
  /** Replace the simulation (e.g. after a POST /api/simulate round-trip). */
  setSimulation: (next: SimulationResult) => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({
  recommendations,
  curatedSelectedIds,
  simulation: initialSimulation,
  children,
}: {
  recommendations: Recommendation[];
  curatedSelectedIds: string[];
  simulation: SimulationResult;
  children: ReactNode;
}) {
  const [selectedRecommendationIds, setSelected] =
    useState<string[]>(curatedSelectedIds);
  const [simulation, setSimulation] =
    useState<SimulationResult>(initialSimulation);

  const toggleRecommendation = useCallback((id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const reset = useCallback(() => {
    setSelected(curatedSelectedIds);
    setSimulation(initialSimulation);
  }, [curatedSelectedIds, initialSimulation]);

  const value = useMemo<SimulationContextValue>(
    () => ({
      recommendations,
      selectedRecommendationIds,
      simulation,
      toggleRecommendation,
      reset,
      setSimulation,
    }),
    [
      recommendations,
      selectedRecommendationIds,
      simulation,
      toggleRecommendation,
      reset,
    ],
  );

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return ctx;
}
