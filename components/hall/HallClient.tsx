"use client";

import { useMemo, useState } from "react";
import { HallCard } from "@/components/hall/HallCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type {
  HallFilterOptions,
  HallSectionData,
  HallFilters,
  HallCategory,
} from "@/lib/types";

interface HallClientProps {
  initialData: HallSectionData;
  options: HallFilterOptions;
  orgId: string;
}

export function HallClient({ initialData, options, orgId }: HallClientProps) {
  const [filters, setFilters] = useState<HallFilters>({
    competitionId: "",
    editionId: "",
    teamId: "",
    gender: "",
  });
  const [data, setData] = useState<HallSectionData>(initialData);
  const [loading, setLoading] = useState(false);

  const filteredEditions = useMemo(() => {
    if (!filters.competitionId) return options.editions;
    return options.editions.filter(
      (e) => e.competition_id === filters.competitionId,
    );
  }, [filters.competitionId, options.editions]);

  async function applyFilters(next: HallFilters) {
    setFilters(next);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/hall?orgId=${orgId}&competitionId=${next.competitionId}&editionId=${next.editionId}&teamId=${next.teamId}&gender=${next.gender}`,
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("[HallClient] applyFilters", err);
    } finally {
      setLoading(false);
    }
  }

  function update(key: keyof HallFilters, value: string) {
    const next: HallFilters = { ...filters, [key]: value };
    if (key === "competitionId") next.editionId = "";
    applyFilters(next);
  }

  function renderSection(title: string, categories: HallCategory[]) {
    if (!categories.length) return null;
    return (
      <section className="mt-12">
        <SectionTitle>{title}</SectionTitle>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => (
            <HallCard key={cat.key} category={cat} />
          ))}
        </div>
      </section>
    );
  }

  const selectClass =
    "rounded border border-white/[0.08] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-brand)] w-full sm:w-auto";

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Competição
          </label>
          <select
            value={filters.competitionId}
            onChange={(e) => update("competitionId", e.target.value)}
            className={selectClass}
          >
            <option value="">Todas</option>
            {options.competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.short_name ?? c.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Temporada
          </label>
          <select
            value={filters.editionId}
            onChange={(e) => update("editionId", e.target.value)}
            className={selectClass}
          >
            <option value="">Todas</option>
            {filteredEditions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.season_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Equipe
          </label>
          <select
            value={filters.teamId}
            onChange={(e) => update("teamId", e.target.value)}
            className={selectClass}
          >
            <option value="">Todas</option>
            {options.teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Gênero
          </label>
          <select
            value={filters.gender}
            onChange={(e) => update("gender", e.target.value)}
            className={selectClass}
          >
            <option value="">Todos</option>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>
        </div>
      </div>

      {loading && (
        <p className="mt-8 text-sm text-white/40">Carregando...</p>
      )}

      {!loading && (
        <>
          {renderSection("Atletas", data.athletes)}
          {renderSection("Equipes", data.teams)}
          {data.staff.length > 0 && renderSection("Comissão Técnica", data.staff)}
          {!data.athletes.length && !data.teams.length && (
            <p className="mt-12 text-sm text-white/40">
              Nenhum dado encontrado para os filtros selecionados.
            </p>
          )}
        </>
      )}
    </div>
  );
}