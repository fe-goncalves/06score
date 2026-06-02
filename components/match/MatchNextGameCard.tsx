import Link from "next/link";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Match, Team } from "@/lib/types";
import { formatMatchDateTime } from "@/lib/utils";

interface MatchNextGameCardProps {
  team: Team | null | undefined;
  teamId: string;
  nextGame: Match | null;
  index: number;
}

function opponentForTeam(match: Match, teamId: string) {
  if (match.team_a_id === teamId) {
    return { team: match.teams_b, id: match.team_b_id };
  }
  return { team: match.teams_a, id: match.team_a_id };
}

export function MatchNextGameCard({
  team,
  teamId,
  nextGame,
  index,
}: MatchNextGameCardProps) {
  const teamName = team?.short_name ?? team?.full_name ?? "Equipe";

  if (!nextGame) {
    return (
      <div className="match-next-game-card match-next-game-card--empty">
        <div className="match-next-game-card-head">
          <TeamLogo team={team} index={index} size={28} />
          <span className="match-next-game-card-team">{teamName}</span>
        </div>
        <p className="match-next-game-card-empty">Nenhum jogo agendado</p>
      </div>
    );
  }

  const opponent = opponentForTeam(nextGame, teamId);
  const opponentName =
    opponent.team?.short_name ?? opponent.team?.full_name ?? "Adversário";
  const comp =
    nextGame.phases?.competition_editions?.competitions?.short_name ??
    nextGame.phases?.competition_editions?.competitions?.full_name;
  const isHome = nextGame.team_a_id === teamId;

  return (
    <Link href={`/jogos/${nextGame.id}`} className="match-next-game-card">
      <div className="match-next-game-card-head">
        <TeamLogo team={team} index={index} size={28} />
        <span className="match-next-game-card-team">{teamName}</span>
      </div>
      <p className="match-next-game-card-vs">
        {isHome ? "vs" : "@"}{" "}
        <span className="match-next-game-card-opponent">{opponentName}</span>
      </p>
      <p className="match-next-game-card-meta">
        {formatMatchDateTime(nextGame.match_date, nextGame.match_time)}
      </p>
      {comp && <p className="match-next-game-card-comp">{comp}</p>}
    </Link>
  );
}
