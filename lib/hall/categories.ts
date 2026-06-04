import type { HallCategory } from "@/lib/types";

export type AthleteStatKey =
  | "goals"
  | "assists"
  | "matches_played"
  | "motm_count"
  | "totw_count"
  | "motw_count"
  | "penalty_saves";

export interface AthleteStatCategoryDef {
  key: string;
  label: string;
  valueLabel: string;
  careerField: string;
  editionField: string;
  section: HallCategory["section"];
  goalkeepersOnly?: boolean;
}

export interface TeamStatCategoryDef {
  key: string;
  label: string;
  valueLabel: string;
  careerField: string;
  editionField: string;
  section: HallCategory["section"];
}

export interface HallCustomCategoryDef {
  key: string;
  label: string;
  valueLabel: string;
  section: HallCategory["section"];
}

/** Stats diretas de athlete_career_stats / athlete_edition_stats */
export const HALL_ATHLETE_STAT_CATEGORIES: AthleteStatCategoryDef[] = [
  {
    key: "goals",
    label: "Artilheiros",
    valueLabel: "Gols",
    careerField: "total_goals",
    editionField: "goals",
    section: "athletes",
  },
  {
    key: "assists",
    label: "Garçons",
    valueLabel: "Assist.",
    careerField: "total_assists",
    editionField: "assists",
    section: "athletes",
  },
  {
    key: "matches",
    label: "Mais jogos",
    valueLabel: "Jogos",
    careerField: "total_matches",
    editionField: "matches_played",
    section: "athletes",
  },
  {
    key: "motm",
    label: "Mais MOTM",
    valueLabel: "MOTM",
    careerField: "total_motm",
    editionField: "motm_count",
    section: "athletes",
  },
  {
    key: "totw",
    label: "Mais TOTW",
    valueLabel: "TOTW",
    careerField: "total_totw",
    editionField: "totw_count",
    section: "athletes",
  },
  {
    key: "motw",
    label: "Mais MOTW",
    valueLabel: "MOTW",
    careerField: "total_motw",
    editionField: "motw_count",
    section: "athletes",
  },
  {
    key: "hat_tricks",
    label: "Mais hat-tricks",
    valueLabel: "Hat-tricks",
    careerField: "total_hat_tricks",
    editionField: "hat_tricks",
    section: "athletes",
  },
  {
    key: "pokers",
    label: "Mais pokers",
    valueLabel: "Pokers",
    careerField: "total_pokers",
    editionField: "pokers",
    section: "athletes",
  },
  {
    key: "gk_penalty_saves",
    label: "Defesas de pênalti",
    valueLabel: "Defesas",
    careerField: "penalty_saves",
    editionField: "penalty_saves",
    section: "athletes",
    goalkeepersOnly: true,
  },
];

export const HALL_ATHLETE_CUSTOM_CATEGORIES: HallCustomCategoryDef[] = [
  { key: "goal_participation", label: "Participações em gol", valueLabel: "G+A", section: "athletes" },
  { key: "goals_in_match", label: "Mais gols num jogo", valueLabel: "Gols", section: "athletes" },
  { key: "athlete_titles", label: "Mais títulos", valueLabel: "Títulos", section: "athletes" },
  { key: "athlete_finals", label: "Mais finais", valueLabel: "Finais", section: "athletes" },
  { key: "athlete_awards", label: "Mais premiações", valueLabel: "Prêmios", section: "athletes" },
  { key: "penalty_rate", label: "Aproveitamento de pênaltis", valueLabel: "Aprov.", section: "athletes" },
  { key: "shootout_rate", label: "Aproveitamento de shoot-outs", valueLabel: "Aprov.", section: "athletes" },
  { key: "gk_clean_sheets", label: "Clean sheets (goleiros)", valueLabel: "CS", section: "athletes" },
  { key: "gk_shootout_saves", label: "Defesas de shoot-out", valueLabel: "Defesas", section: "athletes" },
];

export const HALL_TEAM_STAT_CATEGORIES: TeamStatCategoryDef[] = [
  {
    key: "team_titles",
    label: "Ranking de títulos",
    valueLabel: "Títulos",
    careerField: "total_titles",
    editionField: "titles",
    section: "teams",
  },
  {
    key: "team_wins",
    label: "Ranking de vitórias",
    valueLabel: "Vitórias",
    careerField: "total_wins",
    editionField: "wins",
    section: "teams",
  },
  {
    key: "team_goals",
    label: "Mais gols",
    valueLabel: "Gols",
    careerField: "total_goals_scored",
    editionField: "goals_scored",
    section: "teams",
  },
];

export const HALL_TEAM_SPECIAL_CATEGORIES: HallCustomCategoryDef[] = [
  { key: "sequencia_invicto", label: "Maior invencibilidade", valueLabel: "Jogos", section: "teams" },
  { key: "mais_cleansheets", label: "Mais clean sheets", valueLabel: "CS", section: "teams" },
  { key: "sequencia_vitorias", label: "Sequência de vitórias", valueLabel: "Seq.", section: "teams" },
  { key: "maior_goleada", label: "Maior goleada", valueLabel: "Saldo", section: "teams" },
];

/** Ordem de exibição no Hall */
export const HALL_TEAM_CATEGORY_ORDER = [
  "sequencia_invicto",
  "team_titles",
  "team_wins",
  "team_goals",
  "mais_cleansheets",
  "sequencia_vitorias",
  "maior_goleada",
];

export const HALL_ATHLETE_CATEGORY_ORDER = [
  "goals",
  "goals_in_match",
  "assists",
  "goal_participation",
  "hat_tricks",
  "pokers",
  "matches",
  "athlete_finals",
  "athlete_titles",
  "athlete_awards",
  "totw",
  "motm",
  "motw",
  "penalty_rate",
  "shootout_rate",
  "gk_clean_sheets",
  "gk_penalty_saves",
  "gk_shootout_saves",
];

export function sortHallCategories<T extends { key: string }>(
  categories: T[],
  order: string[],
): T[] {
  const rank = new Map(order.map((key, index) => [key, index]));
  return [...categories].sort(
    (a, b) => (rank.get(a.key) ?? 999) - (rank.get(b.key) ?? 999),
  );
}
