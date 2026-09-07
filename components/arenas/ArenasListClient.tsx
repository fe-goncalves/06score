"use client";

import { useCallback, useState } from "react";
import { ArenaHorizontalCard } from "@/components/arenas/ArenaHorizontalCard";
import { SiteListHero } from "@/components/layout/SiteListHero";
import { LiquidGlassEntityList } from "@/components/ui/LiquidGlassEntityList";
import { matchesQuery } from "@/lib/search/normalizeQuery";
import { venueShortName } from "@/lib/venue/display";
import type { OrgVenue } from "@/lib/types";

interface ArenasListClientProps {
  venues: OrgVenue[];
}

export function ArenasListClient({ venues }: ArenasListClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filterVenue = useCallback((venue: OrgVenue, query: string) => {
    return (
      matchesQuery(venue.full_name, query) ||
      matchesQuery(venue.short_name, query) ||
      matchesQuery(venue.address, query) ||
      matchesQuery(venue.city, query) ||
      matchesQuery(venue.state, query) ||
      matchesQuery(venueShortName(venue), query)
    );
  }, []);

  const items = venues.filter((venue) => venue.id);

  if (!items.length) {
    return (
      <>
        <SiteListHero title="ARENAS" />
        <div className="page-container pb-14 pt-2">
          <p className="liquid-glass-list-empty">
            Nenhuma arena cadastrada no momento.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteListHero
        title="ARENAS"
        searchId="arenas-search"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <LiquidGlassEntityList
        items={items}
        searchId="arenas-search"
        searchPlaceholder="Buscar arena…"
        hideSearch
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterItem={filterVenue}
        containerClassName="liquid-glass-list"
        resultCountLabel={(count) =>
          `${count} ${count === 1 ? "arena" : "arenas"}`
        }
        emptyMessage="Nenhuma arena encontrada."
        renderItem={(venue, index) => (
          <ArenaHorizontalCard key={venue.id} venue={venue} index={index} />
        )}
      />
    </>
  );
}
