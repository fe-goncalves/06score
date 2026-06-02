"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
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
  const displayName =
    team.short_name?.trim() || team.abbreviation?.trim() || team.full_name;
  const subtitle = team.abbreviation?.trim() || team.full_name;

  const detailItems: string[] = [];
  if (team.abbreviation && team.abbreviation !== displayName) {
    detailItems.push(team.abbreviation);
  }
  if (team.full_name && team.full_name !== displayName) {
    detailItems.push(team.full_name);
  }

  return (
    <header
      className="match-hub-header athlete-hub-header"
      style={
        {
          "--match-accent": accent,
          "--athlete-accent": accent,
          "--athlete-team-primary": teamPrimary ?? "var(--color-brand)",
        } as CSSProperties
      }
    >
      <div className="athlete-hub-header-bg" aria-hidden />

      <div className="match-hub-header-content athlete-hub-header-content">
        <nav className="match-hub-breadcrumb athlete-hub-breadcrumb" aria-label="Navegação">
          <Link href="/times" className="match-hub-breadcrumb-link">
            Times
          </Link>
          <span className="match-hub-breadcrumb-sep" aria-hidden>
            ›
          </span>
          <span className="match-hub-breadcrumb-current">{displayName}</span>
        </nav>

        <div className="athlete-hub-hero">
          <OrgImage
            src={team.logo_url}
            alt={team.full_name}
            width={72}
            height={72}
            className="athlete-hub-photo athlete-hub-photo--team"
          />

          <div className="athlete-hub-identity">
            <h1 className="athlete-hub-surname">{displayName}</h1>

            {subtitle && subtitle !== displayName ? (
              <p className="athlete-hub-club athlete-hub-club--static">{subtitle}</p>
            ) : null}

            {detailItems.length > 0 ? (
              <div className="athlete-hub-details">
                {detailItems.map((item, index) => (
                  <span key={item} className="athlete-hub-detail-wrap">
                    {index > 0 ? (
                      <span className="athlete-hub-detail-sep" aria-hidden>
                        |
                      </span>
                    ) : null}
                    <span className="athlete-hub-detail">{item}</span>
                  </span>
                ))}
              </div>
            ) : null}
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
