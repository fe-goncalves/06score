"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { StatsHighlightCard } from "@/components/competition/StatsHighlightCard";
import {
  StatsLeaderModal,
  StatsLeaderModalRow,
} from "@/components/competition/StatsLeaderModal";
import { StatsTotwGallery } from "@/components/competition/StatsTotwGallery";
import { OrgImage } from "@/components/ui/OrgImage";
import {
  athleteLeaderValue,
  athleteSurname,
  buildBestDefenseTeams,
  buildTeamLeaders,
  filterAthleteLeaders,
  teamLeaderValue,
  teamShortName,
  type AthleteLeaderValueKey,
  type TeamLeaderValueKey,
} from "@/lib/competition/statsHelpers";
import type {
  AthleteStatLeader,
  TeamEditionStats,
  TotwGalleryEntry,
} from "@/lib/types";

type ModalState =
  | {
      kind: "athlete";
      title: string;
      valueKey: AthleteLeaderValueKey;
      leaders: AthleteStatLeader[];
    }
  | {
      kind: "team";
      title: string;
      valueKey: TeamLeaderValueKey;
      teams: TeamEditionStats[];
      ascending?: boolean;
      sub?: (row: TeamEditionStats) => string;
    }
  | null;

interface EditionStatsLeadersProps {
  topScorers: AthleteStatLeader[];
  topAssisters: AthleteStatLeader[];
  topYellowCards: AthleteStatLeader[];
  topMotm: AthleteStatLeader[];
  topRedCards: AthleteStatLeader[];
  topTotwSelections: AthleteStatLeader[];
  teamEditionStats: TeamEditionStats[];
  totwGallery: TotwGalleryEntry[];
  accentColor?: string | null;
}

function athleteRows(
  leaders: AthleteStatLeader[],
  valueKey: AthleteLeaderValueKey,
) {
  return filterAthleteLeaders(leaders, valueKey).map((row, index) => {
    const athlete = row.athletes;
    const team = row.teams;
    return {
      key: `${valueKey}-${athlete?.id ?? index}`,
      href: athlete?.id ? `/atletas/${athlete.id}` : undefined,
      rank: index + 1,
      name: athleteSurname(athlete),
      value: athleteLeaderValue(row, valueKey),
      photoUrl: athlete?.photo_url,
      photoAlt: athleteSurname(athlete),
      teamLogoUrl: team?.logo_url,
      teamAlt: team?.short_name ?? team?.full_name ?? "Time",
    };
  });
}

function teamRows(
  teams: TeamEditionStats[],
  valueKey: TeamLeaderValueKey,
  sub?: (row: TeamEditionStats) => string,
) {
  return teams.map((row, index) => {
    const team = row.teams;
    return {
      key: `${valueKey}-${row.team_id}`,
      href: team?.id ? `/times/${team.id}` : undefined,
      rank: index + 1,
      name: teamShortName(team),
      value: teamLeaderValue(row, valueKey),
      photoUrl: team?.logo_url,
      photoAlt: teamShortName(team),
      sub: sub?.(row),
      isTeam: true,
    };
  });
}

export function EditionStatsLeaders({
  topScorers,
  topAssisters,
  topYellowCards,
  topMotm,
  topRedCards,
  topTotwSelections,
  teamEditionStats,
  totwGallery,
  accentColor,
}: EditionStatsLeadersProps) {
  const [modal, setModal] = useState<ModalState>(null);
  const accent = accentColor ?? "var(--color-brand)";

  const bestDefense = useMemo(
    () => buildBestDefenseTeams(teamEditionStats),
    [teamEditionStats],
  );
  const topWins = useMemo(
    () => buildTeamLeaders(teamEditionStats, "wins"),
    [teamEditionStats],
  );
  const topPoints = useMemo(
    () => buildTeamLeaders(teamEditionStats, "points"),
    [teamEditionStats],
  );
  const topGoals = useMemo(
    () => buildTeamLeaders(teamEditionStats, "goals_scored"),
    [teamEditionStats],
  );

  const athleteCategories: {
    title: string;
    valueKey: AthleteLeaderValueKey;
    leaders: AthleteStatLeader[];
  }[] = [
    { title: "Artilharia", valueKey: "goals", leaders: topScorers },
    { title: "Assistências", valueKey: "assists", leaders: topAssisters },
    { title: "MOTM", valueKey: "motm_count", leaders: topMotm },
    {
      title: "Cartões amarelos",
      valueKey: "yellow_cards",
      leaders: topYellowCards,
    },
    {
      title: "Cartões vermelhos",
      valueKey: "red_cards",
      leaders: topRedCards,
    },
    {
      title: "Seleções TOTW",
      valueKey: "totw_count",
      leaders: topTotwSelections,
    },
  ];

  function renderModalContent() {
    if (!modal) return null;

    if (modal.kind === "athlete") {
      const rows = filterAthleteLeaders(modal.leaders, modal.valueKey);
      return (
        <ol className="stats-leader-modal-list">
          {rows.map((row, index) => {
            const athlete = row.athletes;
            const team = row.teams;
            if (!athlete) return null;
            return (
              <li key={`modal-${modal.valueKey}-${athlete.id ?? index}`}>
                <StatsLeaderModalRow
                  href={athlete.id ? `/atletas/${athlete.id}` : undefined}
                  rank={index + 1}
                  isTop={index === 0}
                  name={athleteSurname(athlete)}
                  value={athleteLeaderValue(row, modal.valueKey)}
                  teamLogo={team?.logo_url}
                  teamAlt={team?.short_name ?? team?.full_name ?? "Time"}
                  photo={
                    <OrgImage
                      src={athlete.photo_url}
                      alt={athleteSurname(athlete)}
                      width={36}
                      height={36}
                      className="competition-leader-photo"
                    />
                  }
                />
              </li>
            );
          })}
        </ol>
      );
    }

    if (modal.kind === "team") {
      const rows = modal.ascending
        ? buildTeamLeaders(modal.teams, modal.valueKey, true)
        : buildTeamLeaders(modal.teams, modal.valueKey);
      return (
        <ol className="stats-leader-modal-list">
          {rows.map((row, index) => {
            const team = row.teams;
            if (!team) return null;
            return (
              <li key={`modal-team-${row.team_id}`}>
                <StatsLeaderModalRow
                  href={team.id ? `/times/${team.id}` : undefined}
                  rank={index + 1}
                  isTop={index === 0}
                  name={teamShortName(team)}
                  value={teamLeaderValue(row, modal.valueKey)}
                  sub={modal.sub?.(row)}
                  photo={
                    <OrgImage
                      src={team.logo_url}
                      alt={teamShortName(team)}
                      width={36}
                      height={36}
                      className="competition-leader-team-logo-lg"
                    />
                  }
                />
              </li>
            );
          })}
        </ol>
      );
    }

    return null;
  }

  return (
    <div
      className="competition-stats-layout"
      style={{ "--stats-accent": accent } as CSSProperties}
    >
      <section className="competition-stats-section">
        <h2 className="competition-stats-section-title">Individuais</h2>
        <div className="competition-stats-section-1">
          <div className="competition-stats-cards">
            {athleteCategories.map((cat) => (
              <StatsHighlightCard
                key={cat.valueKey}
                title={cat.title}
                accentColor={accentColor}
                rows={athleteRows(cat.leaders, cat.valueKey)}
                onVerMais={() =>
                  setModal({
                    kind: "athlete",
                    title: cat.title,
                    valueKey: cat.valueKey,
                    leaders: cat.leaders,
                  })
                }
              />
            ))}
          </div>
          <aside className="competition-stats-totw-aside">
            <StatsTotwGallery
              entries={totwGallery}
              accentColor={accentColor}
            />
          </aside>
        </div>
      </section>

      <section className="competition-stats-section">
        <h2 className="competition-stats-section-title">Equipes</h2>
        <div className="competition-stats-section-2">
          <StatsHighlightCard
            title="Defesa menos vazada"
            accentColor={accentColor}
            rows={teamRows(bestDefense, "goals_conceded", (row) =>
              `${row.matches_played} J · ${row.goals_conceded} GC`,
            )}
            onVerMais={() =>
              setModal({
                kind: "team",
                title: "Defesa menos vazada",
                valueKey: "goals_conceded",
                teams: teamEditionStats,
                ascending: true,
                sub: (row) => `${row.matches_played} J · ${row.goals_conceded} GC`,
              })
            }
          />
          <StatsHighlightCard
            title="Vitórias"
            accentColor={accentColor}
            rows={teamRows(topWins, "wins", (row) =>
              `${row.matches_played} J · ${row.points} PTS`,
            )}
            onVerMais={() =>
              setModal({
                kind: "team",
                title: "Vitórias",
                valueKey: "wins",
                teams: teamEditionStats,
                sub: (row) => `${row.matches_played} J · ${row.points} PTS`,
              })
            }
          />
          <StatsHighlightCard
            title="Pontos"
            accentColor={accentColor}
            rows={teamRows(topPoints, "points", (row) =>
              `${row.wins} V · ${row.matches_played} J`,
            )}
            onVerMais={() =>
              setModal({
                kind: "team",
                title: "Pontos",
                valueKey: "points",
                teams: teamEditionStats,
                sub: (row) => `${row.wins} V · ${row.matches_played} J`,
              })
            }
          />
          <StatsHighlightCard
            title="Gols marcados"
            accentColor={accentColor}
            rows={teamRows(topGoals, "goals_scored", (row) =>
              `${row.matches_played} J`,
            )}
            onVerMais={() =>
              setModal({
                kind: "team",
                title: "Gols marcados",
                valueKey: "goals_scored",
                teams: teamEditionStats,
                sub: (row) => `${row.matches_played} J`,
              })
            }
          />
        </div>
      </section>

      {modal && (
        <StatsLeaderModal
          title={modal.title}
          accentColor={accentColor}
          totwGallery={totwGallery}
          onClose={() => setModal(null)}
        >
          {renderModalContent()}
        </StatsLeaderModal>
      )}
    </div>
  );
}
