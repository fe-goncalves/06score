"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import type { OrgVenue } from "@/lib/types";

interface ArenaHubHeaderProps {
  venue: OrgVenue;
  matchCount: number;
}

function locationLine(venue: OrgVenue): string | null {
  const parts = [venue.address, venue.city, venue.state].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function ArenaHubHeader({ venue, matchCount }: ArenaHubHeaderProps) {
  const accent = "var(--color-brand)";
  const location = locationLine(venue);

  return (
    <header
      className="match-hub-header athlete-hub-header arena-hub-header"
      style={
        {
          "--match-accent": accent,
          "--athlete-accent": accent,
          "--athlete-team-primary": accent,
        } as CSSProperties
      }
    >
      <div className="athlete-hub-header-bg" aria-hidden />

      <div className="match-hub-header-content athlete-hub-header-content">
        <nav className="match-hub-breadcrumb athlete-hub-breadcrumb" aria-label="Navegação">
          <Link href="/arenas" className="match-hub-breadcrumb-link">
            Arenas
          </Link>
          <span className="match-hub-breadcrumb-sep" aria-hidden>
            ›
          </span>
          <span className="match-hub-breadcrumb-current">{venue.full_name}</span>
        </nav>

        <div className="athlete-hub-hero arena-hub-hero">
          {venue.image_url ? (
            <OrgImage
              src={venue.image_url}
              alt={venue.full_name}
              width={96}
              height={64}
              className="arena-hub-photo"
            />
          ) : (
            <div className="arena-hub-photo arena-hub-photo--placeholder" aria-hidden>
              <span className="arena-hub-photo-icon">⚽</span>
            </div>
          )}

          <div className="athlete-hub-identity">
            <h1 className="athlete-hub-surname">{venue.full_name}</h1>
            {location ? <p className="arena-hub-location">{location}</p> : null}
            <p className="arena-hub-meta">
              {matchCount}{" "}
              {matchCount === 1 ? "jogo realizado neste local" : "jogos realizados neste local"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
