import type { Match, MatchAction, TimelineEntry } from "@/lib/types";
import {
  athleteDisplayName,
  buildTimelineWithScore,
  getActionIcon,
  isGoalAction,
} from "@/lib/utils";

interface TimelinePanelProps {
  match: Match;
  actions: MatchAction[];
  teamAId: string;
}

export function TimelinePanel({ match, actions, teamAId }: TimelinePanelProps) {
  const timeline = buildTimelineWithScore(actions, teamAId);
  const displayActions = timeline.filter(
    (a) => a.action_type.toLowerCase() !== "assist",
  );

  if (!displayActions.length) {
    return <p className="text-sm text-white/40">Nenhum evento registrado.</p>;
  }

  return (
    <ul className="space-y-3">
      {displayActions.map((entry) => (
        <TimelineRow
          key={entry.id}
          entry={entry}
          isTeamA={entry.team_id === teamAId}
          teamAName={match.teams_a?.short_name ?? match.teams_a?.full_name ?? "A"}
          teamBName={match.teams_b?.short_name ?? match.teams_b?.full_name ?? "B"}
        />
      ))}
    </ul>
  );
}

function TimelineRow({
  entry,
  isTeamA,
  teamAName,
  teamBName,
}: {
  entry: TimelineEntry;
  isTeamA: boolean;
  teamAName: string;
  teamBName: string;
}) {
  const athlete = entry.athletes;
  const name = athlete
    ? athleteDisplayName(athlete.full_name, athlete.surname)
    : "—";
  const minute =
    entry.minute != null ? `${entry.minute}'` : entry.period ?? "";
  const icon = getActionIcon(entry.action_type);
  const showScore = isGoalAction(entry.action_type);

  const content = (
    <div
      className={`flex max-w-[85%] items-center gap-3 rounded-lg border border-white/[0.06] bg-[#141414] px-3 py-2 ${
        isTeamA ? "flex-row" : "flex-row-reverse"
      }`}
    >
      <span className="shrink-0 text-lg">{icon}</span>
      <div className={isTeamA ? "text-left" : "text-right"}>
        <p className="text-xs font-bold text-white/50">{minute}</p>
        <p className="text-sm font-semibold">{name}</p>
        {showScore && (
          <p className="text-xs font-bold tabular-nums text-[var(--color-brand)]">
            {entry.score_a} × {entry.score_b}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <li
      className={`flex items-center ${isTeamA ? "justify-start" : "justify-end"}`}
    >
      <div className="hidden w-16 shrink-0 text-[10px] font-bold uppercase text-white/30 sm:block">
        {isTeamA ? teamAName : teamBName}
      </div>
      {content}
    </li>
  );
}
