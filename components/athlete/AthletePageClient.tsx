"use client";

import type { CSSProperties } from "react";
import { AthleteHubHeader } from "@/components/athlete/AthleteHubHeader";
import { AthleteEstatisticasTab } from "@/components/athlete/AthleteEstatisticasTab";
import {
  AthleteResumoTab,
  athleteRoleFromProfile,
  buildAthleteResumoStats,
  buildStaffResumoStats,
} from "@/components/athlete/AthleteResumoTab";
import { AthleteMatchesList } from "@/components/athlete/AthleteMatchesList";
import {
  ATHLETE_TAB_ESTATISTICAS,
  ATHLETE_TAB_PARTIDAS,
  ATHLETE_TAB_RESUMO,
  DEFAULT_ATHLETE_TAB,
  athleteTabsForViewport,
  resolveAthleteTab,
} from "@/lib/athlete/athleteTabs";
import { useAthleteDesktopLayout } from "@/lib/hooks/useMediaQuery";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type { AthleteProfileData, AthleteCareerStats, StaffCareerStats } from "@/lib/types";

function calcAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const d = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

interface AthletePageClientProps {
  profile: AthleteProfileData;
}

export function AthletePageClient({ profile }: AthletePageClientProps) {
  const profileKind = profile.profileKind ?? "athlete";
  const isDesktop = useAthleteDesktopLayout();
  const { tab, setTab } = useClientTab(DEFAULT_ATHLETE_TAB, "tab");
  const activeTab = resolveAthleteTab(tab, !isDesktop);
  const headerTabs = athleteTabsForViewport(!isDesktop);

  const currentStint =
    profile.stints.find((s) => s.is_current) ?? profile.stints[0] ?? null;
  const birthDate = (profile.athlete as { birth_date?: string | null }).birth_date;
  const age = calcAge(birthDate);
  const accent = currentStint?.teams?.primary_color ?? "var(--color-brand)";
  const roleLabel = athleteRoleFromProfile(profile.athlete.player_positions);

  const resumoStats =
    profileKind === "staff"
      ? buildStaffResumoStats(
          (profile.careerStats as StaffCareerStats | null) ?? null,
          profile.careerSummary.matches,
        )
      : buildAthleteResumoStats(
          (profile.careerStats as AthleteCareerStats | null) ?? null,
          profile.editionStats,
          {
            matches: profile.careerSummary.matches,
            goals: profile.careerSummary.goals,
            assists: profile.careerSummary.assists,
          },
        );

  const matchesAside = (
    <AthleteMatchesList
      matches={profile.recentMatches}
      className={
        isDesktop && activeTab !== ATHLETE_TAB_PARTIDAS
          ? "athlete-matches-panel--aside"
          : undefined
      }
    />
  );

  return (
    <div
      className="athlete-page"
      style={
        {
          "--athlete-accent": accent,
          "--match-accent": accent,
        } as CSSProperties
      }
    >
      <AthleteHubHeader
        athlete={{
          ...profile.athlete,
          birth_date: birthDate,
        }}
        currentStint={currentStint}
        age={age}
        tabs={headerTabs}
        activeTab={activeTab}
        onTabChange={setTab}
        breadcrumb={
          profile.breadcrumb ?? { href: "/atletas", label: "Atletas" }
        }
        sectionNavLabel={
          profileKind === "staff"
            ? "Seções da comissão técnica"
            : "Seções do atleta"
        }
      />

      <div className="athlete-page-panel">
        <div className="athlete-page-layout">
          <div className="athlete-page-main">
            {activeTab === ATHLETE_TAB_RESUMO && (
              <AthleteResumoTab
                stints={profile.stints}
                nationality={profile.athlete.nationality}
                birthDate={birthDate}
                roleLabel={roleLabel}
                roleTitle={profileKind === "staff" ? "Função" : "Posição"}
                accent={accent}
                stats={resumoStats}
                teamAwards={profile.teamAwards}
                awards={profile.awards}
              />
            )}

            {activeTab === ATHLETE_TAB_PARTIDAS && matchesAside}

            {activeTab === ATHLETE_TAB_ESTATISTICAS && (
              <AthleteEstatisticasTab
                editionStats={profile.editionStats}
                careerStats={profile.careerStats}
                recentMatches={profile.recentMatches}
                statsPhases={profile.statsPhases}
                currentTeam={currentStint?.teams ?? null}
                profileKind={profileKind}
              />
            )}
          </div>

          {isDesktop && activeTab !== ATHLETE_TAB_PARTIDAS && (
            <aside className="athlete-page-aside" aria-label="Partidas recentes">
              {matchesAside}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
