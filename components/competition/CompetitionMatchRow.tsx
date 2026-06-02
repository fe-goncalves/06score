import Link from "next/link";
import type { CSSProperties } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Match } from "@/lib/types";
import {
  formatMatchDateTime,
  isMatchFinished,
  isMatchLive,
} from "@/lib/utils";

interface CompetitionMatchRowProps {
  match: Match;
  index: number;
  accentColor?: string | null;
}

export function CompetitionMatchRow({
  match,
  index,
  accentColor,
}: CompetitionMatchRowProps) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const accent = accentColor ?? "var(--color-brand)";

  return (
    <Link
      href={`/jogos/${match.id}`}
      className={`competition-match-row ${live ? "competition-match-row-live" : ""}`}
      style={{ "--row-accent": accent } as CSSProperties}
    >
      <div className="competition-match-row-glow" aria-hidden />
      <div className="competition-match-row-body">
        <div className="min-w-0 flex-1">
          <p className="competition-match-date">
            {formatMatchDateTime(match.match_date, match.match_time)}
          </p>
          <div className="competition-match-teams mt-2">
            <div className="competition-match-team">
              <TeamLogo team={match.teams_a} index={index * 2} size={28} />
              <span className="competition-match-name truncate">
                {match.teams_a?.short_name ?? match.teams_a?.full_name ?? "—"}
              </span>
            </div>
            <div className="competition-match-center">
              {finished || live ? (
                <span
                  className={`competition-match-score ${live ? "text-[var(--color-brand)]" : "text-white"}`}
                >
                  {match.score_a ?? 0}
                  <span className="mx-1 text-white/25">-</span>
                  {match.score_b ?? 0}
                </span>
              ) : (
                <span className="competition-match-score text-[var(--color-brand)]">
                  {match.match_time?.slice(0, 5) ?? "—"}
                </span>
              )}
              {live && (
                <span className="font-mono-label text-[7px] font-bold tracking-widest text-[var(--color-brand)]">
                  LIVE
                </span>
              )}
            </div>
            <div className="competition-match-team">
              <TeamLogo team={match.teams_b} index={index * 2 + 1} size={28} />
              <span className="competition-match-name truncate">
                {match.teams_b?.short_name ?? match.teams_b?.full_name ?? "—"}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={match.status} />
      </div>
    </Link>
  );
}
