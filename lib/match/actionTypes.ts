/** Normaliza `action_type` / `period` do banco para comparação estável. */
export function normalizeActionType(actionType: string): string {
  return actionType
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "_");
}

export type MatchPeriodHalf = "first" | "second";

export function periodKey(period: string | null | undefined): MatchPeriodHalf | null {
  const p = normalizeActionType(period ?? "");
  if (!p) return null;

  if (
    p === "first" ||
    p === "1" ||
    p === "1t" ||
    p === "1st" ||
    p === "1_half" ||
    p === "first_half" ||
    p === "1o_tempo" ||
    p === "1_tempo" ||
    p.startsWith("1_") ||
    p.includes("primeiro") ||
    p.includes("1o_tempo")
  ) {
    return "first";
  }

  if (
    p === "second" ||
    p === "2" ||
    p === "2t" ||
    p === "2nd" ||
    p === "2_half" ||
    p === "second_half" ||
    p === "2o_tempo" ||
    p === "2_tempo" ||
    p.startsWith("2_") ||
    p.includes("segundo") ||
    p.includes("2o_tempo")
  ) {
    return "second";
  }

  return null;
}

/** Inferência quando `period` não veio no banco (futsal 2×20 min). */
export function inferPeriodFromMinute(
  minute: number | null | undefined,
): MatchPeriodHalf | null {
  if (minute == null) return null;
  return minute <= 20 ? "first" : "second";
}

export function resolveActionPeriod(
  period: string | null | undefined,
  minute: number | null | undefined,
): MatchPeriodHalf | null {
  return periodKey(period) ?? inferPeriodFromMinute(minute);
}

export function periodsMatch(
  a: string | null | undefined,
  b: string | null | undefined,
  minuteA?: number | null,
  minuteB?: number | null,
): boolean {
  const pa = resolveActionPeriod(a ?? null, minuteA ?? null);
  const pb = resolveActionPeriod(b ?? null, minuteB ?? null);
  if (pa && pb) return pa === pb;
  if (!a && !b) return true;
  return normalizeActionType(a ?? "") === normalizeActionType(b ?? "");
}

export function isGoalActionType(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  return t === "goal" || t === "gol" || t === "own_goal" || t === "gol_contra";
}

/** Gol no placar / recap — apenas `action_type = goal` (ignora `goal_type`). */
export function isStrictGoalActionType(actionType: string): boolean {
  return normalizeActionType(actionType) === "goal";
}

export function isPenaltyGoalType(
  goalType: string | null | undefined,
): boolean {
  const gt = normalizeActionType(goalType ?? "");
  return gt === "penalty" || gt === "pen" || gt === "penalti";
}

export function isShootoutGoalType(
  goalType: string | null | undefined,
): boolean {
  const gt = normalizeActionType(goalType ?? "");
  return (
    gt === "shootout" ||
    gt === "shoot_out" ||
    gt === "shoot-out" ||
    gt === "st"
  );
}

export function isPenaltyMissedActionType(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  return t === "penalty_missed" || t === "pen_missed" || t === "penalty_miss";
}

/** Gol contra: flag, `goal_type` ou `action_type` dedicado. */
export function isOwnGoalAction(action: {
  action_type: string;
  goal_type?: string | null;
  is_own_goal?: boolean | null;
}): boolean {
  if (action.is_own_goal === true) return true;
  const gt = normalizeActionType(action.goal_type ?? "");
  if (
    gt === "own_goal" ||
    gt === "gol_contra" ||
    gt === "gc" ||
    gt === "own"
  ) {
    return true;
  }
  const t = normalizeActionType(action.action_type);
  return t === "own_goal" || t === "gol_contra";
}

/** Registro admin com total de faltas do time no período (`minute` = quantidade). */
export function isPeriodFoulSummaryAction(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  return (
    t === "period_fouls" ||
    t === "team_period_fouls" ||
    t === "team_fouls" ||
    t === "fouls_total" ||
    t === "faltas_equipe" ||
    t === "faltas_periodo" ||
    t === "team_foul_count" ||
    t === "foul_count"
  );
}

export function isAssistActionType(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  return (
    t === "assist" ||
    t === "assistencia" ||
    t === "goal_assist" ||
    t === "passe_decisivo" ||
    t === "decisive_pass" ||
    (t.includes("assist") && !t.includes("goalkeeper"))
  );
}

export function isFoulActionType(actionType: string): boolean {
  if (isFifthFoulActionType(actionType)) return false;
  const t = normalizeActionType(actionType);
  return t === "foul" || t === "falta" || t === "team_foul";
}

export function isFifthFoulActionType(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  if (t === "foul" || t === "falta") return false;
  return (
    t === "fifth_foul" ||
    t === "quinta_falta" ||
    t === "5th_foul" ||
    t === "fifth_team_foul" ||
    t === "team_fifth_foul" ||
    t === "quinta_falta_equipe" ||
    t === "falta_5" ||
    t === "5_foul" ||
    (t.includes("quinta") && t.includes("falta")) ||
    (t.includes("fifth") && t.includes("foul")) ||
    t.endsWith("_5") ||
    t.startsWith("5_")
  );
}

export function isYellowCardActionType(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  return t === "yellow_card" || t === "cartao_amarelo" || t === "amarelo";
}

export function isRedCardActionType(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  return (
    t === "red_card" ||
    t === "cartao_vermelho" ||
    t === "vermelho"
  );
}

export function isYellowRedCardActionType(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  return (
    t === "yellow_red_card" ||
    t === "red_yellow_card" ||
    t === "cartao_amarelo_vermelho" ||
    t === "segundo_amarelo" ||
    t === "2nd_yellow"
  );
}

export function isSubstitutionActionType(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  return t === "substitution" || t === "sub" || t === "substituicao";
}

export function isTwoMinActionType(actionType: string): boolean {
  const t = normalizeActionType(actionType);
  return (
    t === "two_min" ||
    t === "2_min" ||
    t === "2min" ||
    t === "suspension" ||
    t === "dois_minutos" ||
    t === "2_minutos"
  );
}

export function countsAsPeriodFoul(actionType: string): boolean {
  return isFoulActionType(actionType) || isFifthFoulActionType(actionType);
}

export function timelineDisplayLabel(
  actionType: string,
  missResult?: string | null,
): string | null {
  if (isFifthFoulActionType(actionType)) return "QUINTA FALTA";
  if (isPenaltyMissedActionType(actionType)) {
    const mr = normalizeActionType(missResult ?? "");
    if (mr === "goalkeeper_save" || mr === "save" || mr === "defended") {
      return "Pênalti defendido";
    }
    return "Pênalti perdido";
  }
  return null;
}
