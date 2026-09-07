import Link from "next/link";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Match } from "@/lib/types";
import { formatMatchStripDate, isMatchFinished, isMatchLive } from "@/lib/utils";

interface MatchStripCellProps {
  match: Match;
  index: number;
}

function teamSigla(team: Match["teams_a"]): string {
  if (!team) return "—";
  return (
    team.abbreviation?.trim() ||
    team.short_name?.trim()?.slice(0, 3).toUpperCase() ||
    team.full_name?.slice(0, 3).toUpperCase() ||
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

export function MatchStripCell({ match, index }: MatchStripCellProps) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const showScore = finished || live;
  const { aDimmed, bDimmed } = resolveDimmed(match, finished);

  return (
    <Link
      href={`/jogos/${match.id}`}
      className={`match-strip-cell${live ? " match-strip-cell-live" : ""}`}
    >
      <div className="match-strip-cell-inner">
        <span
          className={`match-strip-sigla match-strip-sigla-a${aDimmed ? " is-dimmed" : ""}`}
        >
          {teamSigla(match.teams_a)}
        </span>
        <TeamLogo
          team={match.teams_a}
          index={index * 2}
          size={28}
          className="match-strip-logo shrink-0"
        />

        <div className="match-strip-center">
          {showScore ? (
            <span
              className={`match-strip-score tabular-nums${live ? " is-live" : ""}`}
            >
              <span className={aDimmed ? "is-dimmed" : undefined}>
                {match.score_a ?? 0}
              </span>
              <span className="match-strip-score-sep">:</span>
              <span className={bDimmed ? "is-dimmed" : undefined}>
                {match.score_b ?? 0}
              </span>
            </span>
          ) : (
            <span className="match-strip-score match-strip-score-date">
              {formatMatchStripDate(match.match_date)}
            </span>
          )}
          {live ? <span className="match-strip-live">LIVE</span> : null}
        </div>

        <TeamLogo
          team={match.teams_b}
          index={index * 2 + 1}
          size={28}
          className="match-strip-logo shrink-0"
        />
        <span
          className={`match-strip-sigla match-strip-sigla-b${bDimmed ? " is-dimmed" : ""}`}
        >
          {teamSigla(match.teams_b)}
        </span>
      </div>
    </Link>
  );
}
