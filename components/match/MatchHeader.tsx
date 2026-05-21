import { OrgImage } from "@/components/ui/OrgImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Match } from "@/lib/types";
import { formatMatchDateTime, isMatchFinished } from "@/lib/utils";

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
  const teamA = match.teams_a;
  const teamB = match.teams_b;

  return (
    <header className="text-center">
      <div className="mb-2 flex items-center justify-center gap-2">
        <StatusBadge status={match.status} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand)]">
          {phaseLabel(match)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6 sm:gap-12">
        <div className="flex flex-1 flex-col items-center gap-3">
          <OrgImage
            src={teamA?.logo_url}
            alt={teamA?.full_name ?? "Time A"}
            width={80}
            height={80}
            className="h-16 w-16 sm:h-20 sm:w-20 rounded object-contain"
          />
          <span className="text-sm font-bold sm:text-base">
            {teamA?.short_name ?? teamA?.full_name ?? "—"}
          </span>
        </div>

        <div className="shrink-0">
          {finished ? (
            <p className="text-4xl font-bold tabular-nums sm:text-5xl">
              {match.score_a ?? 0}
              <span className="mx-2 text-white/30">×</span>
              {match.score_b ?? 0}
            </p>
          ) : (
            <p className="text-2xl font-bold text-[var(--color-brand)]">
              {match.match_time?.slice(0, 5) ?? "—"}
            </p>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-3">
          <OrgImage
            src={teamB?.logo_url}
            alt={teamB?.full_name ?? "Time B"}
            width={80}
            height={80}
            className="h-16 w-16 sm:h-20 sm:w-20 rounded object-contain"
          />
          <span className="text-sm font-bold sm:text-base">
            {teamB?.short_name ?? teamB?.full_name ?? "—"}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-white/50">
        {formatMatchDateTime(match.match_date, match.match_time)}
        {match.venues?.full_name ? ` · ${match.venues.full_name}` : ""}
      </p>
    </header>
  );
}
