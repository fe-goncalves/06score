import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { HomeSponsor } from "@/lib/types";

interface SponsorsSectionProps {
  sponsors: HomeSponsor[];
}

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  const visibleSponsors = sponsors.filter((sponsor) => sponsor.logo_url);

  if (!visibleSponsors.length) {
    return null;
  }

  return (
    <SectionEnter className="sponsors-section py-5 md:py-6">
      <div className="page-container">
        <div className="sponsors-divider" />
        <p className="sponsors-label">Patrocinadores</p>

        <div className="sponsors-grid">
          {visibleSponsors.map((sponsor) => {
            const logo = (
              <OrgImage
                src={sponsor.logo_url}
                alt=""
                width={140}
                height={48}
                className="sponsor-logo"
              />
            );

            if (sponsor.link_url) {
              return (
                <a
                  key={sponsor.id}
                  href={sponsor.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-item"
                  aria-label={sponsor.name}
                >
                  {logo}
                </a>
              );
            }

            return (
              <div key={sponsor.id} className="sponsor-item" aria-label={sponsor.name}>
                {logo}
              </div>
            );
          })}
        </div>
      </div>
    </SectionEnter>
  );
}
