"use client";

import { useMemo, useState } from "react";
import { AthleteHubFilter } from "@/components/athlete/AthleteHubFilter";
import { HallCategoryCard } from "@/components/hall/HallCategoryCard";
import { useClientTab } from "@/lib/navigation/useClientTab";
import type {
  HallEntityTab,
  HallFilterOptions,
  HallFilters,
  HallGender,
  HallSectionData,
} from "@/lib/types";

interface HallPageClientProps {
  initialData: HallSectionData;
  options: HallFilterOptions;
  orgId: string;
}

const GENDER_OPTIONS: { id: HallGender; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "male", label: "Masculino" },
  { id: "female", label: "Feminino" },
];

function buildFilters(
  gender: HallGender,
  competitionId: string,
  year: string,
  editionId: string,
): HallFilters {
  return { gender, competitionId, year, editionId };
}

export function HallPageClient({ initialData, options, orgId }: HallPageClientProps) {
  const [gender, setGender] = useState<HallGender>("all");
  const { tab, setTab } = useClientTab("athletes", "hallTab");
  const [competitionId, setCompetitionId] = useState("all");
  const [year, setYear] = useState("all");
  const [editionId, setEditionId] = useState("all");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const competitionsForGender = useMemo(() => {
    if (gender === "all") return options.competitions;
    return options.competitions.filter((c) => {
      const g = (c.gender ?? "").toLowerCase();
      if (gender === "male") return g === "male" || g === "m";
      if (gender === "female") return g === "female" || g === "f";
      return true;
    });
  }, [gender, options.competitions]);

  const editionsForFilters = useMemo(() => {
    let rows = options.editions;
    if (competitionId !== "all") {
      rows = rows.filter((e) => e.competition_id === competitionId);
    }
    if (year !== "all") {
      const y = Number(year);
      rows = rows.filter((e) => e.year === y);
    }
    return rows;
  }, [options.editions, competitionId, year]);

  const competitionOptions = useMemo(
    () =>
      competitionsForGender.map((c) => ({
        id: c.id,
        label: c.short_name?.trim() || c.full_name,
        logoUrl: c.logo_url ?? null,
      })),
    [competitionsForGender],
  );

  const yearOptions = useMemo(() => {
    const ids = new Set<number>();
    let rows = options.editions;
    if (competitionId !== "all") {
      rows = rows.filter((e) => e.competition_id === competitionId);
    }
    for (const row of rows) {
      if (row.year != null) ids.add(row.year);
    }
    return [...ids]
      .sort((a, b) => b - a)
      .map((y) => ({ id: String(y), label: String(y) }));
  }, [options.editions, competitionId]);

  const editionOptions = useMemo(
    () =>
      editionsForFilters.map((e) => ({
        id: e.id,
        label: e.season_name || "Temporada",
      })),
    [editionsForFilters],
  );

  async function fetchData(next: {
    gender: HallGender;
    competitionId: string;
    year: string;
    editionId: string;
    entityTab: HallEntityTab;
  }) {
    setLoading(true);
    try {
      const filters = buildFilters(
        next.gender,
        next.competitionId === "all" ? "" : next.competitionId,
        next.year === "all" ? "" : next.year,
        next.editionId === "all" ? "" : next.editionId,
      );
      const params = new URLSearchParams({
        orgId,
        gender: filters.gender,
        competitionId: filters.competitionId,
        year: filters.year,
        editionId: filters.editionId,
        tab: "all",
      });
      const res = await fetch(`/api/hall?${params.toString()}`);
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error("[HallPageClient]", err);
    } finally {
      setLoading(false);
    }
  }

  function apply(next: Partial<{
    gender: HallGender;
    competitionId: string;
    year: string;
    editionId: string;
    entityTab: HallEntityTab;
  }>) {
    const nextGender = next.gender ?? gender;
    const nextCompetition = next.competitionId ?? competitionId;
    const nextYear = next.year ?? year;
    const nextEdition = next.editionId ?? editionId;
    const nextTab = next.entityTab ?? tab;

    setGender(nextGender);
    setCompetitionId(nextCompetition);
    setYear(nextYear);
    setEditionId(nextEdition);
    if (next.entityTab) setTab(next.entityTab);

    fetchData({
      gender: nextGender,
      competitionId: nextCompetition,
      year: nextYear,
      editionId: nextEdition,
      entityTab: nextTab,
    });
  }

  const activeCategories = tab === "teams" ? data.teams : data.athletes;
  const hrefPrefix = tab === "teams" ? "/times" : "/atletas";

  return (
    <div className="hall-page">
      <header className="hall-hero">
        <div className="hall-hero-bg" aria-hidden />
        <div className="hall-hero-content">
          <p className="hall-hero-kicker">06.score</p>
          <h1 className="hall-hero-title">Hall da Fama</h1>
          <p className="hall-hero-sub">
            Recordes, lendas e números que marcaram a história.
          </p>
        </div>
      </header>

      <div className="hall-controls">
        <div className="hall-gender-row" role="tablist" aria-label="Gênero">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={gender === opt.id}
              className={`hall-gender-btn ${gender === opt.id ? "hall-gender-btn--active" : ""}`}
              onClick={() =>
                apply({
                  gender: opt.id,
                  competitionId: "all",
                  year: "all",
                  editionId: "all",
                })
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div
          className="athlete-awards-switch hall-entity-switch"
          role="tablist"
          aria-label="Tipo de ranking"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "athletes"}
            className={`athlete-awards-switch-btn ${tab === "athletes" ? "athlete-awards-switch-btn--active" : ""}`}
            onClick={() => apply({ entityTab: "athletes" })}
          >
            Atletas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "teams"}
            className={`athlete-awards-switch-btn ${tab === "teams" ? "athlete-awards-switch-btn--active" : ""}`}
            onClick={() => apply({ entityTab: "teams" })}
          >
            Equipes
          </button>
        </div>

        <div className="hall-filters">
          <AthleteHubFilter
            ariaLabel="Filtrar por competição"
            value={competitionId}
            onChange={(id) =>
              apply({ competitionId: id, year: "all", editionId: "all" })
            }
            options={competitionOptions}
            allLabel="Todas as competições"
            showLogo
          />
          <AthleteHubFilter
            ariaLabel="Filtrar por ano"
            value={year}
            onChange={(id) => apply({ year: id, editionId: "all" })}
            options={yearOptions}
            allLabel="Todos os anos"
            showLogo={false}
          />
          {competitionId !== "all" || year !== "all" ? (
            <AthleteHubFilter
              ariaLabel="Filtrar por temporada"
              value={editionId}
              onChange={(id) => apply({ editionId: id })}
              options={editionOptions}
              allLabel="Todas as temporadas"
              showLogo={false}
            />
          ) : null}
        </div>
      </div>

      <section className="hall-content athlete-historico-block">
        {loading ? (
          <p className="hall-empty">Carregando rankings…</p>
        ) : activeCategories.length === 0 ? (
          <p className="hall-empty">Nenhum dado para os filtros selecionados.</p>
        ) : (
          <div className="hall-grid">
            {activeCategories.map((category) => (
              <HallCategoryCard
                key={category.key}
                category={category}
                hrefPrefix={hrefPrefix}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
