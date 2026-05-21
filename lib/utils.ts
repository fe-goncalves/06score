export function formatMatchDateTime(
  matchDate: string,
  matchTime: string | null,
): string {
  const date = new Date(`${matchDate}T${matchTime ?? "00:00:00"}`);
  const datePart = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  if (!matchTime) return datePart;
  const timePart = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

export function formatPublishedDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function athleteDisplayName(
  fullName: string,
  surname: string | null,
): string {
  return surname ? `${fullName} ${surname}` : fullName;
}

export function isMatchFinished(status: string): boolean {
  const s = status.toLowerCase();
  return s === "finished" || s === "finalizado" || s === "ended" || s === "ft";
}
