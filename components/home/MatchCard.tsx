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

function getPhaseLabel(match: Match): string {
  const phase = match.phases;
  const phaseName = phase?.custom_label ?? phase?.full_name ?? "";
  const comp =
    phase?.competition_editions?.competitions?.short_name ??
    phase?.competition_editions?.competitions?.full_name ??
    "";
  return [comp, phaseName].filter(Boolean).join(" · ") || "Jogo";
}

export function MatchCard({ match, index = 0 }: MatchCardProps) {
  const finished = isMatchFinished(match.status);
  const live = isMatchLive(match.status);
  const teamA = match.teams_a;
  const teamB = match.teams_b;
  const meta = `${formatMatchDateTime(match.match_date, match.match_time)} · ${getPhaseLabel(match)}`;

  return (
    <Link
      href={`/jogos/${match.id}`}
      className="block min-w-[148px] shrink-0 snap-start"
    >
      <article
        className={`match-card-hover flex min-h-[88px] flex-col justify-between gap-2 p-2.5 ${live ? "card-live" : "card-surface"}`}
      >
        <p className="font-mono-label line-clamp-2 text-[8px] font-bold uppercase leading-tight text-white/45">
          {meta}
        </p>

        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <TeamLogo team={teamA} index={index * 2} size={22} className="shrink-0" />
            <span className="font-display truncate text-[10px] font-bold uppercase text-white/80">
              {teamA?.abbreviation ?? teamA?.short_name ?? "—"}
            </span>
          </div>

          <div className="shrink-0 px-0.5 text-center">
            {finished || live ? (
              <span className="font-display text-[18px] font-black tabular-nums leading-none text-white">
                {match.score_a ?? 0}
                <span className="mx-0.5 text-white/25">-</span>
                {match.score_b ?? 0}
              </span>
            ) : (
              <span className="font-display text-[12px] font-black leading-none text-[var(--color-brand)]">
                {match.match_time?.slice(0, 5) ?? "—"}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <span className="font-display truncate text-[10px] font-bold uppercase text-white/80">
              {teamB?.abbreviation ?? teamB?.short_name ?? "—"}
            </span>
            <TeamLogo team={teamB} index={index * 2 + 1} size={22} className="shrink-0" />
          </div>
        </div>

        {live && (
          <p className="font-mono-label text-center text-[7px] font-bold uppercase text-[#ff6b00]">
            AO VIVO
          </p>
        )}
      </article>
    </Link>
  );
}
