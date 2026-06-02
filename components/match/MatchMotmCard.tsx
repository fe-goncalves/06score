import Link from "next/link";
import type { CSSProperties } from "react";
import { MatchRatingBadge } from "@/components/match/MatchRatingBadge";
import { OrgImage } from "@/components/ui/OrgImage";
import { motmTeamLabel, resolveMotmRating } from "@/lib/match/motm";
import type {
  Match,
  MatchAthleteRating,
  MatchLineup,
} from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

interface MatchMotmCardProps {
  match: Match;
  ratings: MatchAthleteRating[];
  lineups: MatchLineup[];
  accentColor?: string | null;
}

function MotmStarIcon() {
  return (
    <span className="match-motm-star" aria-hidden>
      <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
        <path d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.6z" />
      </svg>
    </span>
  );
}

export function MatchMotmCard({
  match,
  ratings,
  lineups,
  accentColor,
}: MatchMotmCardProps) {
  const athleteId = match.motm_athlete_id;
  const athlete = match.motm_athlete;
  if (!athleteId || !athlete) return null;

  const team =
    match.motm_team ??
    lineups.find((l) => l.athlete_id === athleteId)?.edition_teams?.teams ??
    null;

  const rating = resolveMotmRating(athleteId, ratings, lineups);
  const displayName = athleteSurnameLabel(athlete.full_name, athlete.surname);
  const teamName = team ? motmTeamLabel(team) : null;
  const teamId = team?.id ?? match.motm_team_id ?? null;
  const accent = accentColor ?? "var(--color-brand)";

  return (
    <article
      className="match-motm-card"
      style={{ "--match-motm-accent": accent } as CSSProperties}
      aria-label={`Craque do jogo: ${displayName}`}
    >
      <header className="match-motm-card-head">
        <MotmStarIcon />
        <h2 className="match-motm-card-title">Craque do jogo</h2>
      </header>

      <div className="match-motm-card-body">
        <div className="match-motm-athlete">
          <Link href={`/atletas/${athleteId}`} className="match-motm-photo-link">
            <OrgImage
              src={athlete.photo_url}
              alt=""
              width={48}
              height={48}
              className="match-motm-photo"
            />
          </Link>
          <div className="match-motm-info">
            <Link href={`/atletas/${athleteId}`} className="match-motm-name">
              {displayName}
            </Link>
            {teamName && teamId ? (
              <Link href={`/times/${teamId}`} className="match-motm-team">
                {team.logo_url && (
                  <OrgImage
                    src={team.logo_url}
                    alt=""
                    width={16}
                    height={16}
                    className="match-motm-team-logo"
                  />
                )}
                <span>{teamName}</span>
              </Link>
            ) : teamName ? (
              <span className="match-motm-team">
                <span>{teamName}</span>
              </span>
            ) : null}
          </div>
        </div>

        {rating != null && (
          <div className="match-motm-rating-wrap">
            <MatchRatingBadge rating={rating} />
          </div>
        )}
      </div>
    </article>
  );
}
