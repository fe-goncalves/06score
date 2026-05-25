import { OrgImage } from "@/components/ui/OrgImage";
import type {
  Match,
  MatchAthleteRating,
  MatchLineup,
} from "@/lib/types";
import {
  athleteDisplayName,
  formatRating,
  getPositionName,
} from "@/lib/utils";

interface LineupsPanelProps {
  match: Match;
  lineups: MatchLineup[];
  ratings: MatchAthleteRating[];
  teamAId: string;
}

interface LineupRow extends MatchLineup {
  edition_teams?: { team_id?: string; teams: Match["teams_a"] } | null;
}

function ratingFor(
  athleteId: string,
  ratings: MatchAthleteRating[],
): number | null {
  const r = ratings.find((x) => x.athlete_id === athleteId);
  return r?.rating ?? null;
}

function LineupColumn({
  title,
  logoUrl,
  players,
  ratings,
}: {
  title: string;
  logoUrl: string | null | undefined;
  players: LineupRow[];
  ratings: MatchAthleteRating[];
}) {
  const sorted = [...players].sort((a, b) => {
    if (a.played_as_goalkeeper !== b.played_as_goalkeeper) {
      return a.played_as_goalkeeper ? -1 : 1;
    }
    if (a.is_captain !== b.is_captain) return a.is_captain ? -1 : 1;
    return 0;
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <OrgImage
          src={logoUrl}
          alt={title}
          width={32}
          height={32}
          className="h-8 w-8 rounded object-contain"
        />
        <h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
      </div>
      <ul className="space-y-2">
        {sorted.map((row) => {
          const athlete = row.athletes;
          if (!athlete) return null;
          const name = athleteDisplayName(athlete.full_name, athlete.surname);
          const rating = ratingFor(row.athlete_id, ratings);
          return (
            <li
              key={row.athlete_id}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                row.played_as_goalkeeper
                  ? "border-[var(--color-brand)]/40 bg-[var(--color-brand)]/5"
                  : "border-white/[0.06] card-surface"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {name}
                  {row.is_captain && (
                    <span className="ml-2 rounded bg-[var(--color-brand)]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--color-brand)]">
                      C
                    </span>
                  )}
                  {row.played_as_goalkeeper && (
                    <span className="ml-1 text-[10px] text-white/40">GK</span>
                  )}
                </p>
                <p className="text-xs text-white/40">
                  {getPositionName(athlete.player_positions)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold tabular-nums text-[var(--color-brand)]">
                {formatRating(rating)}
              </span>
            </li>
          );
        })}
      </ul>
      {!sorted.length && (
        <p className="text-sm text-white/40">Escalação não disponível.</p>
      )}
    </div>
  );
}

export function LineupsPanel({
  match,
  lineups,
  ratings,
  teamAId,
}: LineupsPanelProps) {
  const rows = lineups as LineupRow[];
  const sideA: LineupRow[] = [];
  const sideB: LineupRow[] = [];

  for (const row of rows) {
    const tid = row.edition_teams?.team_id;
    if (tid === teamAId || tid === match.team_a_id) sideA.push(row);
    else sideB.push(row);
  }

  const teamA = match.teams_a;
  const teamB = match.teams_b;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <LineupColumn
        title={teamA?.short_name ?? teamA?.full_name ?? "Time A"}
        logoUrl={teamA?.logo_url}
        players={sideA}
        ratings={ratings}
      />
      <LineupColumn
        title={teamB?.short_name ?? teamB?.full_name ?? "Time B"}
        logoUrl={teamB?.logo_url}
        players={sideB}
        ratings={ratings}
      />
    </div>
  );
}
