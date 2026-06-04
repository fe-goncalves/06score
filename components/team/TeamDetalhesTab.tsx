"use client";

import { useEffect, useMemo } from "react";
import { TeamMaioresSection } from "@/components/team/TeamMaioresSection";
import { TeamPremiosSection } from "@/components/team/TeamPremiosSection";
import { TeamTitulosSection } from "@/components/team/TeamTitulosSection";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type { TeamProfileData } from "@/lib/types";

type DetalhesView = "titulos" | "premios" | "maiores";

interface TeamDetalhesTabProps {
  profile: TeamProfileData;
}

export function TeamDetalhesTab({ profile }: TeamDetalhesTabProps) {
  const hasTitulos = profile.teamAwards.some((row) =>
    ["champion", "runner_up", "third_place"].includes(row.award_type),
  );
  const hasPremios = profile.individualAwards.length > 0;
  const showSwitch = hasTitulos || hasPremios;

  const defaultView: DetalhesView = hasTitulos
    ? "titulos"
    : hasPremios
      ? "premios"
      : "maiores";

  const { tab, setTab } = useClientTab(defaultView, "detalhesView");
  const activeView: DetalhesView =
    tab === "premios" ? "premios" : tab === "maiores" ? "maiores" : "titulos";

  useEffect(() => {
    if (!showSwitch) {
      if (activeView !== "maiores") setTab("maiores");
      return;
    }
    if (activeView === "titulos" && !hasTitulos) {
      setTab(hasPremios ? "premios" : "maiores");
    } else if (activeView === "premios" && !hasPremios) {
      setTab(hasTitulos ? "titulos" : "maiores");
    }
  }, [showSwitch, activeView, hasTitulos, hasPremios, setTab]);

  const resolvedView: DetalhesView = showSwitch ? activeView : "maiores";

  const championEditionIds = useMemo(
    () =>
      profile.teamAwards
        .filter((row) => row.award_type === "champion")
        .map((row) => row.edition_id),
    [profile.teamAwards],
  );

  const teamEditionIds = useMemo(
    () => profile.editionStats.map((row) => row.edition_id),
    [profile.editionStats],
  );

  const accent = profile.team.primary_color ?? "var(--color-brand)";

  return (
    <div className="team-detalhes-main athlete-info-tab">
      {showSwitch ? (
        <div className="athlete-awards-head team-detalhes-switch-head">
          <div
            className="athlete-awards-switch"
            role="tablist"
            aria-label="Seções de detalhes"
          >
            {hasTitulos ? (
              <button
                type="button"
                role="tab"
                aria-selected={resolvedView === "titulos"}
                className={`athlete-awards-switch-btn ${resolvedView === "titulos" ? "athlete-awards-switch-btn--active" : ""}`}
                onClick={() => setTab("titulos")}
              >
                Títulos
              </button>
            ) : null}
            {hasPremios ? (
              <button
                type="button"
                role="tab"
                aria-selected={resolvedView === "premios"}
                className={`athlete-awards-switch-btn ${resolvedView === "premios" ? "athlete-awards-switch-btn--active" : ""}`}
                onClick={() => setTab("premios")}
              >
                Prêmios
              </button>
            ) : null}
            <button
              type="button"
              role="tab"
              aria-selected={resolvedView === "maiores"}
              className={`athlete-awards-switch-btn ${resolvedView === "maiores" ? "athlete-awards-switch-btn--active" : ""}`}
              onClick={() => setTab("maiores")}
            >
              Maiores
            </button>
          </div>
        </div>
      ) : null}

      <section className="athlete-section athlete-awards-section">
        {resolvedView === "titulos" ? (
          <TeamTitulosSection teamAwards={profile.teamAwards} team={profile.team} />
        ) : null}
        {resolvedView === "premios" ? (
          <TeamPremiosSection awards={profile.individualAwards} />
        ) : null}
        {resolvedView === "maiores" ? (
          <TeamMaioresSection
            teamId={profile.team.id}
            teamEditionIds={teamEditionIds}
            championEditionIds={championEditionIds}
            accent={accent}
          />
        ) : null}
      </section>
    </div>
  );
}
