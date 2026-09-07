import type { MatchIconName } from "@/components/match/icons/MatchIcon";

export interface TeamStatsColumnDef {
  abbr: string;
  label: string;
  sortKey: TeamCompetitionStatSortKey;
  /** Ícone oficial (`arq/svg`) no cabeçalho / legenda. */
  icon?: MatchIconName;
}

export type TeamCompetitionStatSortKey =
  | "matches_played"
  | "wins"
  | "draws"
  | "losses"
  | "goals_scored"
  | "goals_conceded"
  | "goal_difference"
  | "yellow_cards"
  | "red_cards";

export const TEAM_STATS_COLUMNS: TeamStatsColumnDef[] = [
  { abbr: "JOG", label: "Jogos disputados", sortKey: "matches_played", icon: "stadium" },
  { abbr: "VIT", label: "Vitórias", sortKey: "wins" },
  { abbr: "EMP", label: "Empates", sortKey: "draws" },
  { abbr: "DER", label: "Derrotas", sortKey: "losses" },
  { abbr: "GP", label: "Gols pró", sortKey: "goals_scored", icon: "ballGoal" },
  { abbr: "GC", label: "Gols contra", sortKey: "goals_conceded", icon: "ball" },
  { abbr: "SG", label: "Saldo de gols", sortKey: "goal_difference" },
  { abbr: "AMA", label: "Cartões amarelos", sortKey: "yellow_cards", icon: "yellowCard" },
  { abbr: "VER", label: "Cartões vermelhos", sortKey: "red_cards", icon: "redCard" },
];

export type TeamAthleteStatSortKey =
  | "matches_played"
  | "goals"
  | "assists"
  | "yellow_cards"
  | "red_cards"
  | "motm_count"
  | "captain_matches"
  | "wins"
  | "penalties_taken"
  | "shootouts_taken";

export interface TeamAthleteStatsColumnDef {
  abbr: string;
  label: string;
  sortKey: TeamAthleteStatSortKey;
  /** Oculta na tabela e na legenda em viewports mobile. */
  mobileHidden?: boolean;
}

export const TEAM_ATHLETE_STATS_COLUMNS: TeamAthleteStatsColumnDef[] = [
  { abbr: "JOG", label: "Jogos disputados", sortKey: "matches_played" },
  { abbr: "GOL", label: "Gols", sortKey: "goals" },
  { abbr: "AST", label: "Assistências", sortKey: "assists" },
  { abbr: "AMA", label: "Cartões amarelos", sortKey: "yellow_cards" },
  { abbr: "VER", label: "Cartões vermelhos", sortKey: "red_cards" },
  { abbr: "MOTM", label: "Melhor em campo", sortKey: "motm_count", mobileHidden: true },
  { abbr: "CAP", label: "Jogos como capitão", sortKey: "captain_matches", mobileHidden: true },
  { abbr: "VIT", label: "Vitórias", sortKey: "wins" },
  { abbr: "PEN", label: "Pênaltis cobrados", sortKey: "penalties_taken", mobileHidden: true },
  { abbr: "SHO", label: "Shoot-outs cobrados", sortKey: "shootouts_taken", mobileHidden: true },
];

export const TEAM_ATHLETE_STATS_PAGE_SIZE = 20;
