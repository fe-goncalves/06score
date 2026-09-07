import type { Athlete, PlayerPosition } from "@/lib/types";
import { getPositionName } from "@/lib/utils";

export type SquadPositionBucket = "GK" | "DEF" | "MID" | "ATK" | "OTHER";

const BUCKET_ORDER: Record<SquadPositionBucket, number> = {
  GK: 0,
  DEF: 1,
  MID: 2,
  ATK: 3,
  OTHER: 4,
};

export function squadPositionBucket(
  positions: PlayerPosition | PlayerPosition[] | null | undefined,
): SquadPositionBucket {
  const raw = getPositionName(positions).toLowerCase();
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
  if (raw === "—" || !raw.trim()) return "OTHER";
  return "MID";
}

const BUCKET_LABELS: Record<SquadPositionBucket, string> = {
  GK: "Goleiros",
  DEF: "Defensores",
  MID: "Meio-campistas",
  ATK: "Atacantes",
  OTHER: "Outros",
};

/** Lista única: goleiros → defensores → meio → ataque; dentro do grupo, sobrenome A–Z. */
export function sortSquadByPosition(
  squad: (Athlete & { id: string })[],
): (Athlete & { id: string })[] {
  return [...squad].sort((a, b) => {
    const bucketA = BUCKET_ORDER[squadPositionBucket(a.player_positions)];
    const bucketB = BUCKET_ORDER[squadPositionBucket(b.player_positions)];
    if (bucketA !== bucketB) return bucketA - bucketB;
    return (a.surname ?? a.full_name).localeCompare(
      b.surname ?? b.full_name,
      "pt-BR",
    );
  });
}

/** Agrupa elenco por posição (ordem de linha) com nomes A–Z dentro de cada grupo. */
export function groupSquadByPosition(
  squad: (Athlete & { id: string })[],
): { bucket: SquadPositionBucket; label: string; players: (Athlete & { id: string })[] }[] {
  const sorted = sortSquadByPosition(squad);
  const groups: {
    bucket: SquadPositionBucket;
    label: string;
    players: (Athlete & { id: string })[];
  }[] = [];
  const indexByBucket = new Map<SquadPositionBucket, number>();

  for (const player of sorted) {
    const bucket = squadPositionBucket(player.player_positions);
    let idx = indexByBucket.get(bucket);
    if (idx === undefined) {
      idx = groups.length;
      indexByBucket.set(bucket, idx);
      groups.push({
        bucket,
        label: BUCKET_LABELS[bucket],
        players: [],
      });
    }
    groups[idx]!.players.push(player);
  }

  return groups;
}

export function positionAbbreviation(
  positions: PlayerPosition | PlayerPosition[] | null | undefined,
): string | null {
  const list = Array.isArray(positions)
    ? positions
    : positions
      ? [positions]
      : [];
  const abbr = list
    .map((p) => p.abbreviation?.trim())
    .find((value) => value);
  if (abbr) return abbr.toUpperCase();
  const name = getPositionName(positions);
  if (name === "—" || !name.trim()) return null;
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function squadHasNationality(squad: (Athlete & { id: string })[]): boolean {
  return squad.some((p) => p.nationality?.trim());
}

export function squadHasBirthData(squad: (Athlete & { id: string })[]): boolean {
  return squad.some((p) => p.birth_date);
}
