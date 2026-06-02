"use client";

import { ArenaGlassCard } from "@/components/arenas/ArenaGlassCard";
import { SectionEnter } from "@/components/ui/SectionEnter";
import type { OrgVenue } from "@/lib/types";

interface ArenasListClientProps {
  venues: OrgVenue[];
}

export function ArenasListClient({ venues }: ArenasListClientProps) {
  if (!venues.length) {
    return (
      <SectionEnter className="page-container pb-14 pt-2">
        <div className="arenas-empty-state">
          <p className="font-mono-label text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
            Em breve
          </p>
          <p className="font-body mt-3 text-sm text-white/50">
            As arenas da organização serão exibidas aqui assim que estiverem
            cadastradas.
          </p>
        </div>
      </SectionEnter>
    );
  }

  return (
    <SectionEnter className="page-container pb-14 pt-2">
      <h2 className="section-title mb-4">
        {venues.length} {venues.length === 1 ? "arena" : "arenas"}
      </h2>
      <div className="arenas-list-grid">
        {venues.map((venue, index) => (
          <ArenaGlassCard key={venue.id} venue={venue} index={index} />
        ))}
      </div>
    </SectionEnter>
  );
}
