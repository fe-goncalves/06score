"use client";

import Link from "next/link";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Team } from "@/lib/types";

interface TeamsLogoCarouselProps {
  teams: Team[];
}

export function TeamsLogoCarousel({ teams }: TeamsLogoCarouselProps) {
  if (!teams.length) return null;

  return (
    <SectionEnter className="teams-logo-carousel-section py-4 md:py-5">
      <div className="page-container">
        <div className="teams-logo-carousel overflow-x-auto scroll-smooth">
          <div className="teams-logo-carousel-track">
            {teams.map((team, i) => {
              const href = team.id ? `/times/${team.id}` : "#";
              return (
                <Link
                  key={team.id ?? i}
                  href={href}
                  className="teams-carousel-item shrink-0 snap-center"
                  aria-label={team.full_name}
                >
                  <TeamLogo team={team} index={i} size={40} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </SectionEnter>
  );
}
