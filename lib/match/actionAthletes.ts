import { findAssistForGoal } from "@/lib/match/assistLink";
import {
  isStrictGoalActionType,
  normalizeActionType,
} from "@/lib/match/actionTypes";
import type { Athlete, MatchAction } from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

export interface ActionAthleteRow {
  athleteId: string | null;
  surname: string;
  role: string;
}

function rowFromAthlete(
  athlete: Athlete | null | undefined,
  role: string,
  athleteId: string | null,
): ActionAthleteRow | null {
  if (!athlete && !athleteId) return null;
  return {
    athleteId,
    surname: athlete
      ? athleteSurnameLabel(athlete.full_name, athlete.surname)
      : "—",
    role,
  };
}

const ACTION_ROLE: Record<string, string> = {
  goal: "Gol",
  gol: "Gol",
  assist: "Assistência",
  assistencia: "Assistência",
  yellow_card: "Cartão amarelo",
  cartao_amarelo: "Cartão amarelo",
  red_card: "Cartão vermelho",
  cartao_vermelho: "Cartão vermelho",
  yellow_red_card: "2º amarelo",
  cartao_amarelo_vermelho: "2º amarelo",
  red_yellow_card: "2º amarelo",
  substitution: "Substituição",
  sub: "Substituição",
  substituicao: "Substituição",
  foul: "Falta",
  falta: "Falta",
  fifth_foul: "Quinta falta",
  quinta_falta: "Quinta falta",
  penalty_missed: "Pênalti perdido",
};

export function getActionAthletes(
  action: MatchAction,
  allActions: MatchAction[],
): ActionAthleteRow[] {
  const type = normalizeActionType(action.action_type);
  const rows: ActionAthleteRow[] = [];

  const primary = rowFromAthlete(
    action.athletes,
    ACTION_ROLE[type] ?? action.action_type,
    action.primary_athlete_id,
  );
  if (primary) rows.push(primary);

  if (isStrictGoalActionType(action.action_type)) {
    const assist = findAssistForGoal(allActions, {
      id: action.id,
      team_id: action.team_id,
      minute: action.minute,
      period: action.period,
      secondary_athlete_id: action.secondary_athlete_id,
      secondary_athletes: action.secondary_athletes,
    });
    const assistRow = rowFromAthlete(
      assist?.athletes,
      "Assistência",
      assist?.primary_athlete_id ?? null,
    );
    if (assistRow) rows.push(assistRow);
  }

  return rows;
}
