"use client";

import { LiquidGlassListRow } from "@/components/ui/LiquidGlassListRow";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Team } from "@/lib/types";

interface TeamHorizontalCardProps {
  team: Team & { id: string };
  index: number;
}

function teamAbbreviation(team: Team): string {
  return (
    team.abbreviation?.trim() ||
    team.short_name?.trim()?.slice(0, 3).toUpperCase() ||
    team.full_name.slice(0, 3).toUpperCase()
  );
}

export function TeamHorizontalCard({ team }: TeamHorizontalCardProps) {
  const accent = team.primary_color ?? "var(--color-brand)";
  const abbr = teamAbbreviation(team);
  const title = (team.short_name?.trim() || team.full_name).toUpperCase();
  const showFullName =
    Boolean(team.full_name?.trim()) &&
    team.full_name.trim().toLowerCase() !==
      (team.short_name?.trim() || "").toLowerCase();

  return (
    <LiquidGlassListRow
      href={`/times/${team.id}`}
      accentColor={accent}
      dashHover
    >
      <TeamLogo
        team={team}
        size={56}
        className="liquid-glass-list-logo liquid-glass-list-logo--lg object-contain"
      />
      <span className="liquid-glass-list-info">
        <span className="liquid-glass-list-name liquid-glass-list-name--strong">
          {title}
        </span>
        <span className="liquid-glass-list-muted liquid-glass-list-muted--meta">
          <span className="liquid-glass-list-tag">{abbr}</span>
          {showFullName ? (
            <>
              <span className="liquid-glass-list-meta-sep" aria-hidden>
                ·
              </span>
              <span>{team.full_name}</span>
            </>
          ) : null}
        </span>
      </span>
    </LiquidGlassListRow>
  );
}
