import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Match } from "@/lib/types";
import { formatHeroMatchDate, formatMatchPhaseRoundLabel } from "@/lib/utils";

interface HeroNextMatchRowProps {
  match: Match;
  index: number;
}

function getCompetition(match: Match) {
  return match.phases?.competition_editions?.competitions ?? null;
}

export function HeroNextMatchRow({ match, index }: HeroNextMatchRowProps) {
  const teamA = match.teams_a;
  const teamB = match.teams_b;
  const competition = getCompetition(match);
  const accent =
    match.teams_a?.primary_color ??
    match.teams_b?.primary_color ??
    "var(--color-brand)";

  const phaseRoundLabel = formatMatchPhaseRoundLabel(match);

  return (
    <Link
      href={`/jogos/${match.id}`}
      className="hero-next-match-row group"
      style={{ "--row-accent": accent } as CSSProperties}
    >
      <span className="hero-next-match-row-glow" aria-hidden />
      <div className="hero-next-match-row-body">
        <div className="hero-next-match-logos">
          <TeamLogo team={teamA} index={index * 2} size={34} className="shrink-0" />
          <span className="hero-next-match-vs" aria-hidden>
            ×
          </span>
          <TeamLogo
            team={teamB}
            index={index * 2 + 1}
            size={34}
            className="shrink-0"
          />
        </div>
        <div className="hero-next-match-meta min-w-0 flex-1">
          <time className="hero-next-match-date">
            {formatHeroMatchDate(match.match_date, match.match_time)}
          </time>
          <p className="hero-next-match-names truncate">{phaseRoundLabel}</p>
        </div>
        {competition?.logo_url ? (
          <OrgImage
            src={competition.logo_url}
            alt={competition.short_name ?? competition.full_name}
            width={28}
            height={28}
            className="hero-next-match-comp-logo shrink-0"
          />
        ) : null}
      </div>
    </Link>
  );
}
