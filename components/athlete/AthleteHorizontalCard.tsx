"use client";

import { LiquidGlassListRow } from "@/components/ui/LiquidGlassListRow";
import { AthletePhotoPlaceholder } from "@/components/ui/AthletePhotoPlaceholder";
import { OrgImage } from "@/components/ui/OrgImage";
import { positionAbbreviation } from "@/lib/team/squadDisplay";
import type { AthleteListItem } from "@/lib/types";
import { athleteSurnameLabel } from "@/lib/utils";

interface AthleteHorizontalCardProps {
  athlete: AthleteListItem;
  index: number;
}

export function AthleteHorizontalCard({ athlete }: AthleteHorizontalCardProps) {
  const accent = athlete.current_team?.primary_color ?? "var(--color-brand)";
  const nickname = athleteSurnameLabel(athlete.full_name, athlete.surname);
  const team = athlete.current_team;
  const teamLabel =
    team?.short_name?.trim() ||
    team?.abbreviation?.trim() ||
    team?.full_name?.trim() ||
    null;
  const position = positionAbbreviation(athlete.player_positions);

  return (
    <LiquidGlassListRow href={`/atletas/${athlete.id}`} accentColor={accent}>
      {athlete.photo_url ? (
        <OrgImage
          src={athlete.photo_url}
          alt={athlete.full_name}
          width={56}
          height={56}
          className="liquid-glass-list-photo liquid-glass-list-photo--lg"
        />
      ) : (
        <span
          className="liquid-glass-list-photo-placeholder liquid-glass-list-photo--lg"
          aria-hidden
        >
          <AthletePhotoPlaceholder className="liquid-glass-list-photo-icon" />
        </span>
      )}
      <span className="liquid-glass-list-info">
        <span className="liquid-glass-list-name liquid-glass-list-name--strong">
          {nickname.toUpperCase()}
        </span>
        <span className="liquid-glass-list-muted liquid-glass-list-muted--meta">
          {team ? (
            <span className="liquid-glass-list-team-chip">
              {team.logo_url ? (
                <OrgImage
                  src={team.logo_url}
                  alt=""
                  width={16}
                  height={16}
                  className="liquid-glass-list-chip-logo"
                />
              ) : null}
              <span>{teamLabel}</span>
            </span>
          ) : (
            <span>—</span>
          )}
          {position ? (
            <>
              <span className="liquid-glass-list-meta-sep" aria-hidden>
                |
              </span>
              <span className="liquid-glass-list-position">{position}</span>
            </>
          ) : null}
        </span>
      </span>
    </LiquidGlassListRow>
  );
}
