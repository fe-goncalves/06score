"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";
import { AthleteMatchesList } from "@/components/athlete/AthleteMatchesList";
import { TeamEstatisticasTab } from "@/components/team/TeamEstatisticasTab";
import { TeamHistoricoTab } from "@/components/team/TeamHistoricoTab";
import { TeamHubHeader } from "@/components/team/TeamHubHeader";
import { TeamInfoTab } from "@/components/team/TeamInfoTab";
import {
  DEFAULT_TEAM_TAB,
  TEAM_TAB_PARTIDAS,
  resolveTeamTab,
  teamTabsForViewport,
} from "@/lib/team/teamTabs";
import { useAthleteDesktopLayout } from "@/lib/hooks/useMediaQuery";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type { TeamProfileData } from "@/lib/types";

interface TeamPageClientProps {
  profile: TeamProfileData;
}

export function TeamPageClient({ profile }: TeamPageClientProps) {
  const isDesktop = useAthleteDesktopLayout();
  const { tab, setTab } = useClientTab(DEFAULT_TEAM_TAB, "tab");
  const activeTab = resolveTeamTab(tab, !isDesktop);
  const headerTabs = teamTabsForViewport(!isDesktop);
  const accent = profile.team.primary_color ?? "var(--color-brand)";

  useEffect(() => {
    if (isDesktop && tab === TEAM_TAB_PARTIDAS) {
      setTab(DEFAULT_TEAM_TAB);
    }
  }, [isDesktop, tab, setTab]);

  const matchesAside = (
    <AthleteMatchesList
      matches={profile.recentMatches}
      className={isDesktop ? "athlete-matches-panel--aside" : undefined}
    />
  );

  return (
    <div
      className="athlete-page team-page"
      style={
        {
          "--athlete-accent": accent,
          "--match-accent": accent,
        } as CSSProperties
      }
    >
      <TeamHubHeader
        team={profile.team}
        tabs={headerTabs}
        activeTab={activeTab}
        onTabChange={setTab}
      />

      <div className="athlete-page-panel">
        <div className="athlete-page-layout">
          <div className="athlete-page-main">
            {activeTab === "informacoes" && <TeamInfoTab profile={profile} />}

            {activeTab === TEAM_TAB_PARTIDAS && !isDesktop && matchesAside}

            {activeTab === "historico" && <TeamHistoricoTab profile={profile} />}

            {activeTab === "estatisticas" && (
              <TeamEstatisticasTab
                editionStats={profile.editionStats}
                careerSummary={profile.careerSummary}
                team={profile.team}
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
