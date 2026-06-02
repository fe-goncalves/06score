import Link from "next/link";
import { MatchNextGameCard } from "@/components/match/MatchNextGameCard";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { buildMatchH2H, getH2HResult, type H2HResult } from "@/lib/match/h2h";
import type { Match } from "@/lib/types";
import {
  formatMatchDateTime,
  formatMatchPhaseRoundLabel,
  isMatchFinished,
} from "@/lib/utils";

interface MatchH2HPanelProps {
  match: Match;
  h2hMatches: Match[];
  nextGameA: Match | null;
  nextGameB: Match | null;
  teamAId: string;
  teamBId: string;
}

const H2H_RESULT_LABEL: Record<H2HResult, string> = {
  win: "V",
  loss: "D",
  draw: "E",
};

function H2HMatchRow({
  item,
  perspectiveTeamAId,
  index,
}: {
  item: Match;
  perspectiveTeamAId: string;
  index: number;
}) {
  const isAHome = item.team_a_id === perspectiveTeamAId;
  const left = isAHome ? item.teams_a : item.teams_b;
  const right = isAHome ? item.teams_b : item.teams_a;
  const scoreLeft = isAHome ? (item.score_a ?? 0) : (item.score_b ?? 0);
  const scoreRight = isAHome ? (item.score_b ?? 0) : (item.score_a ?? 0);
  const comp =
    item.phases?.competition_editions?.competitions?.short_name ??
    item.phases?.competition_editions?.competitions?.full_name;
  const result = getH2HResult(item, perspectiveTeamAId);

  return (
    <Link href={`/jogos/${item.id}`} className="match-h2h-row">
      <div className="match-h2h-row-meta">
        {result && (
          <span
            className={`match-h2h-result match-h2h-result--${result}`}
            title={
              result === "win"
                ? "Vitória"
                : result === "loss"
                  ? "Derrota"
                  : "Empate"
            }
          >
            {H2H_RESULT_LABEL[result]}
          </span>
        )}
        <span className="match-h2h-row-date">
          {formatMatchDateTime(item.match_date, item.match_time)}
        </span>
        {comp && <span className="match-h2h-row-comp">{comp}</span>}
        <span className="match-h2h-row-phase">{formatMatchPhaseRoundLabel(item)}</span>
      </div>
      <div className="match-h2h-row-body">
        <div className="match-h2h-team">
          <TeamLogo team={left} index={index * 2} size={24} />
          <span className="truncate">{left?.short_name ?? left?.full_name}</span>
        </div>
        <span className="match-h2h-score tabular-nums">
          {scoreLeft}
          <span className="match-h2h-score-sep">-</span>
          {scoreRight}
        </span>
        <div className="match-h2h-team match-h2h-team--away">
          <span className="truncate">{right?.short_name ?? right?.full_name}</span>
          <TeamLogo team={right} index={index * 2 + 1} size={24} />
        </div>
      </div>
    </Link>
  );
}

export function MatchH2HPanel({
  match,
  h2hMatches,
  nextGameA,
  nextGameB,
  teamAId,
  teamBId,
}: MatchH2HPanelProps) {
  const summary = buildMatchH2H(h2hMatches, teamAId, teamBId, match.id);
  const nameA = match.teams_a?.short_name ?? match.teams_a?.full_name ?? "A";
  const nameB = match.teams_b?.short_name ?? match.teams_b?.full_name ?? "B";
  const total = summary.teamAWins + summary.teamBWins + summary.draws;

  return (
    <div className="match-partidas">
      <section className="match-partidas-section">
        <h2 className="match-partidas-heading">Próximo jogo</h2>
        <div className="match-next-games-grid">
          <MatchNextGameCard
            team={match.teams_a}
            teamId={teamAId}
            nextGame={nextGameA}
            index={0}
          />
          <MatchNextGameCard
            team={match.teams_b}
            teamId={teamBId}
            nextGame={nextGameB}
            index={1}
          />
        </div>
      </section>

      <section className="match-partidas-section">
        <h2 className="match-partidas-heading">Confronto direto (H2H)</h2>
        <div className="match-h2h">
          <div className="match-h2h-summary">
            <div className="match-h2h-summary-team">
              <TeamLogo team={match.teams_a} index={0} size={36} />
              <span className="match-h2h-summary-name">{nameA}</span>
              <span className="match-h2h-summary-wins tabular-nums">
                {summary.teamAWins}
              </span>
              <span className="match-h2h-summary-label">vitórias</span>
            </div>

            <div className="match-h2h-summary-center">
              <span className="match-h2h-summary-draws tabular-nums">
                {summary.draws}
              </span>
              <span className="match-h2h-summary-label">empates</span>
              {total > 0 && (
                <span className="match-h2h-summary-goals tabular-nums">
                  {summary.teamAGoals}:{summary.teamBGoals}
                </span>
              )}
            </div>

            <div className="match-h2h-summary-team match-h2h-summary-team--away">
              <TeamLogo team={match.teams_b} index={1} size={36} />
              <span className="match-h2h-summary-name">{nameB}</span>
              <span className="match-h2h-summary-wins tabular-nums">
                {summary.teamBWins}
              </span>
              <span className="match-h2h-summary-label">vitórias</span>
            </div>
          </div>

          {summary.matches.length ? (
            <ul className="match-h2h-list">
              {summary.matches.map((item, index) => (
                <li key={item.id}>
                  <H2HMatchRow
                    item={item}
                    perspectiveTeamAId={teamAId}
                    index={index}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="match-empty-state">
              Ainda não há confrontos finalizados entre estes times.
            </p>
          )}

          {isMatchFinished(match.status) && total === 0 && h2hMatches.length === 0 && (
            <p className="match-empty-state match-empty-state--sub">
              Este pode ser o primeiro duelo registrado.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
