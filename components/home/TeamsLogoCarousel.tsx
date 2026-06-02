"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { TeamLogo } from "@/components/ui/TeamLogo";
import type { Organization, Team } from "@/lib/types";

interface TeamsLogoCarouselProps {
  teams: Team[];
  org: Organization;
}

export function TeamsLogoCarousel({ teams, org }: TeamsLogoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const loopTeams = teams.length ? [...teams, ...teams] : [];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || teams.length < 3 || window.innerWidth < 768) return;

    let pos = 0;
    let frame = 0;
    const half = track.scrollWidth / 2;

    const tick = () => {
      pos += 0.4;
      if (half > 0 && pos >= half) pos = 0;
      track.scrollLeft = pos;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [teams.length]);

  if (!teams.length) return null;

  return (
    <SectionEnter className="teams-logo-carousel-section py-10 md:py-14">
      <div className="teams-logo-carousel relative overflow-x-auto md:overflow-hidden">
        <div
          ref={trackRef}
          className="teams-logo-carousel-track flex items-center gap-10 md:gap-14"
        >
          {loopTeams.map((team, i) => {
            const href = team.id ? `/times/${team.id}` : "#";
            return (
              <Link
                key={`${team.id ?? "t"}-${i}`}
                href={href}
                className="teams-carousel-item shrink-0"
              >
                <TeamLogo team={team} index={i} size={44} />
              </Link>
            );
          })}
        </div>

        <div className="teams-logo-carousel-center pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          <div className="teams-carousel-org-center card-surface flex h-[88px] w-[88px] items-center justify-center rounded-full md:h-[104px] md:w-[104px]">
            <OrgImage
              src={org.logo_url}
              alt={org.name}
              width={64}
              height={64}
              className="h-12 w-12 object-contain md:h-16 md:w-16"
            />
          </div>
        </div>
      </div>
    </SectionEnter>
  );
}
