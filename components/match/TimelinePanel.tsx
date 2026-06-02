"use client";

import { useCallback, useState, type CSSProperties, type MouseEvent } from "react";
import { FoulMeter } from "@/components/match/FoulMeter";
import { MatchActionPopover } from "@/components/match/MatchActionPopover";
import { MatchEventIcon } from "@/components/match/icons/MatchEventIcon";
import { getActionAthletes } from "@/lib/match/actionAthletes";
import type { ActionAthleteRow } from "@/lib/match/actionAthletes";
import { assistSurnameForGoal } from "@/lib/match/assistLink";
import {
  isAssistActionType,
  isPenaltyGoalType,
  isPenaltyMissedActionType,
  isPeriodFoulSummaryAction,
  isStrictGoalActionType,
  resolveActionPeriod,
  timelineDisplayLabel,
  type MatchPeriodHalf,
} from "@/lib/match/actionTypes";
import {
  getPeriodFoulCount,
  type PeriodFoulCounts,
} from "@/lib/match/periodFouls";
import type { MatchAction, TimelineEntry } from "@/lib/types";
import { athleteSurnameLabel, buildTimelineWithScore } from "@/lib/utils";

interface TimelinePanelProps {
  actions: MatchAction[];
  teamAId: string;
  teamBId: string;
  periodFoulCounts: PeriodFoulCounts;
  accentColor?: string | null;
}

type TimelineItem =
  | { type: "event"; entry: TimelineEntry }
  | { type: "period"; label: string; period: MatchPeriodHalf };

function formatMinute(entry: TimelineEntry): string {
  if (entry.minute != null) return `${entry.minute}'`;
  return "—";
}

function playerLabel(entry: TimelineEntry): string {
  const athlete = entry.athletes;
  if (athlete) {
    const surname = athleteSurnameLabel(athlete.full_name, athlete.surname);
    if (isStrictGoalActionType(entry.action_type) && entry.is_own_goal === true) {
      return `${surname} (GC)`;
    }
    return surname;
  }
  return timelineDisplayLabel(entry.action_type, entry.miss_result) ?? "—";
}

function eventSubline(entry: TimelineEntry): string | null {
  if (isPenaltyMissedActionType(entry.action_type)) {
    return timelineDisplayLabel(entry.action_type, entry.miss_result);
  }
  return null;
}

function TimelineGoalMarkers({ entry }: { entry: TimelineEntry }) {
  const isPenalty = isPenaltyGoalType(entry.goal_type);
  const score = `${entry.score_a}:${entry.score_b}`;

  return (
    <span className="match-timeline-goal-markers">
      <MatchEventIcon
        action={entry}
        iconKind="ball"
        className="match-timeline-icon"
      />
      {isPenalty && (
        <MatchEventIcon
          action={entry}
          iconKind="penalty"
          className="match-timeline-icon match-timeline-icon--pen"
          size={14}
        />
      )}
      <span className="match-timeline-score match-timeline-score--goal tabular-nums">
        {score}
      </span>
    </span>
  );
}

function buildTimelineItems(entries: TimelineEntry[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  let lastPeriod: MatchPeriodHalf | null = null;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    const currentPeriod = resolveActionPeriod(entry.period, entry.minute);

    if (currentPeriod && currentPeriod !== lastPeriod) {
      items.push({
        type: "period",
        label: currentPeriod === "second" ? "2° T" : "1° T",
        period: currentPeriod,
      });
      lastPeriod = currentPeriod;
    }

    items.push({ type: "event", entry });
  }

  return items;
}

function TimelineRow({
  entry,
  isHome,
  assistSurname,
  subline,
  onOpen,
}: {
  entry: TimelineEntry;
  isHome: boolean;
  assistSurname: string | null;
  subline: string | null;
  onOpen: (entry: TimelineEntry, el: HTMLElement) => void;
}) {
  const surname = playerLabel(entry);
  const isGoal = isStrictGoalActionType(entry.action_type);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onOpen(entry, e.currentTarget);
  };

  const iconOrScore = isGoal ? (
    <TimelineGoalMarkers entry={entry} />
  ) : (
    <MatchEventIcon action={entry} className="match-timeline-icon" />
  );

  const copy = (
    <div className="match-timeline-copy">
      <span className="match-timeline-player">{surname}</span>
      {subline && (
        <span className="match-timeline-event-subline">{subline}</span>
      )}
      {isGoal && assistSurname && (
        <span className="match-timeline-assist-line">
          <MatchEventIcon
            action={{ action_type: "assist" }}
            className="match-timeline-assist-icon"
            size={12}
          />
          {assistSurname}
        </span>
      )}
    </div>
  );

  if (isHome) {
    return (
      <li className="match-timeline-row match-timeline-row--home">
        <button
          type="button"
          className="match-timeline-event match-timeline-event--home"
          onClick={handleClick}
        >
          {iconOrScore}
          {copy}
        </button>
        <span className="match-timeline-minute tabular-nums">
          {formatMinute(entry)}
        </span>
        <div className="match-timeline-spacer" aria-hidden />
      </li>
    );
  }

  return (
    <li className="match-timeline-row match-timeline-row--away">
      <div className="match-timeline-spacer" aria-hidden />
      <span className="match-timeline-minute tabular-nums">
        {formatMinute(entry)}
      </span>
      <button
        type="button"
        className="match-timeline-event match-timeline-event--away"
        onClick={handleClick}
      >
        {copy}
        {iconOrScore}
      </button>
    </li>
  );
}

function PeriodDivider({
  label,
  period,
  periodFoulCounts,
  teamAId,
  teamBId,
}: {
  label: string;
  period: MatchPeriodHalf;
  periodFoulCounts: PeriodFoulCounts;
  teamAId: string;
  teamBId: string;
}) {
  const foulsHome = getPeriodFoulCount(
    periodFoulCounts,
    period,
    teamAId,
    teamAId,
  );
  const foulsAway = getPeriodFoulCount(
    periodFoulCounts,
    period,
    teamBId,
    teamAId,
  );

  return (
    <li className="match-timeline-period-block" aria-label={label}>
      <div className="match-timeline-period">
        <span className="match-timeline-period-line" />
        <span className="match-timeline-period-label">{label}</span>
        <span className="match-timeline-period-line" />
      </div>
      <div className="match-timeline-fouls">
        <FoulMeter count={foulsHome} side="home" />
        <FoulMeter count={foulsAway} side="away" />
      </div>
    </li>
  );
}

export function TimelinePanel({
  actions,
  teamAId,
  teamBId,
  periodFoulCounts,
  accentColor,
}: TimelinePanelProps) {
  const [popover, setPopover] = useState<{
    rows: ActionAthleteRow[];
    rect: DOMRect | null;
  } | null>(null);

  const timeline = buildTimelineWithScore(actions, teamAId);
  const displayActions = timeline
    .filter(
      (a) =>
        !isAssistActionType(a.action_type) &&
        !isPeriodFoulSummaryAction(a.action_type),
    )
    .slice()
    .reverse();

  const handleOpen = useCallback(
    (entry: TimelineEntry, el: HTMLElement) => {
      const rows = getActionAthletes(entry, actions);
      setPopover({ rows, rect: el.getBoundingClientRect() });
    },
    [actions],
  );

  const handleClose = useCallback(() => setPopover(null), []);

  if (!displayActions.length) {
    return (
      <p className="match-empty-state">Nenhum evento registrado nesta partida.</p>
    );
  }

  const items = buildTimelineItems(displayActions);
  const accent = accentColor ?? "var(--color-brand)";

  return (
    <div
      className="match-timeline match-timeline-panel"
      style={{ "--match-timeline-accent": accent } as CSSProperties}
    >
      <ul className="match-timeline-list">
        {items.map((item, index) => {
          if (item.type === "period") {
            return (
              <PeriodDivider
                key={`period-${item.period}-${index}`}
                label={item.label}
                period={item.period}
                periodFoulCounts={periodFoulCounts}
                teamAId={teamAId}
                teamBId={teamBId}
              />
            );
          }

          const entry = item.entry;
          const isGoal = isStrictGoalActionType(entry.action_type);
          const assistSurname = isGoal
            ? assistSurnameForGoal(actions, entry, athleteSurnameLabel)
            : null;

          return (
            <TimelineRow
              key={entry.id}
              entry={entry}
              isHome={entry.team_id === teamAId}
              assistSurname={assistSurname}
              subline={eventSubline(entry)}
              onOpen={handleOpen}
            />
          );
        })}
      </ul>

      {popover && (
        <MatchActionPopover
          rows={popover.rows}
          anchorRect={popover.rect}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
