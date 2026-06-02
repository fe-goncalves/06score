import { MatchLineupsList } from "@/components/match/MatchLineupsList";
import type {
  Match,
  MatchAction,
  MatchAthleteRating,
  MatchLineup,
  MatchStaffLineup,
} from "@/lib/types";

interface LineupsPanelProps {
  match: Match;
  lineups: MatchLineup[];
  staffLineups: MatchStaffLineup[];
  ratings: MatchAthleteRating[];
  actions: MatchAction[];
  teamAId: string;
}

export function LineupsPanel({
  match,
  lineups,
  staffLineups,
  ratings,
  actions,
  teamAId,
}: LineupsPanelProps) {
  return (
    <MatchLineupsList
      match={match}
      lineups={lineups}
      staffLineups={staffLineups}
      ratings={ratings}
      actions={actions}
      teamAId={teamAId}
    />
  );
}
