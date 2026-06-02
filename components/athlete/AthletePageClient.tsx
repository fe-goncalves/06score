"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";
import { AthleteHubHeader } from "@/components/athlete/AthleteHubHeader";
import { AthleteEstatisticasTab } from "@/components/athlete/AthleteEstatisticasTab";
import { AthleteHistoricoTab } from "@/components/athlete/AthleteHistoricoTab";
import { AthleteInfoTab } from "@/components/athlete/AthleteInfoTab";
import { AthleteMatchesList } from "@/components/athlete/AthleteMatchesList";
import {
  ATHLETE_TAB_PARTIDAS,
  DEFAULT_ATHLETE_TAB,
  athleteTabsForViewport,
  resolveAthleteTab,
} from "@/lib/athlete/athleteTabs";
import { useAthleteDesktopLayout } from "@/lib/hooks/useMediaQuery";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type { AthleteProfileData } from "@/lib/types";

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

  useEffect(() => {
    if (isDesktop && tab === ATHLETE_TAB_PARTIDAS) {
      setTab(DEFAULT_ATHLETE_TAB);
    }
  }, [isDesktop, tab, setTab]);

  const currentStint =
    profile.stints.find((s) => s.is_current) ?? profile.stints[0] ?? null;
  const birthDate = (profile.athlete as { birth_date?: string | null }).birth_date;
  const age = calcAge(birthDate);
  const accent = currentStint?.teams?.primary_color ?? "var(--color-brand)";

  const matchesAside = (
    <AthleteMatchesList
      matches={profile.recentMatches}
      className={isDesktop ? "athlete-matches-panel--aside" : undefined}
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
            {activeTab === "informacoes" && <AthleteInfoTab profile={profile} />}

            {activeTab === ATHLETE_TAB_PARTIDAS && !isDesktop && matchesAside}

            {activeTab === "historico" && (
              <AthleteHistoricoTab
                stints={profile.stints}
                rosterEntries={profile.rosterEntries}
              />
            )}

            {activeTab === "estatisticas" && (
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

          {isDesktop && (
            <aside className="athlete-page-aside" aria-label="Partidas recentes">
              {matchesAside}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
