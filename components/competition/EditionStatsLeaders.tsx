"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { StatsHighlightCard } from "@/components/competition/StatsHighlightCard";
import {
  StatsLeaderModal,
  StatsLeaderModalRow,
  useStatsModalFilters,
} from "@/components/competition/StatsLeaderModal";
import { OrgImage } from "@/components/ui/OrgImage";
import {
  athleteLeaderValue,
  athleteSurname,
  filterAthleteLeaders,
  type AthleteLeaderValueKey,
} from "@/lib/competition/statsHelpers";
import type { AthleteStatLeader, Phase, PlayerPosition } from "@/lib/types";

type ModalState = {
  title: string;
  valueKey: AthleteLeaderValueKey;
  leaders: AthleteStatLeader[];
} | null;

interface EditionStatsLeadersProps {
  topScorers: AthleteStatLeader[];
  topAssisters: AthleteStatLeader[];
  topYellowCards: AthleteStatLeader[];
  topMotm: AthleteStatLeader[];
  topRedCards: AthleteStatLeader[];
  phases: Phase[];
  accentColor?: string | null;
}

function unwrapPosition(
  positions: PlayerPosition | PlayerPosition[] | null | undefined,
): PlayerPosition | null {
  if (!positions) return null;
  return Array.isArray(positions) ? (positions[0] ?? null) : positions;
}

function athleteNickname(athlete: AthleteStatLeader["athletes"]): string {
  if (!athlete) return "—";
  return (
    athlete.surname?.trim() ||
    athlete.full_name?.split(" ").pop()?.trim() ||
    athlete.full_name
  );
}

function athletePositionId(athlete: AthleteStatLeader["athletes"]): string | null {
  const pos = unwrapPosition(athlete?.player_positions);
  return pos?.abbreviation?.trim() || pos?.full_name?.trim() || null;
}

function athletePositionLabel(athlete: AthleteStatLeader["athletes"]): string | null {
  const pos = unwrapPosition(athlete?.player_positions);
  return pos?.full_name?.trim() || pos?.abbreviation?.trim() || null;
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
      name: athleteSurname(athlete),
      nickname: athleteNickname(athlete),
      value: athleteLeaderValue(row, valueKey),
      photoUrl: athlete?.photo_url,
      photoAlt: athleteSurname(athlete),
      teamLogoUrl: team?.logo_url,
      teamAlt: team?.short_name ?? team?.full_name ?? "Time",
      teamId: team?.id ?? null,
      positionId: athletePositionId(athlete),
    };
  });
}

export function EditionStatsLeaders({
  topScorers,
  topAssisters,
  topYellowCards,
  topMotm,
  topRedCards,
  phases,
  accentColor,
}: EditionStatsLeadersProps) {
  const [modal, setModal] = useState<ModalState>(null);
  const filters = useStatsModalFilters();
  const accent = accentColor ?? "var(--color-brand)";

  const athleteCategories: {
    title: string;
    valueKey: AthleteLeaderValueKey;
    leaders: AthleteStatLeader[];
  }[] = [
    { title: "Artilharia", valueKey: "goals", leaders: topScorers },
    { title: "Assistências", valueKey: "assists", leaders: topAssisters },
    { title: "MOTM", valueKey: "motm_count", leaders: topMotm },
    {
      title: "Amarelos",
      valueKey: "yellow_cards",
      leaders: topYellowCards,
    },
    {
      title: "Vermelhos",
      valueKey: "red_cards",
      leaders: topRedCards,
    },
  ];

  const teamOptions = useMemo(() => {
    if (!modal) return [];
    const map = new Map<string, { label: string; logoUrl: string | null }>();
    for (const row of filterAthleteLeaders(modal.leaders, modal.valueKey)) {
      const team = row.teams;
      if (team?.id) {
        map.set(team.id, {
          label: team.short_name?.trim() || team.full_name || "Equipe",
          logoUrl: team.logo_url ?? null,
        });
      }
    }
    return [...map.entries()]
      .map(([id, meta]) => ({
        id,
        label: meta.label,
        logoUrl: meta.logoUrl,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [modal]);

  const positionOptions = useMemo(() => {
    if (!modal) return [];
    const map = new Map<string, string>();
    for (const row of filterAthleteLeaders(modal.leaders, modal.valueKey)) {
      const id = athletePositionId(row.athletes);
      const label = athletePositionLabel(row.athletes);
      if (id && label) map.set(id, label);
    }
    return [...map.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [modal]);

  const filteredModalRows = useMemo(() => {
    if (!modal) return [];
    return filterAthleteLeaders(modal.leaders, modal.valueKey).filter((row) => {
      if (filters.teamFilter !== "all" && row.teams?.id !== filters.teamFilter) {
        return false;
      }
      if (filters.positionFilter !== "all") {
        const pos = athletePositionId(row.athletes);
        if (pos !== filters.positionFilter) return false;
      }
      // Fase: stats são de edição; filtro visual preparado (sem stats por fase ainda).
      if (filters.phaseFilter !== "all") {
        return true;
      }
      return true;
    });
  }, [modal, filters.teamFilter, filters.positionFilter, filters.phaseFilter]);

  function openModal(next: ModalState) {
    filters.reset();
    setModal(next);
  }

  return (
    <div
      className="competition-stats-layout competition-stats-layout--individual"
      style={{ "--stats-accent": accent } as CSSProperties}
    >
      <div className="competition-stats-cards competition-stats-cards--awards">
        {athleteCategories.map((cat) => (
          <StatsHighlightCard
            key={cat.valueKey}
            title={cat.title}
            accentColor={accentColor}
            rows={athleteRows(cat.leaders, cat.valueKey)}
            onOpen={() =>
              openModal({
                title: cat.title,
                valueKey: cat.valueKey,
                leaders: cat.leaders,
              })
            }
          />
        ))}
      </div>

      {modal && (
        <StatsLeaderModal
          title={modal.title}
          accentColor={accentColor}
          onClose={() => setModal(null)}
          teamOptions={teamOptions}
          positionOptions={positionOptions}
          phases={phases}
          teamFilter={filters.teamFilter}
          positionFilter={filters.positionFilter}
          phaseFilter={filters.phaseFilter}
          onTeamFilter={filters.setTeamFilter}
          onPositionFilter={filters.setPositionFilter}
          onPhaseFilter={filters.setPhaseFilter}
        >
          <ol className="stats-leader-modal-list">
            {filteredModalRows.map((row, index) => {
              const athlete = row.athletes;
              const team = row.teams;
              if (!athlete) return null;
              return (
                <li key={`modal-${modal.valueKey}-${athlete.id ?? index}`}>
                  <StatsLeaderModalRow
                    href={athlete.id ? `/atletas/${athlete.id}` : undefined}
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
          {!filteredModalRows.length ? (
            <p className="font-mono-label text-xs text-white/40 px-2 py-4">
              Nenhum atleta com estes filtros.
            </p>
          ) : null}
        </StatsLeaderModal>
      )}
    </div>
  );
}
