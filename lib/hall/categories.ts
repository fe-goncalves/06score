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

// Categorias que mapeiam diretamente para campos de athlete_edition_stats / athlete_career_stats
export const ATHLETE_CATEGORIES: CategoryDef[] = [
  { key: "goals",         label: "Artilheiro",         field: "goals",         section: "athletes", descending: true },
  { key: "assists",       label: "Assistências",        field: "assists",       section: "athletes", descending: true },
  { key: "motm",          label: "MOTM",                field: "motm_count",    section: "athletes", descending: true },
  { key: "totw",          label: "Seleção da Rodada",   field: "totw_count",    section: "athletes", descending: true },
  { key: "yellow_cards",  label: "Cartões Amarelos",    field: "yellow_cards",  section: "athletes", descending: true },
  { key: "red_cards",     label: "Cartões Vermelhos",   field: "red_cards",     section: "athletes", descending: true },
  { key: "matches",       label: "Partidas",            field: "matches_played",section: "athletes", descending: true },
];

// Categorias que mapeiam diretamente para campos de team_edition_stats / team_career_stats
export const TEAM_CATEGORIES: CategoryDef[] = [
  { key: "team_wins",    label: "Vitórias",    field: "wins",          section: "teams", descending: true },
  { key: "team_goals",   label: "Gols",        field: "goals_scored",  section: "teams", descending: true },
  { key: "team_matches", label: "Partidas",    field: "matches_played",section: "teams", descending: true },
  { key: "team_points",  label: "Pontos",      field: "points",        section: "teams", descending: true },
];

// ─── Categorias especiais de achievements de atletas ─────────────────────────
// Não mapeiam para colunas diretas — são calculadas via athlete_match_achievements.

export type AchievementType =
  | "hat_trick"
  | "poker"
  | "manita"
  | "goal_and_assist";

export interface AchievementCategoryDef {
  key: string;
  label: string;
  achievementType: AchievementType;
  section: HallCategory["section"];
}

export const ATHLETE_ACHIEVEMENT_CATEGORIES: AchievementCategoryDef[] = [
  { key: "hat_tricks",            label: "Hat-tricks",          achievementType: "hat_trick",     section: "athletes" },
  { key: "pokers",                label: "Pokers",              achievementType: "poker",         section: "athletes" },
  { key: "manitas",               label: "Manitas",             achievementType: "manita",        section: "athletes" },
  { key: "participacoes_diretas", label: "Participações Diretas",achievementType: "goal_and_assist",section: "athletes" },
];

// ─── Categorias especiais de equipes ─────────────────────────────────────────
// São calculadas via views ou queries customizadas — não mapeiam para colunas diretas.

export type TeamSpecialCategoryKey =
  | "sequencia_vitorias"
  | "sequencia_invicto"
  | "maior_goleada"
  | "mais_cleansheets";

export interface TeamSpecialCategoryDef {
  key: TeamSpecialCategoryKey;
  label: string;
  section: HallCategory["section"];
}

export const TEAM_SPECIAL_CATEGORIES: TeamSpecialCategoryDef[] = [
  { key: "sequencia_vitorias", label: "Sequência de Vitórias",  section: "teams" },
  { key: "sequencia_invicto",  label: "Maior Invencibilidade",  section: "teams" },
  { key: "maior_goleada",      label: "Maior Goleada",          section: "teams" },
  { key: "mais_cleansheets",   label: "Mais Cleansheets",       section: "teams" },
];