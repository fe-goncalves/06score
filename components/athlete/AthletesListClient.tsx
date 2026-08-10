"use client";

import { useCallback, useState } from "react";
import { AthleteHorizontalCard } from "@/components/athlete/AthleteHorizontalCard";
import { SiteListHero } from "@/components/layout/SiteListHero";
import { LiquidGlassEntityList } from "@/components/ui/LiquidGlassEntityList";
import { positionAbbreviation } from "@/lib/team/squadDisplay";
import { matchesQuery } from "@/lib/search/normalizeQuery";
import type { AthleteListItem } from "@/lib/types";

interface AthletesListClientProps {
  athletes: AthleteListItem[];
}

export function AthletesListClient({ athletes }: AthletesListClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filterAthlete = useCallback((athlete: AthleteListItem, query: string) => {
    const position = positionAbbreviation(athlete.player_positions);
    return (
      matchesQuery(athlete.full_name, query) ||
      matchesQuery(athlete.surname, query) ||
      matchesQuery(athlete.current_team?.full_name, query) ||
      matchesQuery(athlete.current_team?.short_name, query) ||
      matchesQuery(athlete.current_team?.abbreviation, query) ||
      matchesQuery(position, query)
    );
  }, []);

  return (
    <>
      <SiteListHero
        title="ATLETAS"
        searchId="atletas-search"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <LiquidGlassEntityList
        items={athletes}
        searchId="atletas-search"
        searchPlaceholder="Buscar atleta…"
        hideSearch
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterItem={filterAthlete}
        emptyMessage="Nenhum atleta encontrado."
        containerClassName="liquid-glass-list"
        resultCountLabel={(count) =>
          `${count} ${count === 1 ? "atleta" : "atletas"}`
        }
        renderItem={(athlete, index) => (
          <AthleteHorizontalCard key={athlete.id} athlete={athlete} index={index} />
        )}
      />
    </>
  );
}
