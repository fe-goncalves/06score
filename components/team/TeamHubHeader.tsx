"use client";

import type { CSSProperties } from "react";
import { NationalityFlag } from "@/components/ui/NationalityFlag";
import { OrgImage } from "@/components/ui/OrgImage";
import { nationalityIso2 } from "@/lib/athlete/athleteHeaderFormat";
import { teamGenderLabel } from "@/lib/team/awardTypes";
import { teamCountryDisplay } from "@/lib/team/teamLabels";
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
  const countryName = teamCountryDisplay(team.country ?? team.nationality);
  const countryForFlag = team.country ?? team.nationality ?? "Brasil";
  const hasCountryFlag = nationalityIso2(countryForFlag) != null;
  const sigla = (team.abbreviation?.trim() || "—").toUpperCase();
  const shortName = (
    team.short_name?.trim() ||
    team.full_name
  ).toUpperCase();
  const gender = teamGenderLabel(team.gender).toUpperCase();
  const logoUrl = team.logo_url?.trim() || null;

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
      <div className="team-hub-header-bg" aria-hidden>
        {logoUrl ? (
          <div
            className="team-hub-header-wash"
            style={{ backgroundImage: `url(${logoUrl})` }}
          />
        ) : null}
      </div>

      <div className="match-hub-header-content athlete-hub-header-content">
        <div className="team-hub-hero">
          <OrgImage
            src={team.logo_url}
            alt={team.full_name}
            width={128}
            height={128}
            className="team-hub-logo"
          />

          <div className="team-hub-identity">
            <h1 className="team-hub-short-name">{shortName}</h1>

            <p className="team-hub-meta-line">
              {hasCountryFlag ? (
                <NationalityFlag
                  nationality={countryForFlag}
                  className="team-hub-flag"
                />
              ) : null}
              <span className="team-hub-pais">{countryName.toUpperCase()}</span>
              <span className="team-hub-meta-sep" aria-hidden>
                ///
              </span>
              <span className="team-hub-sigla">{sigla}</span>
              <span className="team-hub-meta-sep" aria-hidden>
                ///
              </span>
              <span className="team-hub-gender">{gender}</span>
            </p>
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
