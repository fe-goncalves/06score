import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { Competition } from "@/lib/types";

interface HomeActiveCompetitionsSectionProps {
  competitions: Competition[];
}

function CompetitionVerticalCard({ competition }: { competition: Competition }) {
  const accent = competition.primary_color ?? "var(--color-brand)";
  const name = competition.short_name ?? competition.full_name;

  return (
    <Link
      href={`/competicoes/${competition.id}`}
      className="home-competition-card group"
      style={{ "--comp-color": accent } as CSSProperties}
    >
      <div className="home-competition-card-inner">
        <div className="home-competition-card-logo-wrap">
          {competition.logo_url ? (
            <OrgImage
              src={competition.logo_url}
              alt={competition.full_name}
              width={72}
              height={72}
              className="home-competition-card-logo"
            />
          ) : (
            <span className="home-competition-card-fallback font-mono-label">
              {name.slice(0, 3)}
            </span>
          )}
        </div>
        <p className="home-competition-card-name">{name}</p>
      </div>
    </Link>
  );
}

export function HomeActiveCompetitionsSection({
  competitions,
}: HomeActiveCompetitionsSectionProps) {
  const active = competitions.slice(0, 8);
  if (!active.length) return null;

  return (
    <SectionEnter className="home-competitions-section py-6 md:py-8">
      <div className="page-container">
        <div className="home-competitions-scroll">
          <div className="home-competitions-track">
            {active.map((competition) => (
              <CompetitionVerticalCard
                key={competition.id}
                competition={competition}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionEnter>
  );
}
