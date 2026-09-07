import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import type {
  CompetitionEditionDetails,
  EditionTeam,
  PastChampionEntry,
  Team,
} from "@/lib/types";

interface CompetitionDetailsPanelProps {
  teamCount: number;
  matchCount: number;
  details: CompetitionEditionDetails;
  editionTeams: EditionTeam[];
  accentColor?: string | null;
}

function formatCount(value: number): string {
  return value.toLocaleString("pt-BR");
}

function unwrapTeam(et: EditionTeam): Team | null {
  const teams = et.teams;
  if (!teams) return null;
  return Array.isArray(teams) ? (teams[0] ?? null) : teams;
}

function RookieBadge() {
  return (
    <span className="competition-details-rookie" title="Estreante" aria-label="Estreante">
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
        <path
          d="M8 1.5l1.8 3.65 4.03.59-2.92 2.84.69 4.02L8 10.7l-3.6 1.9.69-4.02L2.17 5.74l4.03-.59L8 1.5z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function CrownBadge() {
  return (
    <span
      className="competition-details-crown"
      title="Campeão atual"
      aria-label="Campeão atual"
    >
      <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden>
        <path
          d="M2 11.5l1.5-6L6.2 8 8 3.5 9.8 8l2.7-2.5 1.5 6H2zm0 1.5h12v1.2H2V13z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="competition-details-stat">
      <span className="competition-details-stat-value">{formatCount(value)}</span>
      <span className="competition-details-stat-label">{label}</span>
    </div>
  );
}

function TeamLogoPlain({
  team,
  size = 52,
  title,
  badge,
}: {
  team: Team;
  size?: number;
  title?: string;
  badge?: "rookie" | "crown" | null;
}) {
  const tip = title ?? team.full_name;
  const inner = (
    <span
      className="competition-details-logo-plain"
      title={tip}
      style={{ "--logo-size": `${size}px` } as CSSProperties}
    >
      <OrgImage
        src={team.logo_url}
        alt={team.full_name}
        width={size}
        height={size}
        className="competition-details-logo-plain-img"
      />
      {badge === "rookie" ? <RookieBadge /> : null}
      {badge === "crown" ? <CrownBadge /> : null}
    </span>
  );

  if (!team.id) return inner;

  return (
    <Link href={`/times/${team.id}`} className="competition-details-logo-link">
      {inner}
      <span className="sr-only">{team.short_name ?? team.full_name}</span>
    </Link>
  );
}

export function CompetitionDetailsPanel({
  teamCount,
  matchCount,
  details,
  editionTeams,
  accentColor,
}: CompetitionDetailsPanelProps) {
  const accent = accentColor ?? "var(--color-brand)";
  const debutIds = new Set(
    details.debutTeams.map((t) => t.id).filter(Boolean) as string[],
  );
  const defendingId = details.defendingChampion?.id ?? null;

  const participating = editionTeams
    .map(unwrapTeam)
    .filter((team): team is Team => team != null);

  return (
    <div
      className="competition-details-layout competition-details-layout--v2"
      style={{ "--hub-accent": accent } as CSSProperties}
    >
      <section className="competition-details-section">
        <h2 className="competition-stats-section-title">
          Stats da edição atual
        </h2>

        <div className="competition-details-stats-row">
          <SummaryStat label="Equipes" value={teamCount} />
          <SummaryStat label="Partidas" value={matchCount} />
          <SummaryStat label="Gols" value={details.totalGoals} />
          <SummaryStat label="Atletas" value={details.totalAthletes} />
          <SummaryStat label="Cartões" value={details.totalCards} />
        </div>

        {participating.length > 0 ? (
          <div className="competition-details-teams-carousel" aria-label="Equipes da edição">
            {participating.map((team, index) => (
              <TeamLogoPlain
                key={team.id ?? `${team.full_name}-${index}`}
                team={team}
                size={56}
                badge={debutIds.has(team.id ?? "") ? "rookie" : null}
              />
            ))}
          </div>
        ) : (
          <p className="competition-details-card-empty font-mono-label text-xs text-white/40">
            Nenhuma equipe inscrita.
          </p>
        )}
      </section>

      <section className="competition-details-section">
        <h2 className="competition-stats-section-title">Histórico</h2>

        {details.pastChampions.length ? (
          <ul className="competition-details-history">
            {details.pastChampions.map((entry: PastChampionEntry) => {
              const isDefending =
                defendingId != null && entry.team.id === defendingId;
              const tip =
                entry.titleCount > 1
                  ? `${entry.editionLabel} · ${entry.titleCount} títulos`
                  : entry.editionLabel;
              return (
                <li
                  key={`${entry.editionId}-${entry.team.id}`}
                  className="competition-details-history-item"
                >
                  <TeamLogoPlain
                    team={entry.team}
                    size={64}
                    title={tip}
                    badge={isDefending ? "crown" : null}
                  />
                  {entry.titleCount > 1 ? (
                    <span className="competition-details-history-count">
                      {entry.titleCount}×
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="competition-details-card-empty font-mono-label text-xs text-white/40">
            Nenhum campeão anterior.
          </p>
        )}
      </section>
    </div>
  );
}
