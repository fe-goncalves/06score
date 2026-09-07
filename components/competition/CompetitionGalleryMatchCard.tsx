import Link from "next/link";
import type { CSSProperties } from "react";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Match } from "@/lib/types";
import {
  formatMatchDateTime,
  isMatchFinished,
  isMatchLive,
} from "@/lib/utils";

interface CompetitionGalleryMatchCardProps {
  match: Match;
  index: number;
  accentColor?: string | null;
}

function teamSigla(team: Match["teams_a"]): string {
  if (!team) return "—";
  return (
    team.abbreviation?.trim() ||
    team.short_name?.trim()?.slice(0, 3).toUpperCase() ||
    "—"
  );
}

function teamShortLabel(team: Match["teams_a"]): string {
  if (!team) return "—";
  return team.short_name?.trim() || teamSigla(team);
}

function resolveDimmed(match: Match, finished: boolean) {
  if (
    finished &&
    match.score_a != null &&
    match.score_b != null &&
    match.score_a !== match.score_b
  ) {
    return {
      aDimmed: match.score_a < match.score_b,
      bDimmed: match.score_b < match.score_a,
    };
  }
  return { aDimmed: false, bDimmed: false };
}

function TeamName({
  team,
  dimmed,
}: {
  team: Match["teams_a"];
  dimmed: boolean;
}) {
  return (
    <span
      className={`gallery-match-name${dimmed ? " gallery-match-score-dim" : ""}`}
      title={team?.full_name ?? undefined}
    >
      <span className="gallery-match-name-sigla">{teamSigla(team)}</span>
      <span className="gallery-match-name-short">{teamShortLabel(team)}</span>
    </span>
  );
}

export function CompetitionGalleryMatchCard({
  match,
  index,
  accentColor,
}: CompetitionGalleryMatchCardProps) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const showScore = finished || live;
  const accent = accentColor ?? "var(--color-brand)";
  const { aDimmed, bDimmed } = resolveDimmed(match, finished);

  return (
    <Link
      href={`/jogos/${match.id}`}
      className={`gallery-match-card${live ? " gallery-match-card-live" : ""}`}
      style={{ "--row-accent": accent } as CSSProperties}
    >
      <p className="gallery-match-meta">
        {live ? (
          <span className="gallery-match-live">Ao vivo</span>
        ) : (
          formatMatchDateTime(match.match_date, match.match_time)
        )}
      </p>

      <div className="gallery-match-line">
        <TeamName team={match.teams_a} dimmed={aDimmed} />
        <TeamLogo
          team={match.teams_a}
          index={index * 2}
          size={48}
          className="gallery-match-logo"
        />
        <div className="gallery-match-score">
          {showScore ? (
            <>
              <span className={aDimmed ? "gallery-match-score-dim" : undefined}>
                {match.score_a ?? 0}
              </span>
              <span className="gallery-match-score-sep">:</span>
              <span className={bDimmed ? "gallery-match-score-dim" : undefined}>
                {match.score_b ?? 0}
              </span>
            </>
          ) : (
            <span className="gallery-match-time">
              {match.match_time?.slice(0, 5) ?? "—"}
            </span>
          )}
        </div>
        <TeamLogo
          team={match.teams_b}
          index={index * 2 + 1}
          size={48}
          className="gallery-match-logo"
        />
        <TeamName team={match.teams_b} dimmed={bDimmed} />
      </div>
    </Link>
  );
}
