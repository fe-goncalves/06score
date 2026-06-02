import Link from "next/link";
import { AthleteSection } from "@/components/athlete/AthleteSection";
import { MatchRatingBadge } from "@/components/match/MatchRatingBadge";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AthleteRecentMatch } from "@/lib/types";
import {
  formatMatchDateTime,
  formatMatchPhaseRoundLabel,
  isMatchFinished,
} from "@/lib/utils";

interface AthleteMatchesPanelProps {
  matches: AthleteRecentMatch[];
}

function competitionLabel(entry: AthleteRecentMatch): string | null {
  const m = entry.match;
  const comp = m.phases?.competition_editions?.competitions;
  if (comp?.full_name) return comp.full_name;
  return formatMatchPhaseRoundLabel(m) || null;
}

export function AthleteMatchesPanel({ matches }: AthleteMatchesPanelProps) {
  return (
    <AthleteSection title="Partidas recentes" titleId="athlete-matches-title">
      {!matches.length ? (
        <p className="athlete-empty-state">Nenhuma partida registrada.</p>
      ) : (
        <ul className="athlete-matches-list">
          {matches.map(({ match, rating, isMotm }, index) => {
            const finished = isMatchFinished(match.status);
            const comp = competitionLabel({ match, rating, isMotm });

            return (
              <li
                key={match.id}
                className="athlete-match-item"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link href={`/jogos/${match.id}`} className="athlete-match-row">
                  <div className="athlete-match-teams-col">
                    <div className="athlete-match-team-chip">
                      <TeamLogo team={match.teams_a} index={0} size={28} />
                      <span className="athlete-match-team-name">
                        {match.teams_a?.abbreviation ??
                          match.teams_a?.short_name ??
                          "—"}
                      </span>
                    </div>
                    <span className="athlete-match-vs">×</span>
                    <div className="athlete-match-team-chip">
                      <TeamLogo team={match.teams_b} index={1} size={28} />
                      <span className="athlete-match-team-name">
                        {match.teams_b?.abbreviation ??
                          match.teams_b?.short_name ??
                          "—"}
                      </span>
                    </div>
                  </div>

                  <div className="athlete-match-meta-col">
                    <p className="athlete-match-date">
                      {formatMatchDateTime(match.match_date, match.match_time)}
                    </p>
                    {comp && <p className="athlete-match-comp">{comp}</p>}
                  </div>

                  <div className="athlete-match-aside">
                    {isMotm && (
                      <span className="athlete-match-motm" title="Craque do jogo">
                        ★ Craque
                      </span>
                    )}
                    {rating != null && (
                      <MatchRatingBadge rating={rating} />
                    )}
                    {finished ? (
                      <span className="athlete-match-score">
                        {match.score_a ?? 0}
                        <span className="athlete-match-score-sep">:</span>
                        {match.score_b ?? 0}
                      </span>
                    ) : (
                      <StatusBadge status={match.status} />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AthleteSection>
  );
}
