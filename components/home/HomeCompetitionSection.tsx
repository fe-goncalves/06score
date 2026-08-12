import Link from "next/link";
import type { CSSProperties } from "react";
import { HomeCompetitionViewPanel } from "@/components/home/HomeCompetitionViewPanel";
import { HomeRoundMatchesPanel } from "@/components/home/HomeRoundMatchesPanel";
import { OrgImage } from "@/components/ui/OrgImage";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { HomeEditionData } from "@/lib/types";

interface HomeCompetitionSectionProps {
  data: HomeEditionData;
}

export function HomeCompetitionSection({ data }: HomeCompetitionSectionProps) {
  const accent = data.competitionColor ?? "var(--color-brand)";
  const competitionHref = `/competicoes/${data.competitionId}`;

  const matchesProps = {
    competitionId: data.competitionId,
    competitionName: data.competitionName,
    competitionColor: data.competitionColor,
    phaseMatches: data.phaseMatches,
    phaseMatchups: data.phaseMatchups,
    phaseId: data.currentPhaseId,
  };

  return (
    <SectionEnter
      className="home-competition-block"
      style={{ "--comp-accent": accent } as CSSProperties}
    >
      <div className="page-container min-w-0">
        <header className="home-competition-header">
          <Link href={competitionHref} className="home-competition-header-brand group">
            {data.competitionLogoUrl ? (
              <OrgImage
                src={data.competitionLogoUrl}
                alt=""
                width={44}
                height={44}
                className="home-competition-header-logo"
              />
            ) : null}
            <div className="min-w-0">
              <h2 className="home-competition-header-name">{data.competitionName}</h2>
              {data.currentPhaseName ? (
                <p className="home-competition-header-phase">{data.currentPhaseName}</p>
              ) : null}
            </div>
          </Link>
          <Link href={competitionHref} className="home-competition-header-link">
            Ver competição
          </Link>
        </header>

        <div className="home-competition-block-grid">
          <HomeCompetitionViewPanel data={data} />
          <HomeRoundMatchesPanel {...matchesProps} />
        </div>
      </div>
    </SectionEnter>
  );
}
