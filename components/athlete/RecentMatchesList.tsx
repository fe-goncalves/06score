import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Match } from "@/lib/types";
import { formatMatchDateTime, isMatchFinished } from "@/lib/utils";

interface RecentMatchesListProps {
  matches: Match[];
  title?: string;
}

export function RecentMatchesList({
  matches,
  title = "Últimas partidas",
}: RecentMatchesListProps) {
  return (
    <section className="py-8">
      <SectionTitle>{title}</SectionTitle>
      {!matches.length ? (
        <p className="mt-4 text-sm text-white/40">Nenhuma partida recente.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {matches.map((match) => {
            const finished = isMatchFinished(match.status);
            return (
              <li key={match.id}>
                <Link
                  href={`/jogos/${match.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.06] card-surface px-4 py-3 transition-colors hover:border-[var(--color-brand)]/40"
                >
                  <div>
                    <p className="text-xs text-white/50">
                      {formatMatchDateTime(match.match_date, match.match_time)}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {match.teams_a?.short_name ?? match.teams_a?.full_name} ×{" "}
                      {match.teams_b?.short_name ?? match.teams_b?.full_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={match.status} />
                    {finished ? (
                      <span className="font-bold tabular-nums">
                        {match.score_a ?? 0} × {match.score_b ?? 0}
                      </span>
                    ) : (
                      <OrgImage
                        src={match.teams_a?.logo_url}
                        alt=""
                        width={24}
                        height={24}
                        className="h-6 w-6 opacity-50"
                      />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
