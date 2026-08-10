"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { MatchIcon } from "@/components/match/icons/MatchIcon";
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

function venueLogo(venue: OrgVenue): string | null {
  return venue.logo_url?.trim() || venue.image_url?.trim() || null;
}

export function ArenaHubHeader({ venue, matchCount }: ArenaHubHeaderProps) {
  const accent = "var(--color-brand)";
  const location = locationLine(venue);
  const logo = venueLogo(venue);

  return (
    <header
      className="match-hub-header athlete-hub-header athlete-hub-header--centered arena-hub-header"
      style={
        {
          "--match-accent": accent,
          "--athlete-accent": accent,
          "--athlete-team-primary": accent,
        } as CSSProperties
      }
    >
      <div className="athlete-hub-header-bg arena-hub-header-bg" aria-hidden>
        {logo ? (
          <div
            className="athlete-hub-header-wash arena-hub-header-wash"
            style={{ backgroundImage: `url(${logo})` }}
          />
        ) : null}
      </div>

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

        <div className="athlete-hub-hero athlete-hub-hero--centered arena-hub-hero">
          {logo ? (
            <OrgImage
              src={logo}
              alt={venue.full_name}
              width={96}
              height={96}
              className="arena-hub-photo"
            />
          ) : (
            <div className="arena-hub-photo arena-hub-photo--placeholder" aria-hidden>
              <MatchIcon name="stadium" size={36} tinted className="arena-hub-photo-icon" />
            </div>
          )}

          <div className="athlete-hub-identity athlete-hub-identity--centered">
            <h1 className="athlete-hub-surname">{venue.full_name}</h1>
            {location ? <p className="arena-hub-location">{location}</p> : null}
            <p className="arena-hub-meta">
              {matchCount}{" "}
              {matchCount === 1
                ? "jogo realizado neste local"
                : "jogos realizados neste local"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
