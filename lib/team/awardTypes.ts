export const COLLECTIVE_TEAM_AWARD_TYPES = new Set([
  "champion",
  "runner_up",
  "third_place",
  "fourth_place",
  "fifth_place",
  "sixth_place",
  "seventh_place",
  "eighth_place",
  "ninth_place",
  "tenth_place",
  "relegated",
]);

export function isCollectiveTeamAwardType(awardType: string): boolean {
  return COLLECTIVE_TEAM_AWARD_TYPES.has(awardType);
}

export function teamAwardLabel(value: string): string {
  const map: Record<string, string> = {
    champion: "Campeão",
    runner_up: "Vice-campeão",
    third_place: "Terceiro lugar",
    mvp: "MVP",
    top_scorer: "Artilheiro",
    top_assists: "Garçom",
    best_goalkeeper: "Melhor goleiro",
    revelation: "Revelação",
    best_coach: "Melhor técnico",
  };
  return map[value] ?? value.replace(/_/g, " ");
}

export function teamGenderLabel(gender: string | null | undefined): string {
  if (!gender?.trim()) return "—";
  const g = gender.trim().toLowerCase();
  if (g === "male" || g === "m" || g === "masculino") return "Masculino";
  if (g === "female" || g === "f" || g === "feminino") return "Feminino";
  if (g === "mixed" || g === "misto" || g === "mix") return "Misto";
  return gender;
}
