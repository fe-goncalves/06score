"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { competitionEditionDisplayName } from "@/lib/competition/editionDisplayName";
import { competitionEditionHrefFromAward } from "@/lib/team/competitionEditionHref";
import { teamAwardLabel } from "@/lib/team/awardTypes";
import type { AthleteAwardEntry, Team, TeamEditionStatRow } from "@/lib/types";

type TeamSnippet = Pick<
  Team,
  "id" | "full_name" | "short_name" | "abbreviation" | "logo_url"
>;

function sortAwards(rows: AthleteAwardEntry[]): AthleteAwardEntry[] {
  return [...rows].sort((a, b) => {
    const aName = competitionEditionDisplayName(a.competition_editions);
    const bName = competitionEditionDisplayName(b.competition_editions);
    return bName.localeCompare(aName, "pt-BR");
  });
}

function PodioRow({ award }: { award: AthleteAwardEntry }) {
  const competition = award.competition_editions?.competitions;
  const competitionName =
    competition?.short_name?.trim() ||
    competition?.full_name?.trim() ||
    "Competição";
  const editionName = competitionEditionDisplayName(award.competition_editions);
  const href = competitionEditionHrefFromAward(award);
  const body = (
    <>
      <div className="athlete-award-body">
        <p className="athlete-award-name">{teamAwardLabel(award.award_type)}</p>
        <p className="athlete-award-meta">
          {competitionName} · {editionName}
        </p>
      </div>
      <div className="athlete-award-logos" aria-hidden>
        <OrgImage
          src={competition?.logo_url}
          alt=""
          width={28}
          height={28}
          className="athlete-award-logo athlete-award-logo--comp"
        />
      </div>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="athlete-award-row athlete-award-row--link">
        {body}
      </Link>
    );
  }
  return <article className="athlete-award-row">{body}</article>;
}

function ChampionCard({
  award,
  onOpen,
}: {
  award: AthleteAwardEntry;
  onOpen: () => void;
}) {
  const competition = award.competition_editions?.competitions;
  const shortName =
    competition?.short_name?.trim() ||
    competition?.full_name?.trim() ||
    "Competição";
  const editionName = competitionEditionDisplayName(award.competition_editions);

  return (
    <button type="button" className="team-champion-card" onClick={onOpen}>
      <OrgImage
        src={competition?.logo_url}
        alt=""
        width={72}
        height={72}
        className="team-champion-card-logo"
      />
      <span className="team-champion-card-text">
        <span className="team-champion-card-badge">Campeão</span>
        <span className="team-champion-card-name">{shortName}</span>
        <span className="team-champion-card-edition">{editionName}</span>
      </span>
    </button>
  );
}

function ChampionModal({
  award,
  stats,
  onClose,
}: {
  award: AthleteAwardEntry;
  stats: TeamEditionStatRow | null;
  onClose: () => void;
}) {
  const competition = award.competition_editions?.competitions;
  const shortName =
    competition?.short_name?.trim() ||
    competition?.full_name?.trim() ||
    "Competição";
  const editionName = competitionEditionDisplayName(award.competition_editions);
  const href = competitionEditionHrefFromAward(award);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const rows: { label: string; value: ReactNode }[] = stats
    ? [
        { label: "Jogos", value: stats.matches_played },
        { label: "Vitórias", value: stats.wins },
        { label: "Empates", value: stats.draws },
        { label: "Derrotas", value: stats.losses },
        {
          label: "Gols",
          value: `${stats.goals_scored}:${stats.goals_conceded}`,
        },
        { label: "Pontos", value: stats.points ?? "—" },
      ]
    : [];

  return (
    <div className="team-champion-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="team-champion-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${shortName} ${editionName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="team-champion-modal-close" onClick={onClose}>
          Fechar
        </button>
        <div className="team-champion-modal-head">
          <OrgImage
            src={competition?.logo_url}
            alt=""
            width={88}
            height={88}
            className="team-champion-modal-logo"
          />
          <div>
            <p className="team-champion-card-badge">Campeão</p>
            <h3 className="team-champion-modal-title">{shortName}</h3>
            <p className="team-champion-modal-edition">{editionName}</p>
          </div>
        </div>
        {rows.length ? (
          <dl className="team-champion-modal-stats">
            {rows.map((row) => (
              <div key={row.label} className="team-champion-modal-stat">
                <dt>{row.label}</dt>
                <dd className="tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="athlete-awards-empty">Sem estatísticas desta edição.</p>
        )}
        {href ? (
          <Link href={href} className="team-champion-modal-link">
            Ver competição →
          </Link>
        ) : null}
      </div>
    </div>
  );
}

interface TeamTitulosSectionProps {
  teamAwards: AthleteAwardEntry[];
  team: TeamSnippet & { id: string };
  editionStats?: TeamEditionStatRow[];
}

export function TeamTitulosSection({
  teamAwards,
  team: _team,
  editionStats = [],
}: TeamTitulosSectionProps) {
  const champions = useMemo(
    () => sortAwards(teamAwards.filter((row) => row.award_type === "champion")),
    [teamAwards],
  );
  const podiums = useMemo(
    () =>
      sortAwards(
        teamAwards.filter((row) =>
          ["runner_up", "third_place"].includes(row.award_type),
        ),
      ),
    [teamAwards],
  );
  const [openAwardId, setOpenAwardId] = useState<string | null>(null);
  const openAward = champions.find((a) => a.id === openAwardId) ?? null;
  const openStats =
    openAward != null
      ? (editionStats.find((s) => s.edition_id === openAward.edition_id) ?? null)
      : null;

  if (!champions.length && !podiums.length) {
    return <p className="athlete-awards-empty">Nenhum título registrado.</p>;
  }

  return (
    <div className="team-titulos-section space-y-4">
      {champions.length > 0 ? (
        <div>
          <h3 className="team-detalhes-subtitle">Campeão</h3>
          <div className="team-champion-grid">
            {champions.map((award) => (
              <ChampionCard
                key={award.id}
                award={award}
                onOpen={() => setOpenAwardId(award.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {podiums.length > 0 ? (
        <div>
          <h3 className="team-detalhes-subtitle">Vice e terceiro lugar</h3>
          <div className="athlete-awards-list">
            {podiums.map((award) => (
              <PodioRow key={award.id} award={award} />
            ))}
          </div>
        </div>
      ) : null}

      {openAward ? (
        <ChampionModal
          award={openAward}
          stats={openStats}
          onClose={() => setOpenAwardId(null)}
        />
      ) : null}
    </div>
  );
}
