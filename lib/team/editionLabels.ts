import type { TeamEditionStatRow } from "@/lib/types";

export function teamEditionEnrollmentPrimary(row: TeamEditionStatRow): string {
  const comp = row.competition_editions?.competitions;
  return comp?.short_name?.trim() || comp?.full_name?.trim() || "Competição";
}

export function teamEditionEnrollmentSecondary(row: TeamEditionStatRow): string {
  const season = row.competition_editions?.seasons?.name?.trim();
  return season ? `${season}.` : "Edição.";
}

/** @deprecated Prefer `teamEditionEnrollmentPrimary` + `teamEditionEnrollmentSecondary`. */
export function teamEditionEnrollmentLabel(row: TeamEditionStatRow): string {
  return `${teamEditionEnrollmentSecondary(row).replace(/\.$/, "")}, ${teamEditionEnrollmentPrimary(row)}`;
}

export function formatEditionTablePosition(position: number | null | undefined): string {
  if (position == null || !Number.isFinite(position)) return "—";
  return `${position}º`;
}
