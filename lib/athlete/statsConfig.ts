import type { HubProfileKind } from "@/lib/types";

export type { HubProfileKind };

export interface StatsColumnDef {
  abbr: string;
  label: string;
}

export const ATHLETE_STATS_COLUMNS: StatsColumnDef[] = [
  { abbr: "JOG", label: "Jogos disputados" },
  { abbr: "GOL", label: "Gols" },
  { abbr: "AST", label: "Assistências" },
  { abbr: "AMA", label: "Cartões amarelos" },
  { abbr: "VER", label: "Cartões vermelhos" },
  { abbr: "MOTM", label: "Melhor em campo" },
  { abbr: "NOTA", label: "Nota média" },
];

export const STAFF_STATS_COLUMNS: StatsColumnDef[] = [
  { abbr: "JOG", label: "Jogos" },
  { abbr: "VIT", label: "Vitórias" },
  { abbr: "EMP", label: "Empates" },
  { abbr: "DER", label: "Derrotas" },
  { abbr: "AMA", label: "Cartões amarelos" },
  { abbr: "VER", label: "Cartões vermelhos" },
  { abbr: "NOTA", label: "Nota média" },
];

export function statsColumnsForKind(kind: HubProfileKind): StatsColumnDef[] {
  return kind === "staff" ? STAFF_STATS_COLUMNS : ATHLETE_STATS_COLUMNS;
}
