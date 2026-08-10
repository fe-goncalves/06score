"use client";

import type { CSSProperties } from "react";
import { EditionSelector } from "@/components/competition/EditionSelector";
import { OrgImage } from "@/components/ui/OrgImage";
import type { TabItem } from "@/components/ui/PageTabs";
import { teamGenderLabel } from "@/lib/team/awardTypes";
import type { Competition, CompetitionEdition } from "@/lib/types";

interface CompetitionHubHeaderProps {
  competition: Competition;
  editions: CompetitionEdition[];
  currentEdition: CompetitionEdition | null;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  accentColor?: string | null;
}

export function CompetitionHubHeader({
  competition,
  editions,
  currentEdition,
  tabs,
  activeTab,
  onTabChange,
  accentColor,
}: CompetitionHubHeaderProps) {
  const accent = accentColor ?? "var(--color-brand)";
  const title =
    competition.short_name?.trim() || competition.full_name || "Competição";
  const genderLabel = teamGenderLabel(competition.gender);
  const metaParts = [
    competition.full_name?.trim() || null,
    genderLabel !== "—" ? genderLabel : null,
  ].filter(Boolean);

  return (
    <header
      className="competition-hub-header competition-hub-header--solid"
      style={{ "--hub-accent": accent } as CSSProperties}
    >
      <div className="competition-hub-header-bg" aria-hidden>
        <div className="competition-hub-header-base" />
      </div>

      <div className="competition-hub-header-content">
        <div className="competition-hub-identity">
          <div className="competition-hub-logo-wrap competition-hub-logo-wrap--plain">
            <OrgImage
              src={competition.logo_url}
              alt={competition.full_name}
              width={96}
              height={96}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="competition-hub-identity-text min-w-0">
            <div className="competition-hub-season-row">
              <EditionSelector
                editions={editions}
                currentEdition={currentEdition}
              />
            </div>
            <h1 className="competition-hub-title">{title}</h1>
            {metaParts.length > 0 ? (
              <p className="competition-hub-subtitle">{metaParts.join(" · ")}</p>
            ) : null}
          </div>
        </div>

        <nav
          className="competition-hub-nav scrollbar-hide"
          aria-label="Seções da competição"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`competition-hub-nav-tab ${isActive ? "competition-hub-nav-tab-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
