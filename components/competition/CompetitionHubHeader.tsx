"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { CompetitionHubHeaderBg } from "@/components/competition/CompetitionHubHeaderBg";
import { EditionSelector } from "@/components/competition/EditionSelector";
import { OrgImage } from "@/components/ui/OrgImage";
import type { TabItem } from "@/components/ui/PageTabs";
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

  return (
    <header
      className="competition-hub-header"
      style={{ "--hub-accent": accent } as CSSProperties}
    >
      <div className="competition-hub-header-bg" aria-hidden>
        <div className="competition-hub-header-base" />
        <div className="competition-hub-header-glow competition-hub-header-glow-tl" />
        <div className="competition-hub-header-glow competition-hub-header-glow-br" />
        <CompetitionHubHeaderBg accentColor={accent} />
      </div>

      <div className="competition-hub-header-content">
        <nav className="competition-hub-breadcrumb" aria-label="Navegação">
          <Link href="/competicoes" className="competition-hub-breadcrumb-link">
            Competições
          </Link>
          <span className="competition-hub-breadcrumb-sep" aria-hidden>
            &gt;
          </span>
          <span className="competition-hub-breadcrumb-current">
            {competition.full_name}
          </span>
        </nav>

        <div className="competition-hub-identity">
          <div className="competition-hub-logo-wrap">
            <OrgImage
              src={competition.logo_url}
              alt={competition.full_name}
              width={72}
              height={72}
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
            <h1 className="competition-hub-title">{competition.full_name}</h1>
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
