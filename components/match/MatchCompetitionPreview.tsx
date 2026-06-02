import Link from "next/link";
import { StandingsTable } from "@/components/competition/StandingsTable";
import { OrgImage } from "@/components/ui/OrgImage";
import { markersForPhase } from "@/lib/competition/tableMarkers";
import type { CompetitionHubData, Match, Phase } from "@/lib/types";
import {
  computeStandingsFromMatches,
  formatMatchPhaseRoundLabel,
} from "@/lib/utils";

interface MatchCompetitionPreviewProps {
  match: Match;
  hub: CompetitionHubData | null;
}

function standingsForPhase(
  hub: CompetitionHubData,
  phase: Phase,
) {
  const phaseMatches = hub.matches.filter((m) => m.phase_id === phase.id);
  const teamIds = [
    ...new Set(
      phaseMatches.flatMap((m) => [m.team_a_id, m.team_b_id].filter(Boolean)),
    ),
  ] as string[];
  const teamsMap: Record<string, NonNullable<typeof hub.editionTeams[0]["teams"]>> =
    {};
  for (const et of hub.editionTeams) {
    if (et.team_id && et.teams) teamsMap[et.team_id] = et.teams;
  }

  return computeStandingsFromMatches(
    phaseMatches,
    teamIds,
    teamsMap,
    hub.teamEditionStats,
  );
}

export function MatchCompetitionPreview({
  match,
  hub,
}: MatchCompetitionPreviewProps) {
  const competition = match.phases?.competition_editions?.competitions;
  const competitionId = competition?.id;
  const phaseId = match.phase_id;
  const accent = competition?.primary_color ?? null;

  if (!hub || !competitionId) {
    return (
      <p className="match-empty-state">
        Prévia da competição indisponível no momento.
      </p>
    );
  }

  const phase =
    hub.phases.find((p) => p.id === phaseId) ??
    hub.phases.find((p) => p.is_current) ??
    hub.phases[0];

  const rows = phase ? standingsForPhase(hub, phase) : [];
  const markers = phase ? markersForPhase(hub.tableMarkers, phase.id) : [];
  const phaseLabel = phase
    ? (phase.custom_label ?? phase.full_name)
    : formatMatchPhaseRoundLabel(match);

  return (
    <div className="match-competition-preview">
      <div className="match-competition-preview-head">
        {competition.logo_url && (
          <OrgImage
            src={competition.logo_url}
            alt={competition.full_name}
            width={48}
            height={48}
            className="match-competition-preview-logo"
          />
        )}
        <div className="min-w-0">
          <h3 className="match-competition-preview-title">{competition.full_name}</h3>
          <p className="match-competition-preview-sub">{phaseLabel}</p>
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="match-competition-preview-table">
          <StandingsTable
            rows={rows}
            embedded
            maxRows={6}
            markers={markers}
            accentColor={accent}
            defaultView="summary"
          />
        </div>
      ) : (
        <p className="match-empty-state match-empty-state--sub">
          Classificação ainda não disponível para esta fase.
        </p>
      )}

      <Link
        href={`/competicoes/${competitionId}`}
        className="match-competition-preview-link"
      >
        Ver competição completa
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
