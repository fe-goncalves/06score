"use client";

import type { CSSProperties } from "react";
import { TeamMatchesPanel } from "@/components/team/TeamMatchesPanel";
import { TeamDetalhesTab } from "@/components/team/TeamDetalhesTab";
import { TeamElencoTab } from "@/components/team/TeamElencoTab";
import { TeamEstatisticasTab } from "@/components/team/TeamEstatisticasTab";
import { TeamHistoricoTab } from "@/components/team/TeamHistoricoTab";
import { TeamHubHeader } from "@/components/team/TeamHubHeader";
import { TeamInformacoesAside } from "@/components/team/TeamInformacoesAside";
import {
  DEFAULT_TEAM_TAB,
  TEAM_TAB_DETALHES,
  TEAM_TAB_ELENCO,
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
  const activeTab = resolveTeamTab(tab);
  const headerTabs = teamTabsForViewport();
  const accent = profile.team.primary_color ?? "var(--color-brand)";

  const matchesAside = (
    <TeamMatchesPanel
      matches={profile.recentMatches}
      className={isDesktop ? "athlete-matches-panel--aside" : undefined}
    />
  );

  const informacoesAside = (
    <TeamInformacoesAside
      team={profile.team}
      careerSummary={profile.careerSummary}
      venue={profile.venue}
      foundedYear={profile.foundedYear}
      staff={profile.staff}
      className={isDesktop ? "team-info-aside--desktop" : undefined}
    />
  );

  const showMatchesAside =
    isDesktop &&
    activeTab !== TEAM_TAB_PARTIDAS &&
    activeTab !== TEAM_TAB_ELENCO &&
    activeTab !== TEAM_TAB_DETALHES &&
    activeTab !== "estatisticas" &&
    activeTab !== "historico";

  const showInformacoesAside = isDesktop && activeTab === TEAM_TAB_DETALHES;

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
            {activeTab === TEAM_TAB_ELENCO && (
              <TeamElencoTab squad={profile.squad} />
            )}

            {activeTab === TEAM_TAB_DETALHES && (
              <div className="team-detalhes-layout">
                <TeamDetalhesTab profile={profile} />
                {!isDesktop ? (
                  <div className="team-detalhes-info-mobile">{informacoesAside}</div>
                ) : null}
              </div>
            )}

            {activeTab === TEAM_TAB_PARTIDAS && matchesAside}

            {activeTab === "historico" && <TeamHistoricoTab profile={profile} />}

            {activeTab === "estatisticas" && (
              <TeamEstatisticasTab
                team={profile.team}
                squad={profile.squad}
                editionStats={profile.editionStats}
                statsPhases={profile.statsPhases}
              />
            )}
          </div>

          {showMatchesAside && (
            <aside className="athlete-page-aside" aria-label="Partidas recentes">
              {matchesAside}
            </aside>
          )}

          {showInformacoesAside && (
            <aside className="athlete-page-aside" aria-label="Informações da equipe">
              {informacoesAside}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
