"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import { nationalityFlagEmoji } from "@/lib/athlete/athleteHeaderFormat";
import { teamCountryDisplay, teamGenderNavLabel } from "@/lib/team/teamLabels";
import type { TabItem } from "@/components/ui/PageTabs";
import type { Team } from "@/lib/types";

interface TeamHubHeaderProps {
  team: Team & { id: string };
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TeamHubHeader({
  team,
  tabs,
  activeTab,
  onTabChange,
}: TeamHubHeaderProps) {
  const accent = team.primary_color ?? "var(--color-brand)";
  const teamPrimary = team.primary_color ?? null;
  const countryName = teamCountryDisplay(team.country);
  const flag = nationalityFlagEmoji(team.country ?? "Brasil");
  const sigla = team.abbreviation?.trim() || "—";
  const shortName = team.short_name?.trim() || team.full_name;
  const fullName = team.full_name?.trim() || shortName;
  const genderLabel = teamGenderNavLabel(team.gender);
  const breadcrumbTeamName = shortName;

  return (
    <header
      className="match-hub-header athlete-hub-header team-hub-header"
      style={
        {
          "--match-accent": accent,
          "--athlete-accent": accent,
          "--athlete-team-primary": teamPrimary ?? "var(--color-brand)",
        } as CSSProperties
      }
    >
      <div className="team-hub-header-bg" aria-hidden />

      <div className="match-hub-header-content athlete-hub-header-content">
        <nav className="match-hub-breadcrumb athlete-hub-breadcrumb" aria-label="Navegação">
          <Link href="/times" className="match-hub-breadcrumb-link">
            TIMES
          </Link>
          {genderLabel ? (
            <>
              <span className="match-hub-breadcrumb-sep" aria-hidden>
                ›
              </span>
              <Link href="/times" className="match-hub-breadcrumb-link">
                {genderLabel}
              </Link>
            </>
          ) : null}
          <span className="match-hub-breadcrumb-sep" aria-hidden>
            ›
          </span>
          <span className="match-hub-breadcrumb-current">{breadcrumbTeamName}</span>
        </nav>

        <div className="team-hub-hero">
          <OrgImage
            src={team.logo_url}
            alt={team.full_name}
            width={80}
            height={80}
            className="team-hub-logo"
          />

          <div className="team-hub-identity">
            <p className="team-hub-meta-line">
              {flag ? (
                <span className="team-hub-flag" aria-hidden>
                  {flag}
                </span>
              ) : null}
              <span className="team-hub-pais">{countryName}</span>
              <span className="team-hub-meta-sep" aria-hidden>
                ///
              </span>
              <span className="team-hub-sigla">{sigla}</span>
            </p>

            <h1 className="team-hub-short-name">{shortName}</h1>

            <p className="team-hub-full-name">{fullName}</p>
          </div>
        </div>

        <nav className="match-hub-nav scrollbar-hide" aria-label="Seções do time">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`match-hub-nav-tab athlete-hub-nav-tab ${isActive ? "match-hub-nav-tab--active" : ""}`}
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
