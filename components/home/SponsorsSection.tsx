import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { HomeSponsor } from "@/lib/types";

interface SponsorsSectionProps {
  sponsors: HomeSponsor[];
}

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  if (!sponsors.length) return null;

  return (
    <SectionEnter className="sponsors-section py-10 md:py-14">
      <div className="page-container">
        <div className="sponsors-divider" />
        <p className="sponsors-label">Patrocinadores</p>
        <div className="sponsors-grid">
          {sponsors.map((sponsor) => {
            const inner = sponsor.logo_url ? (
              <OrgImage
                src={sponsor.logo_url}
                alt={sponsor.name}
                width={120}
                height={48}
                className="sponsor-logo"
              />
            ) : (
              <span className="sponsor-name-text">{sponsor.name}</span>
            );

            if (sponsor.website_url) {
              return (
                <a
                  key={sponsor.id}
                  href={sponsor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-item"
                  title={sponsor.name}
                >
                  {inner}
                </a>
              );
            }

            return (
              <div key={sponsor.id} className="sponsor-item" title={sponsor.name}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </SectionEnter>
  );
}
