"use client";

import type { CSSProperties } from "react";
import { TeamMatchesPanel } from "@/components/team/TeamMatchesPanel";
import { TeamDetalhesTab } from "@/components/team/TeamDetalhesTab";
import { TeamElencoTab } from "@/components/team/TeamElencoTab";
import { TeamEstatisticasTab } from "@/components/team/TeamEstatisticasTab";
import { TeamHallTab } from "@/components/team/TeamHallTab";
import { TeamHistoricoTab } from "@/components/team/TeamHistoricoTab";
import { TeamHubHeader } from "@/components/team/TeamHubHeader";
import { TeamHubTab } from "@/components/team/TeamHubTab";
import {
  DEFAULT_TEAM_TAB,
  TEAM_TAB_DETALHES,
  TEAM_TAB_ELENCO,
  TEAM_TAB_ESTATISTICAS,
  TEAM_TAB_HALL,
  TEAM_TAB_HISTORICO,
  TEAM_TAB_HUB,
  TEAM_TAB_PARTIDAS,
  resolveTeamTab,
  teamTabsForViewport,
} from "@/lib/team/teamTabs";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type { TeamProfileData } from "@/lib/types";

interface TeamPageClientProps {
  profile: TeamProfileData;
}

export function TeamPageClient({ profile }: TeamPageClientProps) {
  const { tab, setTab } = useClientTab(DEFAULT_TEAM_TAB, "tab");
  const activeTab = resolveTeamTab(tab);
  const headerTabs = teamTabsForViewport();
  const accent = profile.team.primary_color ?? "var(--color-brand)";
  const matches = profile.recentMatches.map((entry) => entry.match);

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
            {activeTab === TEAM_TAB_HUB && (
              <TeamHubTab
                team={profile.team}
                matches={matches}
                news={profile.news ?? []}
                accent={accent}
                onOpenPartidas={() => setTab(TEAM_TAB_PARTIDAS)}
              />
            )}

            {activeTab === TEAM_TAB_ELENCO && (
              <TeamElencoTab
                squad={profile.squad}
                staff={profile.staff}
                showBirth={false}
                showAge
              />
            )}

            {activeTab === TEAM_TAB_PARTIDAS && (
              <TeamMatchesPanel matches={profile.recentMatches} />
            )}

            {activeTab === TEAM_TAB_HISTORICO && (
              <TeamHistoricoTab profile={profile} />
            )}

            {activeTab === TEAM_TAB_ESTATISTICAS && (
              <TeamEstatisticasTab
                team={profile.team}
                squad={profile.squad}
                editionStats={profile.editionStats}
                statsPhases={profile.statsPhases}
              />
            )}

            {activeTab === TEAM_TAB_HALL && <TeamHallTab profile={profile} />}

            {activeTab === TEAM_TAB_DETALHES && (
              <TeamDetalhesTab profile={profile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
