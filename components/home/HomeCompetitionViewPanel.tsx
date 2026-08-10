import type { CSSProperties } from "react";
import { BracketView } from "@/components/competition/BracketView";
import { StandingsTable } from "@/components/competition/StandingsTable";
import type { HomeEditionData } from "@/lib/types";

interface HomeCompetitionViewPanelProps {
  data: HomeEditionData;
}

function panelLabel(phaseType: HomeEditionData["currentPhaseType"]): string {
  if (phaseType === "knockout" || phaseType === "conference") {
    return "Chave";
  }
  return "Classificação";
}

export function HomeCompetitionViewPanel({ data }: HomeCompetitionViewPanelProps) {
  const isBracket =
    data.currentPhaseType === "knockout" ||
    data.currentPhaseType === "conference";

  return (
    <section
      className="home-comp-panel home-comp-panel-view"
      style={
        {
          "--comp-accent": data.competitionColor ?? "var(--color-brand)",
        } as CSSProperties
      }
    >
      <h3 className="home-comp-panel-label">{panelLabel(data.currentPhaseType)}</h3>

      <div className="home-comp-view-scroll">
        {isBracket ? (
          <BracketView
            phaseType={
              data.currentPhaseType === "conference"
                ? "conference"
                : "knockout"
            }
            matchups={data.phaseMatchups}
            matches={data.phaseMatches}
            rounds={data.phaseRounds}
            accentColor={data.competitionColor}
          />
        ) : data.currentPhaseStandings.length > 0 ? (
          <StandingsTable
            rows={data.currentPhaseStandings}
            embedded
            maxRows={8}
            markers={data.tableMarkers}
            accentColor={data.competitionColor}
            defaultView="summary"
            showViewSwitcher={false}
          />
        ) : (
          <p className="home-comp-empty">Classificação indisponível nesta fase.</p>
        )}
      </div>
    </section>
  );
}
