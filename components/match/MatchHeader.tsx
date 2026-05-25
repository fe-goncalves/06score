import { StatusBadge } from "@/components/ui/StatusBadge";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Match } from "@/lib/types";
import {
  formatMatchDateTime,
  isMatchFinished,
  isMatchLive,
} from "@/lib/utils";

interface MatchHeaderProps {
  match: Match;
}

function phaseLabel(match: Match): string {
  const phase = match.phases;
  if (!phase) return "";
  const phaseName = phase.custom_label ?? phase.full_name ?? "";
  const comp =
    phase.competition_editions?.competitions?.full_name ??
    phase.competition_editions?.competitions?.short_name ??
    "";
  return [comp, phaseName].filter(Boolean).join(" · ");
}

export function MatchHeader({ match }: MatchHeaderProps) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const teamA = match.teams_a;
  const teamB = match.teams_b;

  return (
    <header
      className={`text-center ${live ? "card-live rounded-lg p-6" : ""}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        <StatusBadge status={match.status} />
        <span className="font-mono-label text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand)]">
          {phaseLabel(match)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6 sm:gap-12">
        <div className="flex flex-1 flex-col items-center gap-3">
          <TeamLogo team={teamA} index={0} size={72} />
          <span className="font-display text-sm font-bold uppercase sm:text-base">
            {teamA?.short_name ?? teamA?.full_name ?? "—"}
          </span>
        </div>

        <div className="shrink-0">
          {finished || live ? (
            <p className="font-display text-4xl font-black tabular-nums sm:text-5xl">
              {match.score_a ?? 0}
              <span className="mx-2 text-white/25">-</span>
              {match.score_b ?? 0}
            </p>
          ) : (
            <p className="font-display text-2xl font-black text-[var(--color-brand)]">
              {match.match_time?.slice(0, 5) ?? "—"}
            </p>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-3">
          <TeamLogo team={teamB} index={1} size={72} />
          <span className="font-display text-sm font-bold uppercase sm:text-base">
            {teamB?.short_name ?? teamB?.full_name ?? "—"}
          </span>
        </div>
      </div>

      <p className="font-mono-label mt-4 text-[10px] uppercase text-white/45">
        {formatMatchDateTime(match.match_date, match.match_time)}
        {match.venues?.full_name ? ` · ${match.venues.full_name}` : ""}
      </p>
    </header>
  );
}
