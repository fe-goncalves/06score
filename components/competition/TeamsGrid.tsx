import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { unwrapTeamRelation } from "@/lib/data/shared";
import type { EditionTeam, Team } from "@/lib/types";

interface TeamsGridProps {
  editionTeams: EditionTeam[];
}

function resolveTeam(et: EditionTeam): Team | null {
  return unwrapTeamRelation(et.teams as Team | Team[] | null) ?? null;
}

interface TeamStatProps {
  label: string;
  value: number;
  accent: string;
}

function TeamStat({ label, value, accent }: TeamStatProps) {
  return (
    <div className="competition-team-stat">
      <span
        className="competition-team-stat-value"
        style={{ color: accent }}
      >
        {value}
      </span>
      <span className="competition-team-stat-label">{label}</span>
    </div>
  );
}

export function TeamsGrid({ editionTeams }: TeamsGridProps) {
  const rows = editionTeams
    .map((et) => ({ et, team: resolveTeam(et) }))
    .filter((row): row is { et: EditionTeam; team: Team } => row.team != null);

  if (!rows.length) {
    return (
      <p className="font-mono-label text-xs text-white/40">
        Nenhuma equipe inscrita.
      </p>
    );
  }

  return (
    <div className="competition-teams-grid">
      {rows.map(({ et, team }, index) => {
        const teamId = et.team_id;
        const accent = team.primary_color ?? "var(--color-brand)";
        const label = team.short_name ?? team.abbreviation ?? team.full_name;

        return (
          <Link
            key={et.id}
            href={`/times/${teamId}`}
            className="competition-team-vertical-card group"
            style={
              {
                "--team-color": accent,
                "--card-index": index,
              } as CSSProperties
            }
          >
            <div className="competition-team-vertical-inner">
              <div className="competition-team-logo-stage">
                <span className="competition-team-logo-glow" aria-hidden="true" />
                <OrgImage
                  src={team.logo_url}
                  alt={team.full_name}
                  width={72}
                  height={72}
                  className="competition-team-logo-img h-[4.5rem] w-[4.5rem] object-contain"
                />
              </div>

              <h3 className="competition-team-vertical-name">{label}</h3>

              <div className="competition-team-stats">
                <TeamStat
                  label="Part."
                  value={et.competition_participations ?? 0}
                  accent={accent}
                />
                <TeamStat
                  label="Títulos"
                  value={et.competition_titles ?? 0}
                  accent={accent}
                />
                <TeamStat
                  label="Vitórias"
                  value={et.competition_wins ?? 0}
                  accent={accent}
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
