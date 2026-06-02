"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { MatchHubHeaderBg } from "@/components/match/MatchHubHeaderBg";
import { OrgImage } from "@/components/ui/OrgImage";
import type { TabItem } from "@/components/ui/PageTabs";
import type { Athlete, AthleteTeamStint } from "@/lib/types";
import { athleteSurnameLabel, getPositionName } from "@/lib/utils";

interface AthleteHubHeaderProps {
  athlete: Athlete & { id: string; nationality: string | null };
  currentStint: AthleteTeamStint | null;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function AthleteHubHeader({
  athlete,
  currentStint,
  tabs,
  activeTab,
  onTabChange,
}: AthleteHubHeaderProps) {
  const team = currentStint?.teams;
  const accent = team?.primary_color ?? "var(--color-brand)";
  const surname = athleteSurnameLabel(athlete.full_name, athlete.surname);
  const position = getPositionName(athlete.player_positions);

  return (
    <header
      className="match-hub-header athlete-hub-header"
      style={
        {
          "--match-accent": accent,
          "--athlete-accent": accent,
        } as CSSProperties
      }
    >
      <MatchHubHeaderBg accentColor={accent} />

      {athlete.photo_url && (
        <div className="athlete-hub-figure" aria-hidden>
          <OrgImage
            src={athlete.photo_url}
            alt=""
            fill
            className="athlete-hub-figure-img"
          />
        </div>
      )}

      <div className="match-hub-header-content athlete-hub-header-content">
        <nav className="athlete-hub-breadcrumb" aria-label="Navegação">
          <Link href="/atletas" className="athlete-hub-breadcrumb-link">
            ← Atletas
          </Link>
        </nav>

        <div className="athlete-hub-hero">
          <div className="athlete-hub-photo-wrap">
            <span className="athlete-hub-photo-ring" aria-hidden />
            <OrgImage
              src={athlete.photo_url}
              alt={athlete.full_name}
              width={128}
              height={128}
              className="athlete-hub-photo"
            />
          </div>

          <div className="athlete-hub-identity">
            <p className="athlete-hub-kicker">Perfil do atleta</p>
            <h1 className="athlete-hub-surname">{surname}</h1>
            {position && (
              <p className="athlete-hub-position">{position}</p>
            )}
            {team?.id && (
              <Link
                href={`/times/${team.id}`}
                className="athlete-hub-team"
              >
                {team.logo_url && (
                  <OrgImage
                    src={team.logo_url}
                    alt=""
                    width={22}
                    height={22}
                    className="athlete-hub-team-logo"
                  />
                )}
                <span>
                  {team.abbreviation ?? team.short_name ?? team.full_name}
                </span>
              </Link>
            )}
            {athlete.nationality && (
              <p className="athlete-hub-meta">{athlete.nationality}</p>
            )}
          </div>
        </div>

        <nav className="match-hub-nav scrollbar-hide" aria-label="Seções do atleta">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`match-hub-nav-tab ${isActive ? "match-hub-nav-tab--active" : ""}`}
                style={
                  isActive
                    ? ({
                        "--match-accent": accent,
                        "--athlete-accent": accent,
                      } as CSSProperties)
                    : undefined
                }
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
