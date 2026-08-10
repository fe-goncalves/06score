"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { AthletePhotoPlaceholder } from "@/components/ui/AthletePhotoPlaceholder";
import { NationalityFlag } from "@/components/ui/NationalityFlag";
import { OrgImage } from "@/components/ui/OrgImage";
import { nationalityIso2 } from "@/lib/athlete/athleteHeaderFormat";
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
  age: _age,
  tabs,
  activeTab,
  onTabChange,
  sectionNavLabel = "Seções do atleta",
}: AthleteHubHeaderProps) {
  const team = currentStint?.teams;
  const accent = team?.primary_color ?? "var(--color-brand)";
  const teamPrimary = team?.primary_color ?? null;
  const surname = athleteSurnameLabel(athlete.full_name, athlete.surname);
  const position = getPositionName(athlete.player_positions);
  const positionLabel =
    position && position !== "—" ? position.toUpperCase() : null;
  const teamShortName = team?.short_name?.trim()
    ? team.short_name.trim().toUpperCase()
    : team?.abbreviation?.trim()
      ? team.abbreviation.trim().toUpperCase()
      : team?.full_name?.trim()
        ? team.full_name.trim().toUpperCase()
        : null;
  const photoUrl = athlete.photo_url?.trim() || null;
  const nationality = athlete.nationality?.trim() || null;
  const hasNationalityFlag =
    nationality != null && nationalityIso2(nationality) != null;

  const showMeta = Boolean(nationality || positionLabel);

  return (
    <header
      className="match-hub-header athlete-hub-header athlete-hub-header--centered"
      style={
        {
          "--match-accent": accent,
          "--athlete-accent": accent,
          "--athlete-team-primary": teamPrimary ?? "var(--color-brand)",
        } as CSSProperties
      }
    >
      <div className="athlete-hub-header-bg" aria-hidden>
        {photoUrl ? (
          <div
            className="athlete-hub-header-wash"
            style={{ backgroundImage: `url(${photoUrl})` }}
          />
        ) : null}
      </div>

      <div className="match-hub-header-content athlete-hub-header-content">
        <div className="athlete-hub-hero athlete-hub-hero--centered">
          {photoUrl ? (
            <OrgImage
              src={athlete.photo_url}
              alt={athlete.full_name}
              width={112}
              height={112}
              className="athlete-hub-photo"
            />
          ) : (
            <span
              className="athlete-hub-photo athlete-hub-photo--placeholder"
              aria-hidden
            >
              <AthletePhotoPlaceholder className="athlete-hub-photo-icon" />
            </span>
          )}

          <div className="athlete-hub-identity athlete-hub-identity--centered">
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

            {showMeta ? (
              <p className="athlete-hub-role-line athlete-hub-meta-line">
                {nationality ? (
                  <>
                    {hasNationalityFlag ? (
                      <NationalityFlag
                        nationality={nationality}
                        className="athlete-hub-flag"
                      />
                    ) : null}
                    <span className="athlete-hub-nationality">
                      {nationality.toUpperCase()}
                    </span>
                  </>
                ) : null}
                {nationality && positionLabel ? (
                  <span className="athlete-hub-meta-sep" aria-hidden>
                    ///
                  </span>
                ) : null}
                {positionLabel ? (
                  <span className="athlete-hub-position">{positionLabel}</span>
                ) : null}
              </p>
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
