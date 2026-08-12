"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { nationalityFlagEmoji } from "@/lib/athlete/athleteHeaderFormat";
import { competitionEditionDisplayName } from "@/lib/competition/editionDisplayName";
import type {
  AthleteAwardEntry,
  AthleteCareerStats,
  AthleteEditionStatRow,
  StaffCareerStats,
  Team,
} from "@/lib/types";
import { getPositionName } from "@/lib/utils";

export type ResumoStatItem = {
  label: string;
  value: string | number;
};

type StintLike = {
  id: string;
  team_id?: string;
  started_at?: string | null;
  ended_at?: string | null;
  is_current?: boolean;
  teams?: (Pick<Team, "id" | "logo_url" | "full_name" | "short_name"> &
    Partial<Team>) | null;
};

type GalleryTeam = {
  id: string;
  logoUrl: string | null;
  name: string;
};

interface AthleteResumoTabProps {
  stints: StintLike[];
  nationality?: string | null;
  birthDate?: string | null;
  roleLabel?: string | null;
  roleTitle?: string;
  accent: string;
  stats: ResumoStatItem[];
  teamAwards?: AthleteAwardEntry[];
  awards?: AthleteAwardEntry[];
}

function sortStintsNewestFirst(stints: StintLike[]): StintLike[] {
  return [...stints].sort((a, b) => {
    if (a.is_current !== b.is_current) return a.is_current ? -1 : 1;
    const aEnd = a.ended_at ?? "";
    const bEnd = b.ended_at ?? "";
    if (aEnd !== bEnd) return bEnd.localeCompare(aEnd);
    return (b.started_at ?? "").localeCompare(a.started_at ?? "");
  });
}

function uniqueGalleryTeams(stints: StintLike[]): GalleryTeam[] {
  const seen = new Set<string>();
  const out: GalleryTeam[] = [];
  for (const stint of sortStintsNewestFirst(stints)) {
    const teamId = stint.team_id || stint.teams?.id || stint.id;
    if (!teamId || seen.has(teamId)) continue;
    const team = stint.teams;
    const name =
      team?.short_name?.trim() ||
      team?.full_name?.trim() ||
      "Time";
    seen.add(teamId);
    out.push({
      id: teamId,
      logoUrl: team?.logo_url ?? null,
      name,
    });
  }
  return out;
}

function birthYearOnly(birthDate: string | null | undefined): string | null {
  if (!birthDate) return null;
  const d = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return String(d.getFullYear());
}

function awardLabel(value: string): string {
  const map: Record<string, string> = {
    mvp: "MVP",
    top_scorer: "Artilheiro",
    top_assists: "Líder de assistências",
    best_goalkeeper: "Melhor goleiro",
    revelation: "Revelação",
    champion: "Campeão",
    runner_up: "Vice-campeão",
    third_place: "Terceiro lugar",
  };
  return map[value] ?? value;
}

function editionName(award: AthleteAwardEntry): string {
  return competitionEditionDisplayName(award.competition_editions);
}

function competitionLogo(award: AthleteAwardEntry): string | null {
  return award.competition_editions?.competitions?.logo_url ?? null;
}

function InfoCard({
  label,
  children,
}: {
  label?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="athlete-resumo-info-card">
      {label ? <p className="athlete-resumo-info-label">{label}</p> : null}
      {children}
    </div>
  );
}

function TeamsGalleryModal({
  teams,
  onClose,
}: {
  teams: GalleryTeam[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="athlete-resumo-teams-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="athlete-resumo-teams-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="athlete-resumo-teams-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="athlete-resumo-teams-modal-head">
          <h3
            id="athlete-resumo-teams-modal-title"
            className="athlete-resumo-teams-modal-title"
          >
            Times
          </h3>
          <button
            type="button"
            className="athlete-resumo-teams-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>
        <ul className="athlete-resumo-teams-modal-list">
          {teams.map((team) => (
            <li key={team.id}>
              <Link
                href={`/times/${team.id}`}
                className="athlete-resumo-teams-modal-row"
                onClick={onClose}
              >
                {team.logoUrl ? (
                  <OrgImage
                    src={team.logoUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="athlete-resumo-teams-modal-logo"
                  />
                ) : (
                  <span className="athlete-resumo-teams-modal-logo athlete-resumo-teams-modal-logo--ph" />
                )}
                <span className="athlete-resumo-teams-modal-name">{team.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AthleteResumoTab({
  stints,
  nationality,
  birthDate,
  roleLabel,
  roleTitle = "Posição",
  accent,
  stats,
  teamAwards = [],
  awards = [],
}: AthleteResumoTabProps) {
  const teams = useMemo(() => uniqueGalleryTeams(stints), [stints]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const flag = nationalityFlagEmoji(nationality);
  const birthYear = birthYearOnly(birthDate);

  const titles = useMemo(
    () =>
      [...teamAwards]
        .filter((a) => a.award_type === "champion")
        .sort((a, b) =>
          (b.competition_editions?.seasons?.name ?? "").localeCompare(
            a.competition_editions?.seasons?.name ?? "",
            "pt-BR",
          ),
        ),
    [teamAwards],
  );

  const premiacoes = useMemo(
    () =>
      [...awards].sort((a, b) =>
        (b.competition_editions?.seasons?.name ?? "").localeCompare(
          a.competition_editions?.seasons?.name ?? "",
          "pt-BR",
        ),
      ),
    [awards],
  );

  const hasHonors = titles.length > 0 || premiacoes.length > 0;

  return (
    <div className="athlete-resumo-tab">
      {teams.length > 0 ? (
        <button
          type="button"
          className="athlete-resumo-gallery"
          style={{ borderColor: `${accent}44` }}
          onClick={() => setGalleryOpen(true)}
          aria-label="Ver todos os times"
        >
          {teams.map((item) =>
            item.logoUrl ? (
              <OrgImage
                key={item.id}
                src={item.logoUrl}
                alt=""
                width={40}
                height={40}
                className="athlete-resumo-gallery-logo"
              />
            ) : (
              <span
                key={item.id}
                className="athlete-resumo-gallery-logo athlete-resumo-gallery-logo--ph"
                aria-hidden
              />
            ),
          )}
        </button>
      ) : null}

      {galleryOpen ? (
        <TeamsGalleryModal teams={teams} onClose={() => setGalleryOpen(false)} />
      ) : null}

      <div className="athlete-resumo-info-row">
        <InfoCard label="Nacionalidade">
          <p className="athlete-resumo-info-value">
            {flag ? <span aria-hidden>{flag} </span> : null}
            {nationality?.trim() || "—"}
          </p>
        </InfoCard>
        <InfoCard label="Nascimento">
          <p className="athlete-resumo-info-value athlete-resumo-stat-value">
            {birthYear || "—"}
          </p>
        </InfoCard>
        <InfoCard label={roleTitle}>
          <p className="athlete-resumo-info-value">{roleLabel?.trim() || "—"}</p>
        </InfoCard>
      </div>

      {stats.length > 0 ? (
        <div className="athlete-resumo-stats">
          {stats.map((item) => (
            <div key={item.label} className="athlete-resumo-stat">
              <span className="athlete-resumo-stat-value tabular-nums">
                {item.value}
              </span>
              <span className="athlete-resumo-stat-label">{item.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {hasHonors ? (
        <section className="athlete-resumo-honors">
          {titles.length > 0 ? (
            <div className="athlete-resumo-honors-block">
              <h2 className="athlete-resumo-matches-title">Títulos</h2>
              <ul className="athlete-resumo-honors-list">
                {titles.map((award) => (
                  <li key={award.id} className="athlete-resumo-honor-row">
                    <OrgImage
                      src={competitionLogo(award)}
                      alt=""
                      width={28}
                      height={28}
                      className="athlete-resumo-honor-logo"
                    />
                    <span className="athlete-resumo-honor-label">
                      {editionName(award)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {premiacoes.length > 0 ? (
            <div className="athlete-resumo-honors-block">
              <h2 className="athlete-resumo-matches-title">Premiações</h2>
              <ul className="athlete-resumo-honors-list">
                {premiacoes.map((award) => (
                  <li key={award.id} className="athlete-resumo-honor-row">
                    <OrgImage
                      src={competitionLogo(award)}
                      alt=""
                      width={28}
                      height={28}
                      className="athlete-resumo-honor-logo"
                    />
                    <div className="athlete-resumo-honor-text">
                      <span className="athlete-resumo-honor-label">
                        {editionName(award)}
                      </span>
                      <span className="athlete-resumo-honor-meta">
                        {awardLabel(award.award_type)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export function buildAthleteResumoStats(
  careerStats: AthleteCareerStats | null,
  editionStats: AthleteEditionStatRow[],
  fallback?: {
    matches?: number;
    goals?: number;
    assists?: number;
  },
): ResumoStatItem[] {
  const competitions = new Set(
    editionStats.map((r) => r.edition_id).filter(Boolean),
  ).size;
  return [
    {
      label: "JOGOS",
      value: careerStats?.total_matches ?? fallback?.matches ?? 0,
    },
    { label: "COMPETIÇÕES", value: competitions },
    {
      label: "GOLS",
      value: careerStats?.total_goals ?? fallback?.goals ?? 0,
    },
    {
      label: "ASSISTÊNCIAS",
      value: careerStats?.total_assists ?? fallback?.assists ?? 0,
    },
    { label: "MOTM", value: careerStats?.total_motm ?? 0 },
  ];
}

export function buildStaffResumoStats(
  careerStats: StaffCareerStats | null,
  fallbackMatches = 0,
): ResumoStatItem[] {
  return [
    {
      label: "JOGOS",
      value: careerStats?.total_matches ?? fallbackMatches,
    },
    { label: "VITÓRIAS", value: careerStats?.total_wins ?? 0 },
    { label: "EMPATES", value: careerStats?.total_draws ?? 0 },
    { label: "DERROTAS", value: careerStats?.total_losses ?? 0 },
  ];
}

export function athleteRoleFromProfile(
  playerPositions: Parameters<typeof getPositionName>[0],
): string | null {
  const name = getPositionName(playerPositions);
  return name === "—" ? null : name;
}
