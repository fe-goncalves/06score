import type { Match, Matchup } from "@/lib/types";

export interface RoundGroup {
  id: string;
  label: string;
  order: number;
  matches: Match[];
}

export function buildRoundGroups(
  matches: Match[],
  matchups: Matchup[],
): RoundGroup[] {
  const map: Record<string, RoundGroup> = {};

  for (const m of matches) {
    let key: string;
    let order = 0;

    if (m.rounds?.custom_label ?? m.rounds?.name) {
      key = m.rounds?.custom_label ?? m.rounds?.name ?? "Sem rodada";
      order = m.rounds?.display_order ?? 0;
    } else if (m.matchup_id) {
      const mu = matchups.find((x) => x.id === m.matchup_id);
      key =
        mu?.round_label ??
        m.phases?.custom_label ??
        m.phases?.full_name ??
        "Sem rodada";
      order = mu?.display_order ?? 0;
    } else {
      key = m.phases?.custom_label ?? m.phases?.full_name ?? "Sem rodada";
      order = 0;
    }

    const id = `${order}:${key}`;
    if (!map[id]) map[id] = { id, label: key, order, matches: [] };
    map[id].matches.push(m);
  }

  return Object.values(map).sort(
    (a, b) => a.order - b.order || a.label.localeCompare(b.label),
  );
}
