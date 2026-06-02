export interface TeamStatsColumnDef {
  abbr: string;
  label: string;
}

export const TEAM_STATS_COLUMNS: TeamStatsColumnDef[] = [
  { abbr: "JOG", label: "Jogos disputados" },
  { abbr: "VIT", label: "Vitórias" },
  { abbr: "EMP", label: "Empates" },
  { abbr: "DER", label: "Derrotas" },
  { abbr: "GP", label: "Gols pró" },
  { abbr: "GC", label: "Gols contra" },
  { abbr: "PTS", label: "Pontos" },
];
