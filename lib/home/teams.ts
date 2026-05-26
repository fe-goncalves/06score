import type { Team } from "@/lib/types";

const FREE_AGENT_TERMS = [
  "sem clube",
  "free agent",
  "free agents",
  "sem time",
  "disponível",
  "dispensados",
  "aguardando",
];

/** Times que não devem aparecer no carrossel da home (pool / placeholder). */
export function isFreeAgentTeam(team: Team): boolean {
  const name = team.full_name?.toLowerCase() ?? "";
  const short = team.short_name?.toLowerCase() ?? "";
  const abbr = team.abbreviation?.toLowerCase() ?? "";
  return FREE_AGENT_TERMS.some(
    (term) => name.includes(term) || short.includes(term) || abbr.includes(term),
  );
}

export function filterHomeTeams(teams: Team[]): Team[] {
  return teams.filter((team) => !isFreeAgentTeam(team));
}
