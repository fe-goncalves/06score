import Link from "next/link";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Match } from "@/lib/types";
import {
  formatMatchDateTime,
  isMatchFinished,
  isMatchLive,
} from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  index?: number;
}

function teamSigla(team: Match["teams_a"]): string {
  if (!team) return "—";
  return (
    team.abbreviation?.trim() ||
    team.short_name?.trim()?.slice(0, 3).toUpperCase() ||
    "—"
  );
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

export function MatchCard({ match, index = 0 }: MatchCardProps) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const showScore = finished || live;
  const { aDimmed, bDimmed } = resolveDimmed(match, finished);
  const meta = formatMatchDateTime(match.match_date, match.match_time);

  return (
    <Link href={`/jogos/${match.id}`} className="match-row-card-link">
      <article className={`match-row-card${live ? " is-live" : ""}`}>
        <p className={`match-row-card-meta${live ? " is-live" : ""}`}>
          {live ? "AO VIVO" : meta}
        </p>
        <div className="match-row-card-line">
          <span className={`match-row-sigla is-a${aDimmed ? " is-dimmed" : ""}`}>
            {teamSigla(match.teams_a)}
          </span>
          <TeamLogo
            team={match.teams_a}
            index={index * 2}
            size={28}
            className="shrink-0"
          />
          <div className="match-row-score">
            {showScore ? (
              <>
                <span className={aDimmed ? "is-dimmed" : undefined}>
                  {match.score_a ?? 0}
                </span>
                <span className="match-row-sep">:</span>
                <span className={bDimmed ? "is-dimmed" : undefined}>
                  {match.score_b ?? 0}
                </span>
              </>
            ) : (
              <span className="match-row-time">
                {match.match_time?.slice(0, 5) ?? "—"}
              </span>
            )}
          </div>
          <TeamLogo
            team={match.teams_b}
            index={index * 2 + 1}
            size={28}
            className="shrink-0"
          />
          <span className={`match-row-sigla is-b${bDimmed ? " is-dimmed" : ""}`}>
            {teamSigla(match.teams_b)}
          </span>
        </div>
      </article>
    </Link>
  );
}
