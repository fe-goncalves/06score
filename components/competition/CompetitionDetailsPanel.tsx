import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { PremiacoesSection } from "@/components/competition/PremiacoesSection";
import { isEditionClosed } from "@/lib/competition/hubTabs";
import type {
  Competition,
  CompetitionEdition,
  CompetitionEditionDetails,
  EditionAward,
  EditionTotsSquad,
  Team,
} from "@/lib/types";

interface CompetitionDetailsPanelProps {
  competition: Competition;
  currentEdition: CompetitionEdition | null;
  teamCount: number;
  matchCount: number;
  details: CompetitionEditionDetails;
  awards: EditionAward[];
  totsSquad: EditionTotsSquad | null;
  accentColor?: string | null;
}

function seasonLabel(edition: CompetitionEdition | null): string {
  if (!edition) return "—";
  const seasons = edition.seasons;
  if (Array.isArray(seasons)) return seasons[0]?.name ?? edition.custom_name ?? "—";
  return seasons?.name ?? edition.custom_name ?? "—";
}

function editionStatusLabel(edition: CompetitionEdition | null): string {
  if (!edition?.status) return "—";
  const map: Record<string, string> = {
    active: "Em andamento",
    finished: "Encerrada",
    closed: "Encerrada",
    upcoming: "Em breve",
  };
  return map[edition.status] ?? edition.status;
}

function formatCount(value: number): string {
  return value.toLocaleString("pt-BR");
}

interface SummaryStatProps {
  label: string;
  value: number;
  sub?: string;
}

function SummaryStat({ label, value, sub }: SummaryStatProps) {
  return (
    <div className="competition-details-stat">
      <span className="competition-details-stat-value">{formatCount(value)}</span>
      <span className="competition-details-stat-label">{label}</span>
      {sub && <span className="competition-details-stat-sub">{sub}</span>}
    </div>
  );
}

function TeamLogoChip({ team, size = 44 }: { team: Team; size?: number }) {
  const teamId = team.id;
  const label = team.short_name ?? team.abbreviation ?? team.full_name;
  const inner = (
    <span
      className="competition-details-logo-chip"
      title={team.full_name}
      style={{ "--logo-size": `${size}px` } as CSSProperties}
    >
      <OrgImage
        src={team.logo_url}
        alt={team.full_name}
        width={size}
        height={size}
        className="competition-details-logo-chip-img"
      />
    </span>
  );

  if (!teamId) return inner;

  return (
    <Link href={`/times/${teamId}`} className="competition-details-logo-link">
      {inner}
      <span className="sr-only">{label}</span>
    </Link>
  );
}

function LogoGrid({
  teams,
  emptyMessage,
}: {
  teams: Team[];
  emptyMessage: string;
}) {
  if (!teams.length) {
    return (
      <p className="competition-details-card-empty font-mono-label text-xs text-white/40">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="competition-details-logo-grid">
      {teams.map((team, index) => (
        <TeamLogoChip
          key={team.id ?? `${team.full_name}-${index}`}
          team={team}
        />
      ))}
    </div>
  );
}

export function CompetitionDetailsPanel({
  competition,
  currentEdition,
  teamCount,
  matchCount,
  details,
  awards,
  totsSquad,
  accentColor,
}: CompetitionDetailsPanelProps) {
  const accent = accentColor ?? "var(--color-brand)";
  const showPremiacoes =
    isEditionClosed(currentEdition?.status) &&
    (awards.length > 0 || Boolean(totsSquad));

  return (
    <div
      className="competition-details-layout"
      style={{ "--hub-accent": accent } as CSSProperties}
    >
      {showPremiacoes && (
        <PremiacoesSection
          awards={awards}
          totsSquad={totsSquad}
          accentColor={accentColor}
        />
      )}

      <section className="competition-details-section">
        <h2 className="competition-stats-section-title">Descrição</h2>

        <article className="competition-details-glass-card competition-details-overview">
          <div className="competition-details-overview-head">
            <div>
              <p className="competition-details-kicker">{competition.full_name}</p>
              {competition.short_name && (
                <p className="competition-details-overview-sub">
                  {competition.short_name}
                </p>
              )}
            </div>
            <div className="competition-details-overview-meta">
              <span>{seasonLabel(currentEdition)}</span>
              <span>{editionStatusLabel(currentEdition)}</span>
              {currentEdition?.is_current && <span>Edição atual</span>}
            </div>
          </div>

          <div className="competition-details-stats-row">
            <SummaryStat label="Equipes" value={teamCount} sub="inscritas" />
            <SummaryStat label="Partidas" value={matchCount} sub="na edição" />
            <SummaryStat label="Gols" value={details.totalGoals} />
            <SummaryStat label="Atletas" value={details.totalAthletes} sub="inscritos" />
            <SummaryStat
              label="Cartões"
              value={details.totalCards}
              sub={`${details.totalYellowCards} A · ${details.totalRedCards} V`}
            />
          </div>
        </article>
      </section>

      <div className="competition-details-cards-grid">
        <article className="competition-details-glass-card">
          <h3 className="competition-details-card-title">Estreantes</h3>
          <p className="competition-details-card-desc">
            Equipes que disputam esta competição pela primeira vez.
          </p>
          <LogoGrid
            teams={details.debutTeams}
            emptyMessage="Nenhuma estreia nesta edição."
          />
        </article>

        <article className="competition-details-glass-card competition-details-champions-split">
          <div className="competition-details-champions-col">
            <h3 className="competition-details-card-title">Campeões</h3>
            <p className="competition-details-card-desc">
              Equipes que já conquistaram o título.
            </p>
            <LogoGrid
              teams={details.pastChampions}
              emptyMessage="Nenhum campeão anterior."
            />
          </div>

          <div
            className="competition-details-champions-divider"
            aria-hidden="true"
          />

          <div className="competition-details-champions-col competition-details-champions-current">
            <h3 className="competition-details-card-title">Campeão atual</h3>
            <p className="competition-details-card-desc">
              Título da edição anterior.
            </p>
            {details.defendingChampion ? (
              <div className="competition-details-defending">
                <TeamLogoChip team={details.defendingChampion} size={56} />
              </div>
            ) : (
              <p className="competition-details-card-empty font-mono-label text-xs text-white/40">
                Sem edição anterior ou campeão definido.
              </p>
            )}
          </div>
        </article>
      </div>

      {details.phaseLeaders.length > 0 && (
        <section className="competition-details-section">
          <h2 className="competition-stats-section-title">Fases</h2>
          <ul className="competition-details-phase-grid">
            {details.phaseLeaders.map((phase) => (
              <li
                key={phase.phaseId}
                className={`competition-details-phase-card ${phase.isCurrent ? "competition-details-phase-card-current" : ""}`}
              >
                <div className="competition-details-phase-info">
                  <span className="competition-details-phase-name">
                    {phase.phaseName}
                  </span>
                  {phase.isCurrent && (
                    <span className="competition-details-phase-badge">Atual</span>
                  )}
                  {phase.team && phase.points > 0 && (
                    <span className="competition-details-phase-points">
                      {phase.points} pts
                    </span>
                  )}
                </div>
                <div className="competition-details-phase-leader">
                  {phase.team ? (
                    <TeamLogoChip team={phase.team} size={40} />
                  ) : (
                    <span
                      className="competition-details-phase-empty"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
