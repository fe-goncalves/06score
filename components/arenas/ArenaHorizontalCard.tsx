"use client";

import { EntityAvatar } from "@/components/ui/EntityAvatar";
import { LiquidGlassListRow } from "@/components/ui/LiquidGlassListRow";
import { venueShortName } from "@/lib/venue/display";
import type { OrgVenue } from "@/lib/types";

interface ArenaHorizontalCardProps {
  venue: OrgVenue;
  index: number;
}

export function ArenaHorizontalCard({ venue }: ArenaHorizontalCardProps) {
  const shortLabel = venueShortName(venue);
  const title = (venue.short_name?.trim() || shortLabel).toUpperCase();
  const showFullName =
    venue.full_name.trim().toLowerCase() !== title.trim().toLowerCase();
  const location = [venue.city, venue.state].filter(Boolean).join(" · ");

  return (
    <LiquidGlassListRow href={`/arenas/${venue.id}`} accentColor="var(--color-brand)">
      <EntityAvatar
        kind="arena"
        src={venue.logo_url ?? venue.image_url}
        alt={venue.full_name}
        size={56}
        className="liquid-glass-list-photo--lg"
      />
      <span className="liquid-glass-list-info">
        <span className="liquid-glass-list-name liquid-glass-list-name--strong">
          {title}
        </span>
        <span className="liquid-glass-list-muted liquid-glass-list-muted--meta">
          {showFullName ? <span>{venue.full_name}</span> : null}
          {showFullName && location ? (
            <span className="liquid-glass-list-meta-sep" aria-hidden>
              ·
            </span>
          ) : null}
          {location ? <span>{location}</span> : null}
          {!showFullName && !location ? <span>—</span> : null}
        </span>
      </span>
    </LiquidGlassListRow>
  );
}
