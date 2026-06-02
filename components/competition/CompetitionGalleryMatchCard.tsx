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
  return team.abbreviation ?? "—";
}

export function CompetitionGalleryMatchCard({
  match,
  index,
  accentColor,
}: CompetitionGalleryMatchCardProps) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const accent = accentColor ?? "var(--color-brand)";

  const scoreA = match.score_a ?? 0;
  const scoreB = match.score_b ?? 0;
  const teamALoses = finished && scoreA < scoreB;
  const teamBLoses = finished && scoreB < scoreA;

  return (
    <Link
      href={`/jogos/${match.id}`}
      className={`gallery-match-card ${live ? "gallery-match-card-live" : ""}`}
      style={{ "--row-accent": accent } as CSSProperties}
    >
      <p className="gallery-match-meta">
        {formatMatchDateTime(match.match_date, match.match_time)}
        {live && <span className="gallery-match-live"> · Ao vivo</span>}
      </p>

      <div className="gallery-match-line">
        <span className="gallery-match-name" title={match.teams_a?.full_name}>
          {teamSigla(match.teams_a)}
        </span>
        <TeamLogo team={match.teams_a} index={index * 2} size={40} className="gallery-match-logo" />
        <div className="gallery-match-score">
          {finished || live ? (
            <>
              <span className={teamALoses ? "gallery-match-score-dim" : undefined}>
                {scoreA}
              </span>
              <span className="gallery-match-score-sep">:</span>
              <span className={teamBLoses ? "gallery-match-score-dim" : undefined}>
                {scoreB}
              </span>
            </>
          ) : (
            <span className="gallery-match-time">
              {match.match_time?.slice(0, 5) ?? "—"}
            </span>
          )}
        </div>
        <TeamLogo team={match.teams_b} index={index * 2 + 1} size={40} className="gallery-match-logo" />
        <span className="gallery-match-name" title={match.teams_b?.full_name}>
          {teamSigla(match.teams_b)}
        </span>
      </div>
    </Link>
  );
}
