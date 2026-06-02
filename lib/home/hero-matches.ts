import type { Match } from "@/lib/types";
import { isMatchUpcoming } from "@/lib/utils";

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Próximos jogos para o hero: todos os campeonatos, janela de N dias. */
export function getHeroUpcomingMatches(
  upcoming: Match[],
  withinDays = 7,
  limit = 3,
): Match[] {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + withinDays);
  const todayIso = toIsoDate(today);
  const endIso = toIsoDate(end);

  return upcoming
    .filter(
      (m) =>
        m.match_date >= todayIso &&
        m.match_date <= endIso &&
        isMatchUpcoming(m),
    )
    .sort((a, b) => {
      const cmp = a.match_date.localeCompare(b.match_date);
      if (cmp !== 0) return cmp;
      return (a.match_time ?? "").localeCompare(b.match_time ?? "");
    })
    .slice(0, limit);
}
