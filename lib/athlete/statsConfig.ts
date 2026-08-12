import type { HubProfileKind } from "@/lib/types";
import type { MatchIconName } from "@/components/match/icons/MatchIcon";

export type { HubProfileKind };

export type StatsColumnKey =
  | "matches_played"
  | "wins"
  | "draws"
  | "losses"
  | "goals"
  | "assists"
  | "yellow_cards"
  | "red_cards"
  | "motm_count"
  | "penalties"
  | "shootouts"
  | "avg_rating";

export interface StatsColumnDef {
  abbr: string;
  label: string;
  key: StatsColumnKey;
  /** Ícone oficial (`arq/svg`) no cabeçalho / legenda. */
  icon?: MatchIconName;
}

export const ATHLETE_STATS_COLUMNS: StatsColumnDef[] = [
  {
    abbr: "JOG",
    label: "Jogos disputados",
    key: "matches_played",
    icon: "stadium",
  },
  { abbr: "VIT", label: "Vitórias", key: "wins" },
  { abbr: "EMP", label: "Empates", key: "draws" },
  { abbr: "DER", label: "Derrotas", key: "losses" },
  { abbr: "GOL", label: "Gols", key: "goals", icon: "ballGoal" },
  { abbr: "AST", label: "Assistências", key: "assists", icon: "assist" },
  {
    abbr: "AMA",
    label: "Cartões amarelos",
    key: "yellow_cards",
    icon: "yellowCard",
  },
  {
    abbr: "VER",
    label: "Cartões vermelhos",
    key: "red_cards",
    icon: "redCard",
  },
  { abbr: "MOTM", label: "Melhor em campo", key: "motm_count", icon: "star" },
  { abbr: "NOTA", label: "Nota média", key: "avg_rating" },
];

export const STAFF_STATS_COLUMNS: StatsColumnDef[] = [
  {
    abbr: "JOG",
    label: "Jogos",
    key: "matches_played",
    icon: "stadium",
  },
  { abbr: "VIT", label: "Vitórias", key: "wins" },
  { abbr: "EMP", label: "Empates", key: "draws" },
  { abbr: "DER", label: "Derrotas", key: "losses" },
  {
    abbr: "AMA",
    label: "Cartões amarelos",
    key: "yellow_cards",
    icon: "yellowCard",
  },
  {
    abbr: "VER",
    label: "Cartões vermelhos",
    key: "red_cards",
    icon: "redCard",
  },
  { abbr: "NOTA", label: "Nota média", key: "avg_rating" },
];

export function statsColumnsForKind(kind: HubProfileKind): StatsColumnDef[] {
  return kind === "staff" ? STAFF_STATS_COLUMNS : ATHLETE_STATS_COLUMNS;
}
