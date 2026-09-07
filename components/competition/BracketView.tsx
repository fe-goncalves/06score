"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { MatchupModal } from "@/components/competition/MatchupModal";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Match, MatchRound, Matchup, Team } from "@/lib/types";
import { isMatchFinished } from "@/lib/utils";

type RoundColumn = {
  key: string;
  label: string;
  order: number;
  matchups: Matchup[];
  isFinal: boolean;
  isThirdPlace: boolean;
  roundMeta?: MatchRound;
};

interface BracketViewProps {
  phaseType: "knockout" | "conference";
  matchups: Matchup[];
  matches: Match[];
  rounds?: MatchRound[];
  accentColor?: string | null;
}

const CARD_H = 112;
const CARD_GAP = 28;
const STRIDE = CARD_H + CARD_GAP;
const COL_W = 188;
const CONNECTOR_W = 24;

function teamName(team: Team | null | undefined): string {
  return (
    team?.abbreviation ||
    team?.short_name ||
    team?.full_name ||
    "A definir"
  );
}

function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function labelsMatch(a: string, b: string): boolean {
  return normalizeLabel(a) === normalizeLabel(b);
}

function isFinalLabel(label: string): boolean {
  const n = normalizeLabel(label);
  return (
    (/\bfinal\b/.test(n) || /\bgrande final\b/.test(n) || n === "gf") &&
    !/\bterceiro\b/.test(n) &&
    !/\b3/.test(n)
  );
}

function isThirdPlaceLabel(label: string): boolean {
  const n = normalizeLabel(label);
  return (
    /\bterceiro\b/.test(n) ||
    /\b3[oº]?\b/.test(n) ||
    /\bdisputa de 3/.test(n)
  );
}

function findRoundMeta(
  rounds: MatchRound[],
  matchup: Matchup,
  label: string,
): MatchRound | undefined {
  if (matchup.round_id) {
    const byId = rounds.find((r) => r.id === matchup.round_id);
    if (byId) return byId;
  }
  return rounds.find(
    (r) =>
      labelsMatch(r.custom_label ?? "", label) ||
      labelsMatch(r.name, label),
  );
}

function resolveColumnOrder(
  label: string,
  matchupsInColumn: Matchup[],
  rounds: MatchRound[],
  roundMeta?: MatchRound,
): number {
  if (roundMeta && roundMeta.display_order != null) {
    return roundMeta.display_order;
  }
  const meta = rounds.find(
    (r) =>
      labelsMatch(r.custom_label ?? "", label) ||
      labelsMatch(r.name, label),
  );
  if (meta && meta.display_order != null) {
    return meta.display_order;
  }
  return 10_000 - matchupsInColumn.length * 100;
}

/** Ida/volta sem placar agregado: cada vitória = 1 ponto. */
function usesSeriesWins(round?: MatchRound | null): boolean {
  return Boolean(round?.legs) && round?.aggregate_score !== true;
}

function legWinnerTeamId(match: Match): string | null {
  const sa = match.score_a ?? 0;
  const sb = match.score_b ?? 0;
  if (sa > sb) return match.team_a_id ?? null;
  if (sb > sa) return match.team_b_id ?? null;
  if (match.penalty_score_a != null && match.penalty_score_b != null) {
    return match.penalty_score_a > match.penalty_score_b
      ? (match.team_a_id ?? null)
      : (match.team_b_id ?? null);
  }
  return null;
}

function aggregateScore(
  matches: Match[],
  teamAId?: string | null,
  teamBId?: string | null,
  seriesWins = false,
): {
  scoreA: number;
  scoreB: number;
  pensA: number | null;
  pensB: number | null;
} | null {
  if (!teamAId || !teamBId) return null;
  const finished = matches.filter((m) => isMatchFinished(m.status));
  if (!finished.length) return null;

  let scoreA = 0;
  let scoreB = 0;
  let pensA: number | null = null;
  let pensB: number | null = null;

  for (const m of finished) {
    if (seriesWins) {
      const winner = legWinnerTeamId(m);
      if (winner === teamAId) scoreA += 1;
      else if (winner === teamBId) scoreB += 1;
      continue;
    }

    const sa = m.score_a ?? 0;
    const sb = m.score_b ?? 0;
    if (m.team_a_id === teamAId) {
      scoreA += sa;
      scoreB += sb;
      if (m.penalty_score_a != null && m.penalty_score_b != null) {
        pensA = m.penalty_score_a;
        pensB = m.penalty_score_b;
      }
    } else {
      scoreA += sb;
      scoreB += sa;
      if (m.penalty_score_a != null && m.penalty_score_b != null) {
        pensA = m.penalty_score_b;
        pensB = m.penalty_score_a;
      }
    }
  }
  return { scoreA, scoreB, pensA, pensB };
}

function resolveWinnerId(
  matchup: Matchup,
  related: Match[],
  round?: MatchRound | null,
): string | null {
  if (matchup.aggregate_winner_id) return matchup.aggregate_winner_id;
  if (!matchup.is_completed) return null;

  const series = usesSeriesWins(round);
  const agg = aggregateScore(
    related,
    matchup.team_a_id,
    matchup.team_b_id,
    series,
  );
  if (agg) {
    if (agg.scoreA > agg.scoreB) return matchup.team_a_id ?? null;
    if (agg.scoreB > agg.scoreA) return matchup.team_b_id ?? null;
    if (!series && agg.pensA != null && agg.pensB != null) {
      return agg.pensA > agg.pensB
        ? (matchup.team_a_id ?? null)
        : (matchup.team_b_id ?? null);
    }
  }
  return related[related.length - 1]?.aggregate_winner_id ?? null;
}

function scoreLabel(score: number | null, pens: number | null): string {
  if (score == null) return "—";
  if (pens != null) return `${score}(${pens})`;
  return String(score);
}

function buildColumns(
  matchups: Matchup[],
  rounds: MatchRound[] = [],
): RoundColumn[] {
  const map = new Map<string, Matchup[]>();

  for (const matchup of matchups) {
    const label = matchup.round_label || "Rodada";
    const key = normalizeLabel(label);
    const list = map.get(key) ?? [];
    list.push(matchup);
    map.set(key, list);
  }

  const columns: RoundColumn[] = [...map.entries()].map(([key, list]) => {
    const label = list[0]?.round_label || "Rodada";
    const sorted = [...list].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
    );
    const roundMeta = findRoundMeta(rounds, sorted[0], label);
    return {
      key,
      label,
      order: resolveColumnOrder(label, sorted, rounds, roundMeta),
      matchups: sorted,
      isFinal: isFinalLabel(label),
      isThirdPlace: isThirdPlaceLabel(label),
      roundMeta,
    };
  });

  columns.sort(
    (a, b) => a.order - b.order || a.label.localeCompare(b.label, "pt-BR"),
  );

  const playable = columns.filter((c) => !c.isThirdPlace);
  const last = playable[playable.length - 1];
  if (last && last.matchups.length === 1) last.isFinal = true;

  return columns;
}

function slotHeight(roundIndex: number): number {
  return STRIDE * Math.pow(2, roundIndex);
}

function columnBodyHeight(firstRoundCount: number): number {
  if (firstRoundCount <= 0) return CARD_H;
  return firstRoundCount * STRIDE - CARD_GAP;
}

function TeamRow({
  team,
  teamId,
  winner,
  scoreText,
  completed,
}: {
  team: Team | null | undefined;
  teamId?: string | null;
  winner: string | null;
  scoreText: string;
  completed: boolean;
}) {
  const isWinner = Boolean(completed && winner && teamId === winner);
  const isLoser = Boolean(completed && winner && teamId && teamId !== winner);

  return (
    <div
      className={`bracket-team-row${isLoser ? " bracket-team-row--loser" : ""}`}
    >
      {team?.logo_url ? (
        <OrgImage
          src={team.logo_url}
          alt=""
          width={32}
          height={32}
          className="bracket-team-logo"
        />
      ) : (
        <span className="bracket-team-logo bracket-team-logo--fallback" />
      )}
      <span
        className={`bracket-team-name${isWinner ? " bracket-team-name--winner" : ""}`}
      >
        {teamName(team)}
      </span>
      <span
        className={`bracket-team-score${isWinner ? " bracket-team-score--winner" : ""}`}
      >
        {scoreText}
      </span>
    </div>
  );
}

function MatchupCard({
  matchup,
  matches,
  rounds,
  accent,
  isFinal,
  roundMeta,
}: {
  matchup: Matchup;
  matches: Match[];
  rounds: MatchRound[];
  accent: string;
  isFinal: boolean;
  roundMeta?: MatchRound;
}) {
  const [open, setOpen] = useState(false);
  const related = matches
    .filter((m) => m.matchup_id === matchup.id)
    .sort((a, b) => (a.match_date ?? "").localeCompare(b.match_date ?? ""));
  const meta =
    roundMeta ?? findRoundMeta(rounds, matchup, matchup.round_label || "");
  const series = usesSeriesWins(meta);
  const agg = aggregateScore(
    related,
    matchup.team_a_id,
    matchup.team_b_id,
    series,
  );
  const winner = resolveWinnerId(matchup, related, meta);
  const completed =
    matchup.is_completed === true || Boolean(matchup.aggregate_winner_id);

  return (
    <>
      <button
        type="button"
        className="bracket-matchup-btn"
        style={{ width: COL_W }}
        onClick={() => setOpen(true)}
        aria-label={`Confronto ${teamName(matchup.teams_a)} contra ${teamName(matchup.teams_b)}`}
      >
        <div
          className={`bracket-matchup${isFinal ? " bracket-matchup--final" : ""}`}
          style={
            isFinal
              ? ({ "--bracket-accent": accent } as CSSProperties)
              : undefined
          }
        >
          <TeamRow
            team={matchup.teams_a}
            teamId={matchup.team_a_id}
            winner={winner}
            scoreText={scoreLabel(
              agg?.scoreA ?? null,
              series ? null : (agg?.pensA ?? null),
            )}
            completed={completed}
          />
          <div className="bracket-matchup-divider" />
          <TeamRow
            team={matchup.teams_b}
            teamId={matchup.team_b_id}
            winner={winner}
            scoreText={scoreLabel(
              agg?.scoreB ?? null,
              series ? null : (agg?.pensB ?? null),
            )}
            completed={completed}
          />
        </div>
      </button>

      {open ? (
        <MatchupModal
          matchup={matchup}
          matches={matches}
          accentColor={accent}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function ConnectorColumn({
  fromRoundIndex,
  fromCount,
  bodyHeight,
}: {
  fromRoundIndex: number;
  fromCount: number;
  bodyHeight: number;
}) {
  const midX = CONNECTOR_W / 2;
  const pairCount = Math.floor(fromCount / 2);
  const slot = slotHeight(fromRoundIndex);

  return (
    <div
      className="bracket-connector"
      style={{ width: CONNECTOR_W, height: bodyHeight }}
      aria-hidden
    >
      {Array.from({ length: pairCount }).map((_, i) => {
        const yA = i * 2 * slot + slot / 2;
        const yB = (i * 2 + 1) * slot + slot / 2;
        const yMid = (yA + yB) / 2;
        const top = Math.min(yA, yB);
        const height = Math.max(Math.abs(yB - yA), 1);

        return (
          <span key={`c-${fromRoundIndex}-${i}`} className="bracket-connector-pair">
            <span
              className="bracket-connector-h"
              style={{ left: 0, width: midX, top: yA - 0.5 }}
            />
            <span
              className="bracket-connector-h"
              style={{ left: 0, width: midX, top: yB - 0.5 }}
            />
            <span
              className="bracket-connector-v"
              style={{ left: midX - 0.5, top, height }}
            />
            <span
              className="bracket-connector-h"
              style={{ left: midX, width: midX, top: yMid - 0.5 }}
            />
          </span>
        );
      })}
    </div>
  );
}

function BracketTree({
  columns,
  matches,
  rounds,
  accent,
}: {
  columns: RoundColumn[];
  matches: Match[];
  rounds: MatchRound[];
  accent: string;
}) {
  const mainColumns = columns.filter((c) => !c.isThirdPlace);
  const third = columns.find((c) => c.isThirdPlace);

  if (!mainColumns.length) {
    return <p className="bracket-empty">Chaveamento indisponível.</p>;
  }

  const firstCount = Math.max(mainColumns[0].matchups.length, 1);
  const bodyH = columnBodyHeight(firstCount);

  return (
    <div className="bracket-tree">
      <div className="bracket-view">
        <div className="bracket-tree-row" style={{ minHeight: bodyH + 36 }}>
          {mainColumns.map((col, roundIndex) => {
            const slot = slotHeight(roundIndex);
            return (
              <div key={col.key} className="bracket-round-block">
                <p
                  className={`bracket-column-label${col.isFinal ? " bracket-column-label--final" : ""}`}
                  style={col.isFinal ? { color: accent } : undefined}
                >
                  {col.label}
                </p>

                <div className="bracket-round-row">
                  <div
                    className="bracket-round-slots"
                    style={{ width: COL_W, height: bodyH }}
                  >
                    {col.matchups.map((matchup) => (
                      <div
                        key={matchup.id}
                        className="bracket-slot"
                        style={{ height: slot }}
                      >
                        <MatchupCard
                          matchup={matchup}
                          matches={matches}
                          rounds={rounds}
                          accent={accent}
                          isFinal={col.isFinal}
                          roundMeta={col.roundMeta}
                        />
                      </div>
                    ))}
                  </div>

                  {roundIndex < mainColumns.length - 1 ? (
                    <ConnectorColumn
                      fromRoundIndex={roundIndex}
                      fromCount={col.matchups.length}
                      bodyHeight={bodyH}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {third?.matchups[0] ? (
        <div className="bracket-third">
          <p className="bracket-column-label">{third.label}</p>
          <div style={{ width: COL_W }}>
            <MatchupCard
              matchup={third.matchups[0]}
              matches={matches}
              rounds={rounds}
              accent={accent}
              isFinal={false}
              roundMeta={third.roundMeta}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ConferenceBracket({
  matchups,
  matches,
  rounds,
  accent,
}: {
  matchups: Matchup[];
  matches: Match[];
  rounds: MatchRound[];
  accent: string;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, Matchup[]>();
    for (const m of matchups) {
      const key = m.conference_id || "_main";
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [matchups]);

  if (groups.length <= 1) {
    return (
      <BracketTree
        columns={buildColumns(matchups, rounds)}
        matches={matches}
        rounds={rounds}
        accent={accent}
      />
    );
  }

  return (
    <div className="bracket-conference">
      {groups.map(([id, list], index) => (
        <div key={id} className="bracket-conference-block">
          <p className="bracket-conference-title" style={{ color: accent }}>
            Conferência {index + 1}
          </p>
          <BracketTree
            columns={buildColumns(list, rounds)}
            matches={matches}
            rounds={rounds}
            accent={accent}
          />
        </div>
      ))}
    </div>
  );
}

export function BracketView({
  phaseType,
  matchups,
  matches,
  rounds = [],
  accentColor,
}: BracketViewProps) {
  const accent = accentColor ?? "var(--color-brand)";
  const columns = useMemo(
    () => buildColumns(matchups, rounds),
    [matchups, rounds],
  );

  if (!columns.length) {
    return <p className="bracket-empty">Chaveamento indisponível.</p>;
  }

  if (phaseType === "conference") {
    return (
      <ConferenceBracket
        matchups={matchups}
        matches={matches}
        rounds={rounds}
        accent={accent}
      />
    );
  }

  return (
    <BracketTree
      columns={columns}
      matches={matches}
      rounds={rounds}
      accent={accent}
    />
  );
}
