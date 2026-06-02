"use client";

import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import {
  formatAthleteBirthLine,
  nationalityFlagEmoji,
} from "@/lib/athlete/athleteHeaderFormat";
import type { TabItem } from "@/components/ui/PageTabs";
import type { Athlete, AthleteTeamStint } from "@/lib/types";
import { athleteSurnameLabel, getPositionName } from "@/lib/utils";

interface AthleteHubHeaderProps {
  athlete: Athlete & {
    id: string;
    nationality: string | null;
    birth_date?: string | null;
  };
  currentStint: AthleteTeamStint | null;
  age: number | null;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  breadcrumb?: { href: string; label: string };
  sectionNavLabel?: string;
}

export function AthleteHubHeader({
  athlete,
  currentStint,
  age,
  tabs,
  activeTab,
  onTabChange,
  breadcrumb = { href: "/atletas", label: "Atletas" },
  sectionNavLabel = "Seções do atleta",
}: AthleteHubHeaderProps) {
  const team = currentStint?.teams;
  const accent = team?.primary_color ?? "var(--color-brand)";
  const teamPrimary = team?.primary_color ?? null;
  const surname = athleteSurnameLabel(athlete.full_name, athlete.surname);
  const position = getPositionName(athlete.player_positions);
  const teamShortName =
    team?.short_name?.trim() || team?.abbreviation?.trim() || team?.full_name?.trim() || null;
  const birthLine = formatAthleteBirthLine(athlete.birth_date, age);
  const flag = nationalityFlagEmoji(athlete.nationality);

  const detailItems: { key: string; node: ReactNode }[] = [];
  if (athlete.nationality) {
    detailItems.push({
      key: "nationality",
      node: (
        <>
          {flag ? (
            <span className="athlete-hub-detail-flag" aria-hidden>
              {flag}
            </span>
          ) : null}
          <span>{athlete.nationality}</span>
        </>
      ),
    });
  }
  if (birthLine) {
    detailItems.push({ key: "birth", node: birthLine });
  }
  if (position && position !== "—") {
    detailItems.push({ key: "position", node: position });
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
          <Link href={breadcrumb.href} className="match-hub-breadcrumb-link">
            {breadcrumb.label}
          </Link>
          <span className="match-hub-breadcrumb-sep" aria-hidden>
            ›
          </span>
          <span className="match-hub-breadcrumb-current">{surname}</span>
        </nav>

        <div className="athlete-hub-hero">
          <OrgImage
            src={athlete.photo_url}
            alt={athlete.full_name}
            width={72}
            height={72}
            className="athlete-hub-photo"
          />

          <div className="athlete-hub-identity">
            <h1 className="athlete-hub-surname">{surname}</h1>

            {team?.id && teamShortName ? (
              <Link href={`/times/${team.id}`} className="athlete-hub-club">
                {team.logo_url ? (
                  <OrgImage
                    src={team.logo_url}
                    alt=""
                    width={18}
                    height={18}
                    className="athlete-hub-club-logo"
                  />
                ) : null}
                <span>{teamShortName}</span>
              </Link>
            ) : null}

            {detailItems.length > 0 ? (
              <div className="athlete-hub-details">
                {detailItems.map((item, index) => (
                  <Fragment key={item.key}>
                    {index > 0 ? (
                      <span className="athlete-hub-detail-sep" aria-hidden>
                        |
                      </span>
                    ) : null}
                    <span className="athlete-hub-detail">{item.node}</span>
                  </Fragment>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <nav className="match-hub-nav scrollbar-hide" aria-label={sectionNavLabel}>
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
