/** Ex.: `8/10 (80%)` ou `—` se nunca cobrou. */
export function formatRate(scored: number, taken: number): string {
  if (taken <= 0) return "—";
  const pct = Math.round((scored / taken) * 100);
  return `${scored}/${taken} (${pct}%)`;
}
