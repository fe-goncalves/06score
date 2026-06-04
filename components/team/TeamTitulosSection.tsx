"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { competitionEditionHrefFromAward } from "@/lib/team/competitionEditionHref";
import { teamAwardLabel } from "@/lib/team/awardTypes";
import type { AthleteAwardEntry, Team } from "@/lib/types";

type TeamSnippet = Pick<Team, "id" | "full_name" | "short_name" | "abbreviation" | "logo_url">;

function sortAwards(rows: AthleteAwardEntry[]): AthleteAwardEntry[] {
  return [...rows].sort((a, b) => {
    const aSeason = a.competition_editions?.seasons?.name ?? "";
    const bSeason = b.competition_editions?.seasons?.name ?? "";
    return bSeason.localeCompare(aSeason, "pt-BR");
  });
}

function AwardRow({
  award,
  children,
}: {
  award: AthleteAwardEntry;
  children: ReactNode;
}) {
  const href = competitionEditionHrefFromAward(award);
  if (href) {
    return (
      <Link href={href} className="athlete-award-row athlete-award-row--link">
        {children}
      </Link>
    );
  }
  return <article className="athlete-award-row">{children}</article>;
}

function TituloRow({
  award,
  team,
}: {
  award: AthleteAwardEntry;
  team: TeamSnippet;
}) {
  const competition = award.competition_editions?.competitions;
  const competitionName =
    competition?.short_name?.trim() ||
    competition?.full_name?.trim() ||
    "Competição";
  const seasonName = award.competition_editions?.seasons?.name ?? "Temporada";

  return (
    <AwardRow award={award}>
      <div className="athlete-award-body">
        <p className="athlete-award-name">{competitionName}</p>
        <p className="athlete-award-meta">{seasonName}</p>
      </div>
      <div className="athlete-award-logos" aria-hidden>
        <OrgImage
          src={team.logo_url}
          alt=""
          width={22}
          height={22}
          className="athlete-award-logo athlete-award-logo--team"
        />
        <OrgImage
          src={competition?.logo_url}
          alt=""
          width={22}
          height={22}
          className="athlete-award-logo athlete-award-logo--comp"
        />
      </div>
    </AwardRow>
  );
}

function PodioRow({ award }: { award: AthleteAwardEntry }) {
  const competition = award.competition_editions?.competitions;
  const competitionName =
    competition?.short_name?.trim() ||
    competition?.full_name?.trim() ||
    "Competição";
  const seasonName = award.competition_editions?.seasons?.name ?? "Temporada";

  return (
    <AwardRow award={award}>
      <div className="athlete-award-body">
        <p className="athlete-award-name">{teamAwardLabel(award.award_type)}</p>
        <p className="athlete-award-meta">
          {competitionName} · {seasonName}
        </p>
      </div>
      <div className="athlete-award-logos" aria-hidden>
        <OrgImage
          src={competition?.logo_url}
          alt=""
          width={22}
          height={22}
          className="athlete-award-logo athlete-award-logo--comp"
        />
      </div>
    </AwardRow>
  );
}

interface TeamTitulosSectionProps {
  teamAwards: AthleteAwardEntry[];
  team: TeamSnippet & { id: string };
}

export function TeamTitulosSection({ teamAwards, team }: TeamTitulosSectionProps) {
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

  if (!champions.length && !podiums.length) {
    return <p className="athlete-awards-empty">Nenhum título registrado.</p>;
  }

  return (
    <div className="team-titulos-section space-y-4">
      {champions.length > 0 ? (
        <div>
          <h3 className="team-detalhes-subtitle">Campeão</h3>
          <div className="athlete-awards-list">
            {champions.map((award) => (
              <TituloRow key={award.id} award={award} team={team} />
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
    </div>
  );
}
