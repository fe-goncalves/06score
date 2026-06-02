"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { MatchupModal } from "@/components/competition/MatchupModal";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Match, Matchup } from "@/lib/types";
import { getMatchupAggregateScore } from "@/lib/utils";

interface BracketViewProps {
  matchups: Matchup[];
  matches: Match[];
  accentColor?: string | null;
}

interface RoundColumn {
  label: string;
  order: number;
  matchups: Matchup[];
  isFinal: boolean;
}

function teamShortName(team: Matchup["teams_a"]): string {
  if (!team) return "TBD";
  return team.short_name ?? team.full_name ?? "TBD";
}

function isFinalRoundLabel(label: string): boolean {
  return /\bfinal\b/i.test(label);
}

function getWinner(matchup: Matchup, match: Match | null): string | null {
  if (!matchup.is_completed || !match) return null;

  const scoreA = match.score_a ?? 0;
  const scoreB = match.score_b ?? 0;

  if (scoreA > scoreB) return matchup.team_a_id;
  if (scoreB > scoreA) return matchup.team_b_id;

  const penaltyA = (match as Match & { penalty_score_a?: number | null })
    .penalty_score_a;
  const penaltyB = (match as Match & { penalty_score_b?: number | null })
    .penalty_score_b;

  if (penaltyA != null && penaltyB != null) {
    return penaltyA > penaltyB ? matchup.team_a_id : matchup.team_b_id;
  }

  const aggregateWinner = (
    match as Match & { aggregate_winner_id?: string | null }
  ).aggregate_winner_id;
  if (aggregateWinner) return aggregateWinner;

  return null;
}

function BracketMatchupCard({
  matchup,
  matches,
  isFinal,
  accentColor,
  onOpen,
}: {
  matchup: Matchup;
  matches: Match[];
  isFinal: boolean;
  accentColor?: string | null;
  onOpen: () => void;
}) {
  const related = matches.filter((m) => m.matchup_id === matchup.id);
  const match = related[0] ?? null;
  const winnerId = getWinner(matchup, match);
  const isCompleted = matchup.is_completed === true;
  const agg = getMatchupAggregateScore(
    related,
    matchup.team_a_id,
    matchup.team_b_id,
  );
  const teamA = matchup.teams_a;
  const teamB = matchup.teams_b;
  const accent = accentColor ?? "var(--color-brand)";

  return (
    <div
      className={`bracket-matchup ${isFinal ? "bracket-matchup-final" : ""}`}
      style={
        isFinal
          ? ({ "--bracket-accent": accent } as CSSProperties)
          : undefined
      }
    >
      {isFinal && <span className="bracket-matchup-final-ring" aria-hidden />}
      <button
        type="button"
        className="bracket-matchup-btn"
        onClick={onOpen}
        aria-label={`Ver partidas: ${teamShortName(teamA)} × ${teamShortName(teamB)}`}
      >
        <BracketTeamRow
          team={teamA}
          teamId={matchup.team_a_id}
          winnerId={winnerId}
          isCompleted={isCompleted}
          score={agg?.scoreA ?? null}
        />
        <div className="bracket-matchup-divider" />
        <BracketTeamRow
          team={teamB}
          teamId={matchup.team_b_id}
          winnerId={winnerId}
          isCompleted={isCompleted}
          score={agg?.scoreB ?? null}
        />
      </button>
    </div>
  );
}

function BracketTeamRow({
  team,
  teamId,
  winnerId,
  isCompleted,
  score,
}: {
  team: Matchup["teams_a"];
  teamId: string | null;
  winnerId: string | null;
  isCompleted: boolean;
  score: number | null;
}) {
  const isWinner = Boolean(isCompleted && winnerId && teamId === winnerId);
  const isLoser = Boolean(isCompleted && winnerId && teamId && teamId !== winnerId);

  const rowStyle: CSSProperties =
    isCompleted && winnerId
      ? isWinner
        ? { opacity: 1, fontWeight: 700 }
        : { opacity: 0.35, filter: "grayscale(0.4)" }
      : { opacity: 1 };

  const nameStyle: CSSProperties =
    isCompleted && winnerId
      ? isWinner
        ? { color: "#fff" }
        : { color: "rgba(255,255,255,0.35)" }
      : {};

  const scoreStyle: CSSProperties =
    isCompleted && winnerId
      ? isWinner
        ? { color: "var(--color-brand)" }
        : { color: "rgba(255,255,255,0.35)" }
      : {};

  const logoStyle: CSSProperties = isLoser
    ? { opacity: 0.35, filter: "grayscale(0.4)" }
    : {};

  return (
    <div className="bracket-team-row" style={rowStyle}>
      <div className="bracket-team-main">
        <span className="bracket-team-logo-wrap" style={logoStyle}>
          <OrgImage
            src={team?.logo_url}
            alt={teamShortName(team)}
            width={16}
            height={16}
            className="bracket-team-logo"
          />
        </span>
        <span
          className="bracket-team-name"
          title={team?.full_name ?? undefined}
          style={nameStyle}
        >
          {teamShortName(team)}
        </span>
      </div>
      <span className="bracket-team-score" style={scoreStyle}>
        {score != null ? score : "—"}
      </span>
    </div>
  );
}

export function BracketView({
  matchups,
  matches,
  accentColor,
}: BracketViewProps) {
  const [openMatchup, setOpenMatchup] = useState<Matchup | null>(null);

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
        isFinal: isFinalRoundLabel(label),
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

  const lastCol = columns[columns.length - 1];
  if (lastCol && lastCol.matchups.length === 1 && !lastCol.isFinal) {
    lastCol.isFinal = true;
  }

  return (
    <>
      <div className="bracket-view">
        <div className="bracket-view-columns">
          {columns.map((col, colIndex) => (
            <div key={col.label} className="bracket-column">
              <h4 className="bracket-column-label">{col.label}</h4>
              <div className="bracket-column-matchups">
                {col.matchups.map((mu) => (
                  <div key={mu.id} className="bracket-column-item">
                    {colIndex < columns.length - 1 && (
                      <span className="bracket-column-connector" aria-hidden />
                    )}
                    <BracketMatchupCard
                      matchup={mu}
                      matches={matches}
                      isFinal={col.isFinal}
                      accentColor={accentColor}
                      onOpen={() => setOpenMatchup(mu)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {openMatchup && (
        <MatchupModal
          matchup={openMatchup}
          matches={matches}
          accentColor={accentColor}
          onClose={() => setOpenMatchup(null)}
        />
      )}
    </>
  );
}
