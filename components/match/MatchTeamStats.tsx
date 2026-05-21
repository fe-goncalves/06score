import type { Match, MatchAction, MatchTeamStatsRow } from "@/lib/types";

interface MatchTeamStatsProps {
  match: Match;
  actions: MatchAction[];
  teamAId: string;
}

function countStats(
  actions: MatchAction[],
  teamId: string,
): MatchTeamStatsRow {
  let goals = 0;
  let yellow_cards = 0;
  let red_cards = 0;
  let fouls = 0;

  for (const a of actions) {
    if (a.team_id !== teamId) continue;
    const t = a.action_type.toLowerCase();
    if (t === "goal" && !a.is_own_goal) goals += 1;
    if (t === "goal" && a.is_own_goal) continue;
    if (t === "yellow_card") yellow_cards += 1;
    if (
      t === "red_card" ||
      t === "yellow_red_card" ||
      t === "red_yellow_card"
    ) {
      red_cards += 1;
    }
    if (t === "foul") fouls += 1;
  }

  return { goals, yellow_cards, red_cards, fouls };
}

const STAT_ROWS: { key: keyof MatchTeamStatsRow; label: string }[] = [
  { key: "goals", label: "Gols" },
  { key: "yellow_cards", label: "Cartões amarelos" },
  { key: "red_cards", label: "Cartões vermelhos" },
  { key: "fouls", label: "Faltas" },
];

export function MatchTeamStats({
  match,
  actions,
  teamAId,
}: MatchTeamStatsProps) {
  const teamBId = match.team_b_id ?? "";
  const statsA = countStats(actions, teamAId);
  const statsB = countStats(actions, teamBId);
  const nameA = match.teams_a?.short_name ?? match.teams_a?.full_name ?? "A";
  const nameB = match.teams_b?.short_name ?? match.teams_b?.full_name ?? "B";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-white/50">
            <th className="py-3 text-left">Estatística</th>
            <th className="py-3 text-center">{nameA}</th>
            <th className="py-3 text-center">{nameB}</th>
          </tr>
        </thead>
        <tbody>
          {STAT_ROWS.map(({ key, label }) => (
            <tr
              key={key}
              className="border-b border-white/[0.04] tabular-nums"
            >
              <td className="py-3 text-white/70">{label}</td>
              <td className="py-3 text-center font-bold">{statsA[key]}</td>
              <td className="py-3 text-center font-bold">{statsB[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
