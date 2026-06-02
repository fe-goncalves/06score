import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import type { OrgVenue } from "@/lib/types";

interface ArenaGlassCardProps {
  venue: OrgVenue;
  index: number;
}

function locationLine(venue: OrgVenue): string | null {
  const parts = [venue.address, venue.city, venue.state].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function ArenaGlassCard({ venue, index }: ArenaGlassCardProps) {
  const accent = "var(--color-brand)";
  const location = locationLine(venue);
  const matchCount =
    (venue.upcoming_matches ?? 0) + (venue.recent_matches ?? 0);

  const card = (
    <article
      id={venue.id ? `venue-${venue.id}` : undefined}
      className="arena-glass-card scroll-mt-24"
      style={{ "--arena-accent": accent } as CSSProperties}
    >
      <div className="arena-glass-card-inner">
        <div className="arena-glass-card-glow" aria-hidden />
        {venue.image_url ? (
          <div className="relative z-[1] mb-1 aspect-[16/9] overflow-hidden rounded-md border border-white/[0.08] bg-black/30">
            <OrgImage
              src={venue.image_url}
              alt={venue.full_name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="arena-glass-card-icon" aria-hidden>
            {String(index + 1).padStart(2, "0")}
          </div>
        )}
        <h3 className="arena-glass-card-name">{venue.full_name}</h3>
        {location ? (
          <p className="arena-glass-card-address">{location}</p>
        ) : null}
        {matchCount > 0 ? (
          <p className="arena-glass-card-meta">
            {matchCount} {matchCount === 1 ? "partida" : "partidas"} registradas
          </p>
        ) : null}
      </div>
    </article>
  );

  if (!venue.id) return card;

  return (
    <Link href={`/arenas/${venue.id}`} className="arena-glass-card-link">
      {card}
    </Link>
  );
}
