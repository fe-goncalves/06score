import Link from "next/link";
import { PhaseStandingsBlock } from "@/components/competition/PhaseStandingsBlock";
import { OrgImage } from "@/components/ui/OrgImage";
import { phaseLabel } from "@/lib/competition/phases";
import type { CompetitionHubData, Match } from "@/lib/types";

interface MatchCompetitionPreviewProps {
  match: Match;
  hub: CompetitionHubData | null;
}

export function MatchCompetitionPreview({
  match,
  hub,
}: MatchCompetitionPreviewProps) {
  const competition = match.phases?.competition_editions?.competitions;
  const competitionId = competition?.id;
  const accent = competition?.primary_color ?? null;

  if (!hub || !competitionId || !competition) {
    return (
      <p className="match-empty-state">
        Prévia da competição indisponível no momento.
      </p>
    );
  }

  const phase =
    hub.phases.find((p) => p.id === match.phase_id) ??
    hub.phases.find((p) => p.is_current) ??
    hub.phases[0];

  if (!phase) {
    return (
      <p className="match-empty-state">
        Prévia da competição indisponível no momento.
      </p>
    );
  }

  return (
    <div className="match-competition-preview">
      <div className="match-competition-preview-head">
        {competition.logo_url ? (
          <OrgImage
            src={competition.logo_url}
            alt={competition.full_name}
            width={44}
            height={44}
            className="match-competition-preview-logo"
          />
        ) : (
          <span className="match-competition-preview-logo-fallback" aria-hidden />
        )}
        <div className="min-w-0">
          <h3 className="match-competition-preview-title">
            {competition.short_name?.trim() || competition.full_name}
          </h3>
          <p className="match-competition-preview-sub">{phaseLabel(phase)}</p>
        </div>
      </div>

      <div className="match-competition-preview-body match-competition-preview-body--bare">
        <PhaseStandingsBlock
          phase={phase}
          matches={hub.matches}
          matchups={hub.matchups}
          rounds={hub.rounds}
          teamEditionStats={hub.teamEditionStats}
          groups={hub.groups}
          groupTeams={hub.groupTeams}
          tableMarkers={hub.tableMarkers}
          accentColor={accent}
        />
      </div>

      <Link
        href={`/competicoes/${competitionId}`}
        className="match-competition-preview-link"
        style={accent ? { borderColor: `${accent}66`, color: accent } : undefined}
      >
        Ver competição completa
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
