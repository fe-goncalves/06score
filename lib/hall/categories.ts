import type { HallCategory } from "@/lib/types";

export type StatField =
  | "goals"
  | "assists"
  | "motm_count"
  | "totw_count"
  | "yellow_cards"
  | "red_cards"
  | "penalty_saves"
  | "avg_rating"
  | "matches_played"
  | "wins"
  | "goals_scored"
  | "points";

export interface CategoryDef {
  key: string;
  label: string;
  field: StatField;
  section: HallCategory["section"];
  descending: boolean;
}

export const ATHLETE_CATEGORIES: CategoryDef[] = [
  { key: "goals",         label: "Artilheiro",         field: "goals",         section: "athletes", descending: true },
  { key: "assists",       label: "Assistências",        field: "assists",       section: "athletes", descending: true },
  { key: "motm",          label: "MOTM",                field: "motm_count",    section: "athletes", descending: true },
  { key: "totw",          label: "Seleção da Rodada",   field: "totw_count",    section: "athletes", descending: true },
  { key: "yellow_cards",  label: "Cartões Amarelos",    field: "yellow_cards",  section: "athletes", descending: true },
  { key: "red_cards",     label: "Cartões Vermelhos",   field: "red_cards",     section: "athletes", descending: true },
  { key: "matches",       label: "Partidas",            field: "matches_played",section: "athletes", descending: true },
];

export const TEAM_CATEGORIES: CategoryDef[] = [
  { key: "team_wins",    label: "Vitórias",    field: "wins",          section: "teams", descending: true },
  { key: "team_goals",   label: "Gols",        field: "goals_scored",  section: "teams", descending: true },
  { key: "team_matches", label: "Partidas",    field: "matches_played",section: "teams", descending: true },
  { key: "team_points",  label: "Pontos",      field: "points",        section: "teams", descending: true },
];