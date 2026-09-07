"use client";

import { useCallback, useMemo, useState } from "react";
import { SiteListHero } from "@/components/layout/SiteListHero";
import { TeamHorizontalCard } from "@/components/team/TeamHorizontalCard";
import { LiquidGlassEntityList } from "@/components/ui/LiquidGlassEntityList";
import { matchesQuery } from "@/lib/search/normalizeQuery";
import type { Team } from "@/lib/types";

interface TeamsListClientProps {
  teams: Team[];
}

export function TeamsListClient({ teams }: TeamsListClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const sorted = useMemo(
    () =>
      [...teams]
        .filter((team): team is Team & { id: string } => Boolean(team.id))
        .sort((a, b) => a.full_name.localeCompare(b.full_name, "pt-BR")),
    [teams],
  );

  const filterTeam = useCallback((team: Team, query: string) => {
    return (
      matchesQuery(team.full_name, query) ||
      matchesQuery(team.short_name, query) ||
      matchesQuery(team.abbreviation, query)
    );
  }, []);

  if (!sorted.length) {
    return (
      <>
        <SiteListHero title="EQUIPES" />
        <div className="page-container pb-14 pt-2">
          <p className="liquid-glass-list-empty">
            Nenhuma equipe cadastrada no momento.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteListHero
        title="EQUIPES"
        searchId="equipes-search"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <LiquidGlassEntityList
        items={sorted}
        searchId="equipes-search"
        searchPlaceholder="Buscar equipe…"
        hideSearch
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterItem={filterTeam}
        containerClassName="liquid-glass-list"
        resultCountLabel={(count) =>
          `${count} ${count === 1 ? "equipe" : "equipes"}`
        }
        emptyMessage="Nenhuma equipe encontrada."
        renderItem={(team, index) => (
          <TeamHorizontalCard key={team.id} team={team} index={index} />
        )}
      />
    </>
  );
}
