import { MatchIcon } from "@/components/match/icons/MatchIcon";
import {
  formatAwayScorerLine,
  formatHomeScorerLine,
  getGoalScorerParts,
} from "@/lib/match/goalScorers";
import type { MatchAction } from "@/lib/types";

interface MatchGoalScorersRecapProps {
  actions: MatchAction[];
  teamAId: string;
  teamBId: string;
}

export function MatchGoalScorersRecap({
  actions,
  teamAId,
  teamBId,
}: MatchGoalScorersRecapProps) {
  const { home, away } = getGoalScorerParts(actions, teamAId, teamBId);

  if (!home.length && !away.length) return null;

  return (
    <div className="match-scorers">
      <ul className="match-scorers-col match-scorers-col--home">
        {home.map((part) => (
          <li key={part.id} className="match-scorers-line">
            {formatHomeScorerLine(part)}
          </li>
        ))}
      </ul>
      <div className="match-scorers-center">
        <MatchIcon name="ball" size={16} className="match-scorers-ball" />
      </div>
      <ul className="match-scorers-col match-scorers-col--away">
        {away.map((part) => (
          <li key={part.id} className="match-scorers-line">
            {formatAwayScorerLine(part)}
          </li>
        ))}
      </ul>
    </div>
  );
}
