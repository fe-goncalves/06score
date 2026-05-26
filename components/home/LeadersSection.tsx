import { HighlightStatCard } from "@/components/home/HighlightStatCard";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { AthleteStatLeader, TeamStatLeader } from "@/lib/types";
import { athleteDisplayName } from "@/lib/utils";

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

export function LeadersSection({
  topScorer,
  topAssister,
  topTeamByTitles,
  competitionColor,
  isOrganizationScope = false,
}: LeadersSectionProps) {
  const hasAny = topScorer?.athletes || topAssister?.athletes || topTeamByTitles?.teams;

  if (!hasAny) return null;

  const scorerAthlete = topScorer?.athletes;
  const assisterAthlete = topAssister?.athletes;
  const titleTeam = topTeamByTitles?.teams;
  const titleStat =
    topTeamByTitles?.titles ??
    topTeamByTitles?.wins ??
    topTeamByTitles?.points ??
    0;

  return (
    <SectionEnter className="py-6 md:py-8">
      <div className="destaques-grid page-container">
        <HighlightStatCard
          label="Artilheiro"
          stat={topScorer?.goals ?? 0}
          name={
            scorerAthlete
              ? athleteDisplayName(
                  scorerAthlete.full_name,
                  scorerAthlete.surname,
                )
              : ""
          }
          subtitle={
            topScorer?.teams?.short_name ?? topScorer?.teams?.full_name ?? null
          }
          imageUrl={scorerAthlete?.photo_url}
          href={scorerAthlete?.id ? `/atletas/${scorerAthlete.id}` : undefined}
          accentColor={competitionColor}
          watermark="GOL"
        />
        <HighlightStatCard
          label="Assistências"
          stat={topAssister?.assists ?? 0}
          name={
            assisterAthlete
              ? athleteDisplayName(
                  assisterAthlete.full_name,
                  assisterAthlete.surname,
                )
              : ""
          }
          subtitle={
            topAssister?.teams?.short_name ??
            topAssister?.teams?.full_name ??
            null
          }
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
          subtitle={
            topTeamByTitles?.titles != null &&
            topTeamByTitles.wins == null &&
            topTeamByTitles.titles > 0
              ? isOrganizationScope
                ? "Campeã da organização"
                : "Campeã da competição"
              : "Histórico de vitórias"
          }
          imageUrl={titleTeam?.logo_url}
          href={titleTeam?.id ? `/times/${titleTeam.id}` : undefined}
          accentColor={competitionColor ?? titleTeam?.primary_color}
          watermark="TIT"
        />
      </div>
    </SectionEnter>
  );
}
