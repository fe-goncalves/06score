import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OrgImage } from "@/components/ui/OrgImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Match } from "@/lib/types";
import {
  formatMatchDateTime,
  isMatchFinished,
} from "@/lib/utils";

interface MatchCardProps {
  match: Match;
}

function getCompetitionName(match: Match): string {
  return (
    match.phases?.competition_editions?.competitions?.full_name ??
    match.phases?.competition_editions?.competitions?.short_name ??
    "Competição"
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const finished = isMatchFinished(match.status);
  const teamA = match.teams_a;
  const teamB = match.teams_b;

  return (
    <Link href={`/jogos/${match.id}`} className="block snap-start min-w-[280px] shrink-0 sm:min-w-[320px]">
    <Card className="h-full p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand)]">
          {getCompetitionName(match)}
        </p>
        <StatusBadge status={match.status} />
      </div>

      <p className="mb-4 text-xs text-white/50">
        {formatMatchDateTime(match.match_date, match.match_time)}
      </p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <OrgImage
            src={teamA?.logo_url}
            alt={teamA?.full_name ?? "Time A"}
            width={48}
            height={48}
            className="h-12 w-12 rounded object-contain"
          />
          <span className="line-clamp-2 text-xs font-semibold">
            {teamA?.short_name ?? teamA?.full_name ?? "—"}
          </span>
        </div>

        <div className="shrink-0 px-2 text-center">
          {finished ? (
            <span className="text-2xl font-bold tabular-nums">
              {match.score_a ?? 0}
              <span className="mx-1 text-white/30">×</span>
              {match.score_b ?? 0}
            </span>
          ) : (
            <span className="text-lg font-bold text-[var(--color-brand)]">
              {match.match_time?.slice(0, 5) ?? "—"}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <OrgImage
            src={teamB?.logo_url}
            alt={teamB?.full_name ?? "Time B"}
            width={48}
            height={48}
            className="h-12 w-12 rounded object-contain"
          />
          <span className="line-clamp-2 text-xs font-semibold">
            {teamB?.short_name ?? teamB?.full_name ?? "—"}
          </span>
        </div>
      </div>
    </Card>
    </Link>
  );
}
