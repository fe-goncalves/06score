"use client";

import { useMemo } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { unwrapTeamRelation } from "@/lib/data/shared";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type { AthleteAwardEntry, Team, TeamProfileData } from "@/lib/types";

function awardLabel(value: string): string {
  const map: Record<string, string> = {
    champion: "Campeão",
    runner_up: "Vice-campeão",
    third_place: "Terceiro lugar",
  };
  return map[value] ?? value;
}

type AwardsFilter = "titulos" | "premiacoes";
type TeamSnippet = Pick<Team, "id" | "full_name" | "short_name" | "abbreviation" | "logo_url">;

interface TeamInfoTabProps {
  profile: TeamProfileData;
}

export function TeamInfoTab({ profile }: TeamInfoTabProps) {
  const { tab: awardsFilter, setTab: setAwardsFilter } = useClientTab(
    "titulos",
    "awardsView",
  );
  const awardsView: AwardsFilter =
    awardsFilter === "premiacoes" ? "premiacoes" : "titulos";

  const visibleAwards = useMemo(() => {
    const list =
      awardsView === "titulos"
        ? profile.teamAwards.filter((a) => a.award_type === "champion")
        : profile.teamAwards.filter((a) => a.award_type !== "champion");
    return [...list].sort((a, b) => {
      const aSeason = a.competition_editions?.seasons?.name ?? "";
      const bSeason = b.competition_editions?.seasons?.name ?? "";
      return bSeason.localeCompare(aSeason, "pt-BR");
    });
  }, [awardsView, profile.teamAwards]);

  const summary = profile.careerSummary;

  const careerStats = [
    { label: "Jogos", value: summary.matches },
    { label: "Vitórias", value: summary.wins },
    { label: "Empates", value: summary.draws },
    { label: "Derrotas", value: summary.losses },
    { label: "Gols pró", value: summary.goals_scored },
    { label: "Gols contra", value: summary.goals_conceded },
    { label: "Pontos", value: summary.points },
    { label: "Títulos", value: summary.titles },
  ];

  return (
    <div className="athlete-info-tab space-y-4">
      <section className="athlete-section athlete-career-stats-wrap">
        <div className="athlete-career-stats athlete-career-stats--team">
          {careerStats.map(({ label, value }) => (
            <div key={label} className="athlete-career-stat">
              <p className="athlete-career-stat-value">{value}</p>
              <p className="athlete-career-stat-label">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="athlete-section athlete-awards-section">
        <div className="athlete-awards-head">
          <div
            className="athlete-awards-switch"
            role="tablist"
            aria-label="Filtrar títulos ou pódios"
          >
            <button
              type="button"
              role="tab"
              aria-selected={awardsView === "titulos"}
              className={`athlete-awards-switch-btn ${awardsView === "titulos" ? "athlete-awards-switch-btn--active" : ""}`}
              onClick={() => setAwardsFilter("titulos")}
            >
              Títulos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={awardsView === "premiacoes"}
              className={`athlete-awards-switch-btn ${awardsView === "premiacoes" ? "athlete-awards-switch-btn--active" : ""}`}
              onClick={() => setAwardsFilter("premiacoes")}
            >
              Pódios
            </button>
          </div>
        </div>

        <div className="athlete-awards-list">
          {visibleAwards.length === 0 ? (
            <p className="athlete-awards-empty">
              {awardsView === "titulos"
                ? "Nenhum título registrado."
                : "Nenhum pódio registrado."}
            </p>
          ) : (
            visibleAwards.map((award) => (
              <TeamAwardRow
                key={award.id}
                award={award}
                team={profile.team}
                titleMode={awardsView === "titulos" ? "competition" : "award"}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function TeamAwardRow({
  award,
  team,
  titleMode = "award",
}: {
  award: AthleteAwardEntry;
  team: TeamSnippet;
  titleMode?: "award" | "competition";
}) {
  const competition = award.competition_editions?.competitions;
  const competitionName =
    competition?.short_name?.trim() ||
    competition?.full_name?.trim() ||
    "Competição";
  const seasonName = award.competition_editions?.seasons?.name ?? "Temporada";
  const winningTeam =
    unwrapTeamRelation(
      award.teams as TeamSnippet | TeamSnippet[] | null | undefined,
    ) ?? team;

  const title =
    titleMode === "competition" ? competitionName : awardLabel(award.award_type);
  const meta =
    titleMode === "competition"
      ? seasonName
      : `${competitionName} • ${seasonName}`;

  const teamLogo = winningTeam?.logo_url ? (
    <OrgImage
      src={winningTeam.logo_url}
      alt=""
      width={22}
      height={22}
      className="athlete-award-logo athlete-award-logo--team"
    />
  ) : (
    <span className="athlete-award-logo athlete-award-logo--ph" />
  );
  const competitionLogo = competition?.logo_url ? (
    <OrgImage
      src={competition.logo_url}
      alt=""
      width={22}
      height={22}
      className="athlete-award-logo athlete-award-logo--comp"
    />
  ) : (
    <span className="athlete-award-logo athlete-award-logo--ph" />
  );

  return (
    <article className="athlete-award-row">
      <div className="athlete-award-body">
        <p className="athlete-award-name">{title}</p>
        <p className="athlete-award-meta">{meta}</p>
      </div>
      <div className="athlete-award-logos" aria-hidden>
        {titleMode === "competition" ? (
          <>
            {teamLogo}
            {competitionLogo}
          </>
        ) : (
          <>
            {competitionLogo}
            {teamLogo}
          </>
        )}
      </div>
    </article>
  );
}
