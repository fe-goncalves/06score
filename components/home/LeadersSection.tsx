import { HighlightStatCard } from "@/components/home/HighlightStatCard";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { AthleteStatLeader, TeamStatLeader } from "@/lib/types";

interface LeadersSectionProps {
  topScorer: AthleteStatLeader | null;
  topAssister: AthleteStatLeader | null;
  topTeamByTitles: TeamStatLeader | null;
  competitionColor?: string | null;
  isOrganizationScope?: boolean;
}

function teamDisplayName(team: TeamStatLeader["teams"]): string {
  if (!team) return "";
  return team.short_name ?? team.full_name;
}

function athleteSurnameOrName(
  athlete: AthleteStatLeader["athletes"] | null | undefined,
): string {
  if (!athlete) return "";
  return athlete.surname?.trim() || athlete.full_name;
}

export function LeadersSection({
  topScorer,
  topAssister,
  topTeamByTitles,
  competitionColor,
  isOrganizationScope = false,
}: LeadersSectionProps) {
  const scorerAthlete = topScorer?.athletes;
  const assisterAthlete = topAssister?.athletes;
  const titleTeam = topTeamByTitles?.teams;
  const titleMode = topTeamByTitles?.mode;
  const titleStat =
    titleMode === "wins"
      ? (topTeamByTitles?.wins ?? 0)
      : (topTeamByTitles?.titles ?? 0);
  const titleSubtitle =
    topTeamByTitles?.label ??
    (isOrganizationScope ? "Títulos na organização" : "Títulos na competição");

  return (
    <SectionEnter className="py-6 md:py-8">
      <div className="destaques-grid page-container">
        <HighlightStatCard
          label="Artilheiro"
          stat={topScorer?.goals ?? 0}
          name={athleteSurnameOrName(scorerAthlete)}
          emptyMessage="Sem artilheiro nesta competição."
          subtitle={topScorer?.teams?.short_name ?? topScorer?.teams?.full_name ?? null}
          teamName={topScorer?.teams?.short_name ?? topScorer?.teams?.full_name ?? null}
          teamLogoUrl={topScorer?.teams?.logo_url}
          imageUrl={scorerAthlete?.photo_url}
          href={scorerAthlete?.id ? `/atletas/${scorerAthlete.id}` : undefined}
          accentColor={competitionColor}
          watermark="GOL"
        />
        <HighlightStatCard
          label="Assistências"
          stat={topAssister?.assists ?? 0}
          name={athleteSurnameOrName(assisterAthlete)}
          emptyMessage="Sem assistências nesta competição."
          subtitle={
            topAssister?.teams?.short_name ??
            topAssister?.teams?.full_name ??
            null
          }
          teamName={
            topAssister?.teams?.short_name ??
            topAssister?.teams?.full_name ??
            null
          }
          teamLogoUrl={topAssister?.teams?.logo_url}
          imageUrl={assisterAthlete?.photo_url}
          href={
            assisterAthlete?.id ? `/atletas/${assisterAthlete.id}` : undefined
          }
          accentColor={competitionColor}
          watermark="ASS"
        />
        <HighlightStatCard
          label="Títulos"
          stat={titleStat}
          name={teamDisplayName(titleTeam)}
          emptyMessage="Sem títulos nesta competição."
          subtitle={titleSubtitle}
          subtitleTone={titleMode === "wins" ? "muted" : "default"}
          imageUrl={titleTeam?.logo_url}
          href={titleTeam?.id ? `/times/${titleTeam.id}` : undefined}
          accentColor={competitionColor ?? titleTeam?.primary_color}
          watermark="TIT"
        />
      </div>
    </SectionEnter>
  );
}
