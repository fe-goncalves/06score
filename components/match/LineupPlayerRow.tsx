import Link from "next/link";
import { MatchEventIcon } from "@/components/match/icons/MatchEventIcon";
import { OrgImage } from "@/components/ui/OrgImage";
import {
  buildAthleteActionIcons,
  getAthleteMatchActions,
  substitutionMinuteLabel,
  substitutionSubline,
} from "@/lib/match/lineupList";
import { isSubstitutionActionType } from "@/lib/match/actionTypes";
import { MatchRatingBadge } from "@/components/match/MatchRatingBadge";
import type { MatchAction, MatchLineup } from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

interface LineupPlayerRowProps {
  lineup: MatchLineup;
  actions: MatchAction[];
  rating: number | null;
}

export function LineupPlayerRow({
  lineup,
  actions,
  rating,
}: LineupPlayerRowProps) {
  const athlete = lineup.athletes;
  if (!athlete) return null;

  const surname = athleteSurnameLabel(athlete.full_name, athlete.surname);
  const icons = buildAthleteActionIcons(lineup.athlete_id, actions);
  const subAction = getAthleteMatchActions(lineup.athlete_id, actions).find(
    (a) => isSubstitutionActionType(a.action_type),
  );
  const subline = subAction ? substitutionSubline(subAction) : null;
  const subMinute = subAction ? substitutionMinuteLabel(subAction) : null;
  const ratingValue =
    rating != null && Number.isFinite(rating) ? rating : null;

  return (
    <li className="match-lineup-row">
      <Link href={`/atletas/${lineup.athlete_id}`} className="match-lineup-row-link">
        <OrgImage
          src={athlete.photo_url}
          alt=""
          width={40}
          height={40}
          className="match-lineup-photo"
        />
        <div className="match-lineup-row-body">
          <div className="match-lineup-row-top">
            <span className="match-lineup-surname">
              {surname}
              {lineup.is_captain && (
                <span className="match-lineup-captain"> (c)</span>
              )}
            </span>
            {icons.length > 0 && (
              <span className="match-lineup-icons" aria-hidden>
                {icons.map((kind, index) => (
                  <MatchEventIcon
                    key={`${kind}-${index}`}
                    action={{ action_type: "goal" }}
                    iconKind={kind}
                    size={14}
                  />
                ))}
              </span>
            )}
          </div>
          {subline && subAction && (
            <span className="match-lineup-subline">
              <MatchEventIcon
                action={subAction}
                iconKind="substitution"
                size={14}
                className="match-lineup-sub-icon"
              />
              {subMinute && (
                <span className="match-lineup-sub-minute">{subMinute}</span>
              )}
              <span className="match-lineup-sub-text">{subline}</span>
            </span>
          )}
        </div>
        {ratingValue != null && <MatchRatingBadge rating={ratingValue} />}
      </Link>
    </li>
  );
}
