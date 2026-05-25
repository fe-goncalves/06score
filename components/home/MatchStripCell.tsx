import Link from "next/link";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Match } from "@/lib/types";
import { isMatchFinished, isMatchLive } from "@/lib/utils";

interface MatchStripCellProps {
  match: Match;
  index: number;
}

export function MatchStripCell({ match, index }: MatchStripCellProps) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const teamA = match.teams_a;
  const teamB = match.teams_b;

  return (
    <Link
      href={`/jogos/${match.id}`}
      className={`match-strip-cell ${live ? "match-strip-cell-live" : ""}`}
    >
      <div className="match-strip-cell-inner">
        <TeamLogo team={teamA} index={index * 2} size={32} className="shrink-0" />

        <div className="match-strip-center">
          {finished || live ? (
            <span
              className={`match-strip-score font-mono-label tabular-nums ${live ? "text-[var(--color-brand)]" : "text-white"}`}
            >
              {match.score_a ?? 0}
              <span className="mx-1.5 text-white/30">-</span>
              {match.score_b ?? 0}
            </span>
          ) : (
            <span className="match-strip-score font-mono-label text-[var(--color-brand)]">
              {match.match_time?.slice(0, 5) ?? "—"}
            </span>
          )}
          {live && (
            <span className="match-strip-live font-mono-label">LIVE</span>
          )}
        </div>

        <TeamLogo team={teamB} index={index * 2 + 1} size={32} className="shrink-0" />
      </div>
    </Link>
  );
}
