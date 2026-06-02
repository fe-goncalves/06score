import {
  slotPosition,
  TOTW_FORMATIONS,
  type TotwFormationKey,
} from "@/lib/totw/formations";
import type { Athlete, MatchLineup } from "@/lib/types";
import { athleteDisplayName, getPositionName } from "@/lib/utils";

export interface PitchPlayer {
  athleteId: string;
  name: string;
  photoUrl: string | null;
  rating: number | null;
  isCaptain: boolean;
  isGoalkeeper: boolean;
  x: number;
  y: number;
}

type PositionBucket = "GK" | "DEF" | "MID" | "ATK";

function positionBucket(athlete: Athlete | null): PositionBucket {
  const raw = getPositionName(athlete?.player_positions).toLowerCase();
  if (raw.includes("goleir") || raw.includes("goalkeeper") || raw === "gk") {
    return "GK";
  }
  if (
    raw.includes("zagueir") ||
    raw.includes("def") ||
    raw.includes("lateral") ||
    raw.includes("beir")
  ) {
    return "DEF";
  }
  if (
    raw.includes("atac") ||
    raw.includes("ponta") ||
    raw.includes("striker") ||
    raw.includes("fwd")
  ) {
    return "ATK";
  }
  if (raw.includes("mei") || raw.includes("mid")) return "MID";
  return "MID";
}

function pickFormation(playerCount: number): TotwFormationKey {
  if (playerCount <= 5) return "1-3-2";
  if (playerCount <= 6) return "2-2-2";
  if (playerCount <= 7) return "2-3-1";
  return "3-3";
}

function assignPlayersToFormation(
  players: MatchLineup[],
  ratings: Map<string, number | null>,
): PitchPlayer[] {
  const gks = players.filter((p) => p.played_as_goalkeeper);
  const outfield = players.filter((p) => !p.played_as_goalkeeper);

  const buckets: Record<PositionBucket, MatchLineup[]> = {
    GK: gks,
    DEF: [],
    MID: [],
    ATK: [],
  };

  for (const p of outfield) {
    buckets[positionBucket(p.athletes)].push(p);
  }

  const orderedOutfield = [
    ...buckets.DEF,
    ...buckets.MID,
    ...buckets.ATK,
  ];
  const ordered = [...(gks.length ? gks : []), ...orderedOutfield];
  const count = ordered.length || 1;
  const formationKey = pickFormation(count);
  const slots = TOTW_FORMATIONS[formationKey].slots;

  const byBucket: Record<string, MatchLineup[]> = {
    GK: [...gks],
    DEF: [...buckets.DEF],
    MID: [...buckets.MID],
    ATK: [...buckets.ATK],
    MED: [...buckets.MID],
  };

  const used = new Set<string>();
  const result: PitchPlayer[] = [];

  for (const slot of slots) {
    const label = slot.label === "MED" ? "MID" : slot.label;
    const pool = byBucket[label] ?? [];
    const player = pool.find((p) => !used.has(p.athlete_id));
    if (!player?.athletes) continue;
    used.add(player.athlete_id);
    const { x, y } = slotPosition(slot.col, slot.row, slot.total);
    const athlete = player.athletes;
    result.push({
      athleteId: player.athlete_id,
      name: athleteDisplayName(athlete.full_name, athlete.surname),
      photoUrl: athlete.photo_url,
      rating: ratings.get(player.athlete_id) ?? null,
      isCaptain: player.is_captain,
      isGoalkeeper: player.played_as_goalkeeper,
      x,
      y,
    });
  }

  for (const player of ordered) {
    if (used.has(player.athlete_id) || !player.athletes) continue;
    const athlete = player.athletes;
    result.push({
      athleteId: player.athlete_id,
      name: athleteDisplayName(athlete.full_name, athlete.surname),
      photoUrl: athlete.photo_url,
      rating: ratings.get(player.athlete_id) ?? null,
      isCaptain: player.is_captain,
      isGoalkeeper: player.played_as_goalkeeper,
      x: 0.5,
      y: 0.5,
    });
  }

  return result;
}

export function buildPitchLineup(
  lineups: MatchLineup[],
  ratings: { athlete_id: string; rating: number }[],
): PitchPlayer[] {
  const ratingMap = new Map(
    ratings.map((r) => [r.athlete_id, r.rating] as const),
  );
  return assignPlayersToFormation(lineups, ratingMap);
}

export function formationLabelFromLineup(lineups: MatchLineup[]): string {
  const outfield = lineups.filter((l) => !l.played_as_goalkeeper).length;
  const key = pickFormation(outfield + (lineups.some((l) => l.played_as_goalkeeper) ? 1 : 0));
  return TOTW_FORMATIONS[key].label;
}
