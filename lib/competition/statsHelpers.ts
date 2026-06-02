import type {
  AthleteStatLeader,
  StaffStatLeader,
  TeamEditionStats,
} from "@/lib/types";

export const STATS_PREVIEW_LIMIT = 5;

export type AthleteLeaderValueKey =
  | "goals"
  | "assists"
  | "yellow_cards"
  | "red_cards"
  | "motm_count"
  | "totw_count";

export type TeamLeaderValueKey =
  | "goals_conceded"
  | "wins"
  | "points"
  | "goals_scored";

export function athleteSurname(
  athlete: AthleteStatLeader["athletes"],
): string {
  if (!athlete) return "—";
  return athlete.surname?.trim() || athlete.full_name;
}

export function staffSurname(
  staff: StaffStatLeader["staff_members"],
): string {
  if (!staff) return "—";
  return staff.surname?.trim() || staff.full_name;
}

export function teamShortName(
  team: TeamEditionStats["teams"] | StaffStatLeader["teams"],
): string {
  if (!team) return "—";
  return team.short_name ?? team.full_name ?? "—";
}

export function filterAthleteLeaders(
  leaders: AthleteStatLeader[],
  valueKey: AthleteLeaderValueKey,
): AthleteStatLeader[] {
  return leaders.filter((row) => (row[valueKey] ?? 0) > 0);
}

export function athleteLeaderValue(
  row: AthleteStatLeader,
  valueKey: AthleteLeaderValueKey,
): number {
  return row[valueKey] ?? 0;
}

export function buildBestDefenseTeams(
  stats: TeamEditionStats[],
): TeamEditionStats[] {
  return [...stats]
    .filter((s) => s.matches_played > 0)
    .sort((a, b) => {
      if (a.goals_conceded !== b.goals_conceded) {
        return a.goals_conceded - b.goals_conceded;
      }
      return b.matches_played - a.matches_played;
    });
}

export function buildTeamLeaders(
  stats: TeamEditionStats[],
  valueKey: TeamLeaderValueKey,
  ascending = false,
): TeamEditionStats[] {
  const filtered = stats.filter((s) => {
    const value = s[valueKey] ?? 0;
    return valueKey === "goals_conceded" ? s.matches_played > 0 : value > 0;
  });

  return filtered.sort((a, b) => {
    const va = a[valueKey] ?? 0;
    const vb = b[valueKey] ?? 0;
    return ascending ? va - vb : vb - va;
  });
}

export function teamLeaderValue(
  row: TeamEditionStats,
  valueKey: TeamLeaderValueKey,
): number {
  return row[valueKey] ?? 0;
}

export function filterCoachLeaders(
  leaders: StaffStatLeader[],
): StaffStatLeader[] {
  return leaders.filter((row) => (row.totw_count ?? 0) > 0);
}
