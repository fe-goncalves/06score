"use client";

import { useState } from "react";
import { OrgImage } from "@/components/ui/OrgImage";
import type { HallCategory } from "@/lib/types";

interface HallCardProps {
  category: HallCategory;
}

export function HallCard({ category }: HallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? category.entries : category.entries.slice(0, 5);
  const canExpand = category.entries.length > 5;

  return (
    <div className="card-surface flex flex-col overflow-hidden rounded-lg">
      {/* Header com foto do líder como fundo */}
      <div className="relative min-h-[140px] overflow-hidden">
        {category.entries[0]?.photo_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{ backgroundImage: `url(${category.entries[0].photo_url})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-black/60 to-transparent" />
        <div className="relative flex h-full min-h-[140px] flex-col justify-end p-4">
          <span className="font-mono-label text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            {category.label}
          </span>
        </div>
      </div>

      {/* Lista de entradas */}
      <ul className="flex flex-col divide-y divide-white/[0.04] px-4 pb-2">
        {visible.map((entry, index) => (
          <li key={entry.id} className="flex items-center gap-3 py-3">
            <span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-white/30">
              {index + 1}
            </span>
            <OrgImage
              src={entry.photo_url}
              alt={entry.name}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display truncate text-sm font-bold uppercase">
                {entry.name}
              </p>
              {entry.team_name && (
                <p className="truncate text-[11px] text-white/40">
                  {entry.team_name}
                </p>
              )}
            </div>
            <span className="shrink-0 text-base font-bold tabular-nums text-[var(--color-brand)]">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mx-4 mb-4 mt-1 rounded-lg border border-white/10 py-2 text-[11px] font-bold uppercase tracking-wider text-white/40 transition-colors hover:border-white/20 hover:text-white/70"
        >
          {expanded ? "Ver menos" : `Ver mais ${category.entries.length - 5}`}
        </button>
      )}
    </div>
  );
}