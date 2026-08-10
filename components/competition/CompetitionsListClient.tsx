"use client";

import { useCallback, useState } from "react";
import { editionLabel } from "@/components/competition/EditionSelector";
import { SiteListHero } from "@/components/layout/SiteListHero";
import { LiquidGlassEntityList } from "@/components/ui/LiquidGlassEntityList";
import { LiquidGlassListRow } from "@/components/ui/LiquidGlassListRow";
import { OrgImage } from "@/components/ui/OrgImage";
import { matchesQuery } from "@/lib/search/normalizeQuery";
import type { Competition, CompetitionEdition } from "@/lib/types";

interface CompetitionsListClientProps {
  competitions: Competition[];
}

function currentEdition(
  competition: Competition,
): CompetitionEdition | null {
  const editions = competition.competition_editions ?? [];
  if (!editions.length) return null;
  return editions.find((edition) => edition.is_current) ?? editions[0] ?? null;
}

function competitionEditionName(competition: Competition): string {
  const edition = currentEdition(competition);
  return edition ? editionLabel(edition) : "—";
}

function sortCompetitions(competitions: Competition[]): Competition[] {
  return [...competitions].sort((a, b) => {
    const aCurrent = (a.competition_editions ?? []).some((e) => e.is_current);
    const bCurrent = (b.competition_editions ?? []).some((e) => e.is_current);
    if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;
    return a.full_name.localeCompare(b.full_name, "pt-BR");
  });
}

export function CompetitionsListClient({
  competitions,
}: CompetitionsListClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const sorted = sortCompetitions(competitions);

  const filterCompetition = useCallback((competition: Competition, query: string) => {
    return (
      matchesQuery(competition.full_name, query) ||
      matchesQuery(competition.short_name, query) ||
      matchesQuery(competitionEditionName(competition), query)
    );
  }, []);

  if (!competitions.length) {
    return (
      <>
        <SiteListHero title="COMPETIÇÕES" />
        <div className="page-container pb-14 pt-2">
          <p className="liquid-glass-list-empty">
            Nenhuma competição cadastrada no momento.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteListHero
        title="COMPETIÇÕES"
        searchId="competicoes-search"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <LiquidGlassEntityList
        items={sorted}
        searchId="competicoes-search"
        searchPlaceholder="Buscar competição…"
        hideSearch
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterItem={filterCompetition}
        resultCountLabel={(count) =>
          `${count} ${count === 1 ? "competição" : "competições"}`
        }
        emptyMessage="Nenhuma competição encontrada."
        renderItem={(competition) => {
          const edition = competitionEditionName(competition);

          return (
            <LiquidGlassListRow
              key={competition.id}
              href={`/competicoes/${competition.id}`}
              accentColor={competition.primary_color}
            >
              {competition.logo_url ? (
                <OrgImage
                  src={competition.logo_url}
                  alt={competition.full_name}
                  width={44}
                  height={44}
                  className="liquid-glass-list-logo object-contain"
                />
              ) : (
                <span className="liquid-glass-list-logo-placeholder" aria-hidden />
              )}
              <span className="liquid-glass-list-info">
                <span className="liquid-glass-list-name">
                  {competition.full_name}
                </span>
                <span className="liquid-glass-list-muted">{edition}</span>
              </span>
            </LiquidGlassListRow>
          );
        }}
      />
    </>
  );
}
