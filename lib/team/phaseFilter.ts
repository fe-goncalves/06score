import { groupPhasesForCompetition } from "@/lib/athlete/athleteStatsPhases";
import type { AthleteStatsPhaseRecord } from "@/lib/types";

export function phaseIdsForPhaseFilter(
  statsPhases: AthleteStatsPhaseRecord[],
  competitionId: string,
  phaseKey: string,
): string[] | null {
  if (competitionId === "all" || phaseKey === "all") return null;
  const phaseIds: string[] = [];
  for (const phase of statsPhases) {
    if (phase.competition_id !== competitionId) continue;
    const key = phase.template_id ?? phase.full_name;
    if (key === phaseKey) phaseIds.push(phase.id);
  }
  return phaseIds.length ? phaseIds : [];
}

export function phaseFilterOptions(
  statsPhases: AthleteStatsPhaseRecord[],
  competitionId: string,
) {
  if (competitionId === "all") return [];
  return groupPhasesForCompetition(statsPhases, competitionId).map((p) => ({
    id: p.key,
    label: p.label,
  }));
}
