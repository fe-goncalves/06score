"use client";

import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Match, Matchup } from "@/lib/types";
import { getMatchupAggregateScore } from "@/lib/utils";

interface BracketViewProps {
  matchups: Matchup[];
  matches: Match[];
}

interface RoundColumn {
  label: string;
  order: number;
  matchups: Matchup[];
}

function BracketMatchupCard({
  matchup,
  matches,
}: {
  matchup: Matchup;
  matches: Match[];
}) {
  const related = matches.filter((m) => m.matchup_id === matchup.id);
  const agg = getMatchupAggregateScore(
    related,
    matchup.team_a_id,
    matchup.team_b_id,
  );
  const hasScore = agg != null;
  const teamA = matchup.teams_a;
  const teamB = matchup.teams_b;

  const firstMatch = related[0];

  return (
    <div className="w-[200px] shrink-0 rounded-lg border border-white/[0.08] bg-[#141414] text-sm">
      <BracketTeamRow
        team={teamA}
        score={hasScore ? agg.scoreA : null}
        isWinner={
          hasScore && agg.scoreA > agg.scoreB && matchup.is_completed === true
        }
      />
      <div className="border-t border-white/[0.06]" />
      <BracketTeamRow
        team={teamB}
        score={hasScore ? agg.scoreB : null}
        isWinner={
          hasScore && agg.scoreB > agg.scoreA && matchup.is_completed === true
        }
      />
      {firstMatch && (
        <Link
          href={`/jogos/${firstMatch.id}`}
          className="block border-t border-white/[0.06] py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-white/40 hover:text-[var(--color-brand)]"
        >
          Ver partida
        </Link>
      )}
    </div>
  );
}

function BracketTeamRow({
  team,
  score,
  isWinner,
}: {
  team: Matchup["teams_a"];
  score: number | null;
  isWinner: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 ${
        isWinner ? "bg-[var(--color-brand)]/10" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <OrgImage
          src={team?.logo_url}
          alt={team?.full_name ?? "TBD"}
          width={20}
          height={20}
          className="h-5 w-5 shrink-0 rounded object-contain"
        />
        <span
          className={`truncate text-xs font-semibold ${
            team ? "" : "text-white/30"
          }`}
        >
          {team?.abbreviation ?? team?.short_name ?? team?.full_name ?? "TBD"}
        </span>
      </div>
      {score != null && (
        <span
          className={`shrink-0 font-bold tabular-nums ${
            isWinner ? "text-[var(--color-brand)]" : "text-white/70"
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export function BracketView({ matchups, matches }: BracketViewProps) {
  if (!matchups.length) {
    return (
      <p className="text-sm text-white/40">Chaveamento não disponível.</p>
    );
  }

  const columnsMap: Record<string, RoundColumn> = {};
  for (const mu of matchups) {
    const label = mu.round_label || "Rodada";
    if (!columnsMap[label]) {
      columnsMap[label] = {
        label,
        order: mu.display_order,
        matchups: [],
      };
    }
    columnsMap[label].matchups.push(mu);
  }

  const columns = Object.values(columnsMap).sort(
    (a, b) => a.order - b.order || a.label.localeCompare(b.label),
  );

  for (const col of columns) {
    col.matchups.sort((a, b) => a.display_order - b.display_order);
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max items-stretch gap-6">
        {columns.map((col, colIndex) => (
          <div key={col.label} className="flex flex-col">
            <h4 className="mb-4 text-center text-[10px] font-bold uppercase tracking-wider text-white/50">
              {col.label}
            </h4>
            <div className="relative flex flex-1 flex-col justify-around gap-6">
              {col.matchups.map((mu) => (
                <div key={mu.id} className="relative flex items-center">
                  {colIndex < columns.length - 1 && (
                    <span
                      className="absolute -right-3 top-1/2 hidden h-px w-3 bg-white/20 md:block"
                      aria-hidden
                    />
                  )}
                  <BracketMatchupCard matchup={mu} matches={matches} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
