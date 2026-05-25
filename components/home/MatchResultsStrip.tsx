import { MatchStripCell } from "@/components/home/MatchStripCell";
import type { Match } from "@/lib/types";
import { isMatchLive } from "@/lib/utils";

interface MatchResultsStripProps {
  recent: Match[];
  upcoming: Match[];
}

function sortForStrip(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const aLive = isMatchLive(a.status) ? 0 : 1;
    const bLive = isMatchLive(b.status) ? 0 : 1;
    if (aLive !== bLive) return aLive - bLive;
    const dateCmp = a.match_date.localeCompare(b.match_date);
    if (dateCmp !== 0) return dateCmp;
    return (a.match_time ?? "").localeCompare(b.match_time ?? "");
  });
}

export function MatchResultsStrip({ recent, upcoming }: MatchResultsStripProps) {
  const all = sortForStrip([...recent, ...upcoming]);

  if (!all.length) {
    return (
      <div className="match-results-strip">
        <p className="match-results-strip-empty font-mono-label">
          Nenhuma partida nos últimos 7 ou próximos 30 dias.
        </p>
      </div>
    );
  }

  return (
    <div className="match-results-strip scrollbar-hide" role="region" aria-label="Resultados recentes">
      <div className="match-results-strip-track">
        {all.map((match, i) => (
          <MatchStripCell key={match.id} match={match} index={i} />
        ))}
      </div>
    </div>
  );
}
