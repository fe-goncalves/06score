"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AthleteHubFilter } from "@/components/athlete/AthleteHubFilter";
import { StatsHighlightCard } from "@/components/competition/StatsHighlightCard";
import { StatsTablePager } from "@/components/team/StatsTableControls";
import { OrgImage } from "@/components/ui/OrgImage";
import { PillStepper } from "@/components/ui/PillStepper";
import type {
  HallCategory,
  HallEntry,
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

type MainTab = "athletes" | "teams" | "titulos";

interface CategoryPill {
  id: string;
  label: string;
  dataKey: string;
  suffix?: string;
}

interface TitulosTimelineItem {
  id: string;
  editionId: string;
  year: number | null;
  seasonName: string | null;
  awardType: string;
  awardLabel: string;
  competition: {
    id: string;
    name: string;
    fullName: string;
    logoUrl: string | null;
  };
  winner: {
    type: "team" | "athlete" | "staff";
    id: string;
    name: string;
    photoUrl: string | null;
    teamName: string | null;
    teamLogo: string | null;
    teamAbbrev: string | null;
  };
}

const GENDER_SLIDES: {
  id: HallGender;
  label: string;
  gradient: string;
}[] = [
  {
    id: "all",
    label: "Todos",
    gradient:
      "linear-gradient(145deg, #F2E6C4 0%, #D4AF37 42%, #8A6A1A 100%)",
  },
  {
    id: "male",
    label: "Masculino",
    gradient:
      "linear-gradient(145deg, #C5D0C8 0%, #6B7F72 48%, #2C3530 100%)",
  },
  {
    id: "female",
    label: "Feminino",
    gradient:
      "linear-gradient(145deg, #E0C9B8 0%, #9A6B52 48%, #3F2A22 100%)",
  },
];

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: "athletes", label: "Atletas" },
  { id: "teams", label: "Equipes" },
  { id: "titulos", label: "Títulos" },
];

const ATHLETE_PILLS: CategoryPill[] = [
  { id: "goals", label: "Artilharia", dataKey: "goals" },
  { id: "assists", label: "Assistências", dataKey: "assists" },
  { id: "motm", label: "MOTM", dataKey: "motm" },
  { id: "titles", label: "Títulos", dataKey: "athlete_titles" },
  { id: "goal_assist", label: "Participações em gol", dataKey: "goal_participation" },
  { id: "hat_tricks", label: "Hat-tricks", dataKey: "hat_tricks" },
  { id: "penalty_goals", label: "Gols de pênalti", dataKey: "penalty_goals" },
  { id: "shootout_goals", label: "Gols de shoot-out", dataKey: "shootout_goals" },
  { id: "clean_sheets", label: "Clean Sheets", dataKey: "gk_clean_sheets" },
];

const TEAM_PILLS: CategoryPill[] = [
  { id: "ranking", label: "Ranking", dataKey: "team_ranking" },
  { id: "titulos", label: "Mais títulos", dataKey: "team_titles" },
  { id: "vitorias", label: "Mais vitórias", dataKey: "team_wins" },
  { id: "mais_jogos", label: "Mais jogos", dataKey: "mais_jogos" },
  { id: "gols_marcados", label: "Mais gols marcados", dataKey: "team_goals" },
];

const TITULOS_AWARDS: { awardType: string; label: string }[] = [
  { awardType: "champion", label: "Campeão" },
  { awardType: "top_scorer", label: "Artilheiro" },
  { awardType: "mvp", label: "MVP" },
];

const PAGE_SIZE = 10;
const MODAL_ENTRY_LIMIT = 50;

function buildFilters(
  gender: HallGender,
  competitionId: string,
  year: string,
  editionId: string,
): HallFilters {
  return {
    gender,
    competitionId: competitionId === "all" ? "" : competitionId,
    year: year === "all" ? "" : year,
    editionId: editionId === "all" ? "" : editionId,
  };
}

function formatEntryValue(
  entry: HallEntry,
  category: HallCategory | null,
  suffix?: string,
): string {
  if (entry.value_display) return entry.value_display;
  const raw = String(entry.value);
  if (suffix) return raw.includes("%") ? raw : `${raw}${suffix}`;
  return raw;
}

function winnerHref(item: TitulosTimelineItem): string {
  if (item.winner.type === "team") return `/times/${item.winner.id}`;
  if (item.winner.type === "staff") return `/comissao/${item.winner.id}`;
  return `/atletas/${item.winner.id}`;
}

function seasonLine(item: TitulosTimelineItem): string {
  const parts: string[] = [];
  if (item.year != null) parts.push(String(item.year));
  if (item.seasonName) parts.push(item.seasonName);
  return parts.join(" · ") || "—";
}

function genderIndex(gender: HallGender): number {
  const idx = GENDER_SLIDES.findIndex((s) => s.id === gender);
  return idx >= 0 ? idx : 0;
}

export function HallPageClient({ initialData, options, orgId }: HallPageClientProps) {
  const [gender, setGender] = useState<HallGender>("all");
  const [mainTab, setMainTab] = useState<MainTab>("athletes");
  const [athletePillId, setAthletePillId] = useState(ATHLETE_PILLS[0].id);
  const [teamPillId, setTeamPillId] = useState(TEAM_PILLS[0].id);
  const [competitionId, setCompetitionId] = useState("all");
  const [year, setYear] = useState("all");
  const [editionId, setEditionId] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPage, setModalPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [titulosItems, setTitulosItems] = useState<TitulosTimelineItem[]>([]);
  const [titulosLoaded, setTitulosLoaded] = useState(false);
  const [titulosLoading, setTitulosLoading] = useState(false);
  const [titulosCompetitionId, setTitulosCompetitionId] = useState("all");

  const activePills = mainTab === "teams" ? TEAM_PILLS : ATHLETE_PILLS;
  const activePillId = mainTab === "teams" ? teamPillId : athletePillId;
  const activePill =
    activePills.find((pill) => pill.id === activePillId) ?? activePills[0];

  const competitionsForGender = useMemo(() => {
    if (gender === "all") return options.competitions;
    return options.competitions.filter((c) => {
      const g = (c.gender ?? "").toLowerCase();
      if (gender === "male") return g === "male" || g === "m";
      if (gender === "female") return g === "female" || g === "f";
      return true;
    });
  }, [gender, options.competitions]);

  const teamsForGender = useMemo(() => {
    if (gender === "all") return options.teams;
    return options.teams.filter((team) => {
      const g = (team.gender ?? "").toLowerCase();
      if (gender === "male") return g === "male" || g === "m";
      if (gender === "female") return g === "female" || g === "f";
      return true;
    });
  }, [gender, options.teams]);

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
        label: e.custom_name?.trim() || e.season_name || "Edição",
      })),
    [editionsForFilters],
  );

  const activeCategory = useMemo(() => {
    if (mainTab !== "athletes" && mainTab !== "teams") return null;
    const list = mainTab === "teams" ? data.teams : data.athletes;
    return list.find((cat) => cat.key === activePill.dataKey) ?? null;
  }, [mainTab, data, activePill.dataKey]);

  const teamFilterOptions = useMemo(
    () =>
      teamsForGender.map((team) => ({
        id: team.full_name,
        label: team.abbreviation?.trim() || team.short_name?.trim() || team.full_name,
        logoUrl: team.logo_url ?? null,
      })),
    [teamsForGender],
  );

  function entriesForPill(pill: CategoryPill): HallEntry[] {
    if (mainTab !== "athletes" && mainTab !== "teams") return [];
    const list = mainTab === "teams" ? data.teams : data.athletes;
    const category = list.find((cat) => cat.key === pill.dataKey) ?? null;
    let entries = category?.entries ?? [];
    if (mainTab === "athletes" && teamFilter !== "all") {
      entries = entries.filter((entry) => entry.team_name === teamFilter);
    }
    return entries;
  }

  function rowsForPill(pill: CategoryPill) {
    const category =
      (mainTab === "teams" ? data.teams : data.athletes).find(
        (cat) => cat.key === pill.dataKey,
      ) ?? null;
    return entriesForPill(pill).map((entry) => {
      const photo =
        mainTab === "teams"
          ? (entry.team_logo ?? entry.photo_url)
          : entry.photo_url;
      return {
        key: entry.id,
        href: `${mainTab === "teams" ? "/times" : "/atletas"}/${entry.id}`,
        name: entry.name,
        value: formatEntryValue(entry, category, pill.suffix),
        photoUrl: photo,
        photoAlt: entry.name,
        teamLogoUrl: mainTab === "athletes" ? entry.team_logo ?? null : null,
        teamAlt: entry.team_name ?? undefined,
      };
    });
  }

  const filteredEntries = useMemo(() => {
    let entries = activeCategory?.entries ?? [];
    if (mainTab === "athletes" && teamFilter !== "all") {
      entries = entries.filter((entry) => entry.team_name === teamFilter);
    }
    return entries;
  }, [activeCategory, mainTab, teamFilter]);

  const modalEntries = useMemo(
    () => filteredEntries.slice(0, MODAL_ENTRY_LIMIT),
    [filteredEntries],
  );

  const modalTotalPages = Math.max(1, Math.ceil(modalEntries.length / PAGE_SIZE));
  const safeModalPage = Math.min(modalPage, modalTotalPages - 1);
  const paginatedModalEntries = modalEntries.slice(
    safeModalPage * PAGE_SIZE,
    safeModalPage * PAGE_SIZE + PAGE_SIZE,
  );

  useEffect(() => {
    setModalPage(0);
    setTeamFilter("all");
    setModalOpen(false);
  }, [activePillId, mainTab]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchHallData = useCallback(
    async (next: {
      gender: HallGender;
      competitionId: string;
      year: string;
      editionId: string;
    }) => {
      setLoading(true);
      try {
        const filters = buildFilters(
          next.gender,
          next.competitionId,
          next.year,
          next.editionId,
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
    },
    [orgId],
  );

  const scheduleHallRefetch = useCallback(
    (next: {
      gender: HallGender;
      competitionId: string;
      year: string;
      editionId: string;
    }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchHallData(next);
      }, 300);
    },
    [fetchHallData],
  );

  const fetchTitulos = useCallback(
    async (nextGender: HallGender, nextCompetitionId: string) => {
      setTitulosLoading(true);
      try {
        const results = await Promise.all(
          TITULOS_AWARDS.map(async ({ awardType, label }) => {
            const params = new URLSearchParams({
              orgId,
              awardType,
              gender: nextGender,
            });
            if (nextCompetitionId !== "all") {
              params.set("competitionId", nextCompetitionId);
            }
            const res = await fetch(`/api/hall/titulos?${params.toString()}`);
            if (!res.ok) return [] as TitulosTimelineItem[];
            const json = (await res.json()) as {
              items: Omit<TitulosTimelineItem, "awardType" | "awardLabel">[];
            };
            return (json.items ?? []).map((item) => ({
              ...item,
              awardType,
              awardLabel: label,
            }));
          }),
        );

        const merged = results.flat().sort((a, b) => {
          const yearA = a.year ?? 0;
          const yearB = b.year ?? 0;
          if (yearA !== yearB) return yearB - yearA;
          const seasonA = a.seasonName ?? "";
          const seasonB = b.seasonName ?? "";
          if (seasonA !== seasonB) return seasonB.localeCompare(seasonA);
          return b.editionId.localeCompare(a.editionId);
        });
        setTitulosItems(merged);
      } catch (err) {
        console.error("[HallPageClient titulos]", err);
      } finally {
        setTitulosLoading(false);
        setTitulosLoaded(true);
      }
    },
    [orgId],
  );

  function applyFilters(next: Partial<{
    competitionId: string;
    year: string;
    editionId: string;
  }>) {
    const nextCompetition = next.competitionId ?? competitionId;
    const nextYear = next.year ?? year;
    const nextEdition = next.editionId ?? editionId;
    setCompetitionId(nextCompetition);
    setYear(nextYear);
    setEditionId(nextEdition);
    scheduleHallRefetch({
      gender,
      competitionId: nextCompetition,
      year: nextYear,
      editionId: nextEdition,
    });
  }

  function applyGender(nextGender: HallGender) {
    if (nextGender === gender) return;
    setGender(nextGender);
    setCompetitionId("all");
    setYear("all");
    setEditionId("all");
    setTeamFilter("all");
    setTitulosCompetitionId("all");
    fetchHallData({
      gender: nextGender,
      competitionId: "all",
      year: "all",
      editionId: "all",
    });
    if (mainTab === "titulos" || titulosLoaded) {
      fetchTitulos(nextGender, "all");
    }
  }

  function selectMainTab(tab: MainTab) {
    setMainTab(tab);
    if (tab === "titulos" && !titulosLoaded) {
      fetchTitulos(gender, titulosCompetitionId);
    }
  }

  function applyTitulosCompetition(nextCompetitionId: string) {
    setTitulosCompetitionId(nextCompetitionId);
    fetchTitulos(gender, nextCompetitionId);
  }

  function selectGenderByIndex(index: number) {
    const slide = GENDER_SLIDES[index];
    if (!slide || slide.id === gender) return;
    applyGender(slide.id);
  }

  function stepGender(dir: -1 | 1) {
    const next = genderIndex(gender) + dir;
    if (next < 0 || next >= GENDER_SLIDES.length) return;
    selectGenderByIndex(next);
  }

  const hrefPrefix = mainTab === "teams" ? "/times" : "/atletas";
  const isRankingTab = mainTab === "athletes" || mainTab === "teams";
  const cardTitle = activePill.label;
  const cardRows = filteredEntries.map((entry) => {
    const photo =
      mainTab === "teams"
        ? (entry.team_logo ?? entry.photo_url)
        : entry.photo_url;
    return {
      key: entry.id,
      href: `${hrefPrefix}/${entry.id}`,
      name: entry.name,
      value: formatEntryValue(entry, activeCategory, activePill.suffix),
      photoUrl: photo,
      photoAlt: entry.name,
      teamLogoUrl: mainTab === "athletes" ? entry.team_logo ?? null : null,
      teamAlt: entry.team_name ?? undefined,
    };
  });

  const hasActiveFilters =
    competitionId !== "all" ||
    year !== "all" ||
    editionId !== "all" ||
    (mainTab === "athletes" && teamFilter !== "all");

  const activeGenderSlide =
    GENDER_SLIDES.find((s) => s.id === gender) ?? GENDER_SLIDES[0]!;
  const activeGenderIndex = genderIndex(gender);

  return (
    <div
      className="hall-page"
      style={{ "--hub-accent": "var(--color-brand)" } as CSSProperties}
    >
      <header className="hall-header">
        <div className="hall-header-bg" aria-hidden />
        <div className="hall-header-content">
          <h1 className="hall-header-title">HALL</h1>

          <div className="hall-gender-carousel" aria-label="Filtrar por gênero">
            <button
              type="button"
              className="hall-gender-nav hall-gender-nav--prev"
              aria-label="Gênero anterior"
              disabled={activeGenderIndex <= 0}
              onClick={() => stepGender(-1)}
            >
              ‹
            </button>

            <div
              className="hall-gender-stage"
              style={
                {
                  "--gender-gradient": activeGenderSlide.gradient,
                } as CSSProperties
              }
            >
              <span className="hall-gender-logo" aria-hidden />
              <span className="hall-gender-label">{activeGenderSlide.label}</span>
            </div>

            <button
              type="button"
              className="hall-gender-nav hall-gender-nav--next"
              aria-label="Próximo gênero"
              disabled={activeGenderIndex >= GENDER_SLIDES.length - 1}
              onClick={() => stepGender(1)}
            >
              ›
            </button>

            <div className="hall-gender-dots" role="tablist" aria-label="Gênero">
              {GENDER_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={gender === slide.id}
                  aria-label={slide.label}
                  className={`hall-gender-dot ${gender === slide.id ? "hall-gender-dot--active" : ""}`}
                  style={
                    gender === slide.id
                      ? ({ "--gender-gradient": slide.gradient } as CSSProperties)
                      : undefined
                  }
                  onClick={() => selectGenderByIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <nav
        className="competition-hub-nav hall-main-nav scrollbar-hide"
        aria-label="Seções do Hall"
      >
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`competition-hub-nav-tab ${mainTab === tab.id ? "competition-hub-nav-tab-active" : ""}`}
            onClick={() => selectMainTab(tab.id)}
            aria-current={mainTab === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {mainTab === "titulos" ? (
        <section className="hall-titulos-section">
          <div className="hall-toolbar">
            <button
              type="button"
              className={`hall-filters-btn ${titulosCompetitionId !== "all" ? "hall-filters-btn--active" : ""}`}
              onClick={() => setFiltersOpen(true)}
            >
              Filtros
            </button>
          </div>

          {titulosLoading ? (
            <HallRankingSkeleton />
          ) : titulosItems.length === 0 ? (
            <p className="hall-empty">Sem dados para esta categoria.</p>
          ) : (
            <ol className="hall-timeline">
              {titulosItems.map((item) => (
                <li key={`${item.id}-${item.awardType}`} className="hall-timeline-item">
                  <div className="hall-timeline-marker" aria-hidden />
                  <div className="hall-timeline-card">
                    <div className="hall-timeline-top">
                      <p className="hall-timeline-season">{seasonLine(item)}</p>
                      <span className="hall-timeline-award">{item.awardLabel}</span>
                    </div>
                    <div className="hall-timeline-comp">
                      {item.competition.logoUrl ? (
                        <OrgImage
                          src={item.competition.logoUrl}
                          alt={item.competition.fullName}
                          width={24}
                          height={24}
                          className="hall-timeline-comp-logo"
                        />
                      ) : (
                        <span className="hall-timeline-comp-logo-ph" aria-hidden />
                      )}
                      <span className="hall-timeline-comp-name">
                        {item.competition.name}
                      </span>
                    </div>
                    <Link href={winnerHref(item)} className="hall-timeline-winner">
                      {item.winner.photoUrl ? (
                        <OrgImage
                          src={item.winner.photoUrl}
                          alt={item.winner.name}
                          width={36}
                          height={36}
                          className={`hall-timeline-winner-photo ${item.winner.type === "team" ? "hall-timeline-winner-photo--logo" : ""}`}
                        />
                      ) : (
                        <span className="hall-timeline-winner-ph" aria-hidden>
                          {item.winner.name.slice(0, 2)}
                        </span>
                      )}
                      <span className="hall-timeline-winner-body">
                        <span className="hall-timeline-winner-name">
                          {item.winner.name}
                        </span>
                        {item.winner.teamName ? (
                          <span className="hall-timeline-winner-team">
                            {item.winner.teamName}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}

      {isRankingTab ? (
        <div className="hall-ranking-section">
          <div className="hall-toolbar">
            <div className="hall-toolbar-stepper">
              <PillStepper
                items={activePills.map((pill) => ({
                  id: pill.id,
                  label: pill.label,
                }))}
                selectedId={activePillId}
                onSelect={(id) => {
                  if (mainTab === "teams") setTeamPillId(id);
                  else setAthletePillId(id);
                }}
                ariaLabel="Categorias"
              />
            </div>
            <button
              type="button"
              className={`hall-filters-btn ${hasActiveFilters ? "hall-filters-btn--active" : ""}`}
              onClick={() => setFiltersOpen(true)}
            >
              Filtros
            </button>
          </div>

          {loading ? (
            <div className="hall-loading-bar" role="status" aria-label="Carregando" />
          ) : null}

          {/* Mobile: categoria ativa */}
          <div
            className="hall-card-stage hall-card-stage--mobile"
            style={{
              opacity: loading ? 0.4 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {loading && filteredEntries.length === 0 ? (
              <HallRankingSkeleton />
            ) : (
              <StatsHighlightCard
                title={cardTitle}
                rows={cardRows}
                previewLimit={10}
                emptyMessage={
                  activeCategory?.emptyHint ?? "Sem dados para esta categoria."
                }
                onOpen={() => {
                  if (filteredEntries.length === 0) return;
                  setModalPage(0);
                  setModalOpen(true);
                }}
              />
            )}
          </div>

          {/* Desktop: todas as categorias em 3 colunas */}
          <div
            className="hall-cards-grid"
            style={{
              opacity: loading ? 0.4 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {activePills.map((pill) => {
              const rows = rowsForPill(pill);
              const category =
                (mainTab === "teams" ? data.teams : data.athletes).find(
                  (cat) => cat.key === pill.dataKey,
                ) ?? null;
              return (
                <StatsHighlightCard
                  key={pill.id}
                  title={pill.label}
                  rows={rows}
                  previewLimit={10}
                  emptyMessage={
                    category?.emptyHint ?? "Sem dados para esta categoria."
                  }
                  onOpen={() => {
                    if (rows.length === 0) return;
                    if (mainTab === "teams") setTeamPillId(pill.id);
                    else setAthletePillId(pill.id);
                    setModalPage(0);
                    setModalOpen(true);
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {filtersOpen ? (
        <HallFiltersModal
          title={mainTab === "titulos" ? "Filtros de títulos" : "Filtros"}
          onClose={() => setFiltersOpen(false)}
        >
          {mainTab === "titulos" ? (
            <AthleteHubFilter
              ariaLabel="Filtrar títulos por competição"
              value={titulosCompetitionId}
              onChange={applyTitulosCompetition}
              options={competitionOptions}
              allLabel="Todas as competições"
              showLogo
            />
          ) : (
            <>
              <AthleteHubFilter
                ariaLabel="Filtrar por competição"
                value={competitionId}
                onChange={(id) =>
                  applyFilters({ competitionId: id, year: "all", editionId: "all" })
                }
                options={competitionOptions}
                allLabel="Todas as competições"
                showLogo
              />
              <AthleteHubFilter
                ariaLabel="Filtrar por ano"
                value={year}
                onChange={(id) => applyFilters({ year: id, editionId: "all" })}
                options={yearOptions}
                allLabel="Todos os anos"
                showLogo={false}
              />
              {competitionId !== "all" ? (
                <AthleteHubFilter
                  ariaLabel="Filtrar por edição"
                  value={editionId}
                  onChange={(id) => applyFilters({ editionId: id })}
                  options={editionOptions}
                  allLabel="Todas as edições"
                  showLogo={false}
                />
              ) : null}
              {mainTab === "athletes" && teamFilterOptions.length > 0 ? (
                <AthleteHubFilter
                  ariaLabel="Filtrar por equipe"
                  value={teamFilter}
                  onChange={setTeamFilter}
                  options={teamFilterOptions}
                  allLabel="Todas as equipes"
                  showLogo
                  searchable
                  searchPlaceholder="Buscar equipe…"
                />
              ) : null}
            </>
          )}
        </HallFiltersModal>
      ) : null}

      {modalOpen && activeCategory ? (
        <HallRankingModal
          title={cardTitle}
          entries={paginatedModalEntries}
          page={safeModalPage}
          totalPages={modalTotalPages}
          onPageChange={setModalPage}
          hrefPrefix={hrefPrefix}
          category={activeCategory}
          suffix={activePill.suffix}
          isTeams={mainTab === "teams"}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

function HallFiltersModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="hall-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="hall-modal hall-modal--filters"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hall-filters-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="hall-modal-head">
          <h3 id="hall-filters-title" className="hall-modal-title">
            {title}
          </h3>
          <button type="button" className="hall-modal-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>
        <div className="hall-modal-filters">{children}</div>
      </div>
    </div>
  );
}

function HallRankingModal({
  title,
  entries,
  page,
  totalPages,
  onPageChange,
  hrefPrefix,
  category,
  suffix,
  isTeams,
  onClose,
}: {
  title: string;
  entries: HallEntry[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hrefPrefix: string;
  category: HallCategory;
  suffix?: string;
  isTeams: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="hall-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="hall-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hall-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="hall-modal-head">
          <h3 id="hall-modal-title" className="hall-modal-title">
            {title}
          </h3>
          <button type="button" className="hall-modal-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>
        <ol className="hall-modal-list">
          {entries.map((entry, index) => {
            const position = page * PAGE_SIZE + index + 1;
            const photo = isTeams
              ? (entry.team_logo ?? entry.photo_url)
              : entry.photo_url;
            return (
              <li key={`${entry.id}-${position}`}>
                <Link
                  href={`${hrefPrefix}/${entry.id}`}
                  className="hall-modal-row"
                  style={
                    entry.accent_color
                      ? ({ "--row-accent": entry.accent_color } as CSSProperties)
                      : undefined
                  }
                >
                  <span className="hall-modal-rank">{position}</span>
                  {photo ? (
                    <OrgImage
                      src={photo}
                      alt=""
                      width={44}
                      height={44}
                      className={`hall-modal-photo ${isTeams ? "hall-modal-photo--logo" : ""}`}
                    />
                  ) : (
                    <span className="hall-modal-photo-ph" aria-hidden>
                      {entry.name.slice(0, 2)}
                    </span>
                  )}
                  <span className="hall-modal-body">
                    <span className="hall-modal-name">{entry.name}</span>
                    {!isTeams && entry.team_name ? (
                      <span className="hall-modal-meta">{entry.team_name}</span>
                    ) : null}
                  </span>
                  <span className="hall-modal-value">
                    {formatEntryValue(entry, category, suffix)}
                    {category.valueLabel ? (
                      <span className="hall-modal-unit">{category.valueLabel}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <StatsTablePager
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

function HallRankingSkeleton() {
  return (
    <div className="hall-skeleton" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="hall-skeleton-row" />
      ))}
      <p className="hall-skeleton-label">Carregando…</p>
    </div>
  );
}
