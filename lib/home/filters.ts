import { sortNewsByPublishedAt } from "@/lib/home/news";
import { filterHomeTeams } from "@/lib/home/teams";
import type {
  Competition,
  HomeEditionData,
  HomeHighlights,
  HomeHighlightsBundle,
  HomeMatches,
  HomeMotw,
  HomeTotw,
  HomeNewsArticle,
  Match,
  StandingRow,
  Team,
} from "@/lib/types";

export type CompetitionFilterId = string | null;

export function getMatchCompetitionId(match: Match): string | null {
  return match.phases?.competition_editions?.competitions?.id ?? null;
}

export function filterMatches(
  matches: HomeMatches,
  competitionId: CompetitionFilterId,
): HomeMatches {
  if (!competitionId) return matches;
  const filter = (list: Match[]) =>
    list.filter((m) => getMatchCompetitionId(m) === competitionId);
  return {
    recent: filter(matches.recent),
    upcoming: filter(matches.upcoming),
  };
}

export function filterNews(
  articles: HomeNewsArticle[],
  competitionId: CompetitionFilterId,
): HomeNewsArticle[] {
  const sorted = sortNewsByPublishedAt(articles);
  if (!competitionId) return sorted;
  return sorted.filter((a) => a.competition_ids.includes(competitionId));
}

export function resolveEditionData(
  editionsByCompetition: Record<string, HomeEditionData>,
  competitions: Competition[],
  competitionId: CompetitionFilterId,
): HomeEditionData | null {
  if (competitionId) {
    return editionsByCompetition[competitionId] ?? null;
  }
  const first = competitions[0];
  if (!first) return null;
  return editionsByCompetition[first.id] ?? null;
}

/** Edição atual mais recente entre as competições ativas (para o hero). */
export function resolveHeroEditionData(
  editionsByCompetition: Record<string, HomeEditionData>,
  competitions: Competition[],
): HomeEditionData | null {
  const entries = competitions
    .map((c) => editionsByCompetition[c.id])
    .filter((d): d is HomeEditionData => d != null);

  if (!entries.length) return null;

  return [...entries].sort((a, b) =>
    b.editionId.localeCompare(a.editionId),
  )[0];
}

export function getHeroCompetitionMeta(
  editionsByCompetition: Record<string, HomeEditionData>,
  competitions: Competition[],
): {
  id: string;
  name: string;
  primaryColor: string | null;
  logoUrl: string | null;
} | null {
  const heroData = resolveHeroEditionData(
    editionsByCompetition,
    competitions,
  );
  if (!heroData) return null;

  const comp = competitions.find((c) => c.id === heroData.competitionId);
  return {
    id: heroData.competitionId,
    name: heroData.competitionName,
    primaryColor: comp?.primary_color ?? null,
    logoUrl: comp?.logo_url ?? null,
  };
}

export function getStandingsForFilter(
  editionsByCompetition: Record<string, HomeEditionData>,
  competitions: Competition[],
  competitionId: CompetitionFilterId,
): StandingRow[] {
  return resolveEditionData(editionsByCompetition, competitions, competitionId)
    ?.standings ?? [];
}

export function getTeamsForFilter(
  editionsByCompetition: Record<string, HomeEditionData>,
  competitions: Competition[],
  competitionId: CompetitionFilterId,
): Team[] {
  const teams =
    resolveEditionData(editionsByCompetition, competitions, competitionId)
      ?.teams ?? [];
  return filterHomeTeams(teams);
}

const EMPTY_HIGHLIGHTS: HomeHighlights = {
  topScorer: null,
  topAssister: null,
  topTeamByTitles: null,
};

export function getLeadersForFilter(
  highlights: HomeHighlightsBundle,
  competitionId: CompetitionFilterId,
): HomeHighlights {
  if (!competitionId) {
    return highlights.organization;
  }
  return highlights.byCompetition[competitionId] ?? EMPTY_HIGHLIGHTS;
}

export function getLatestMotwForFilter(
  editionsByCompetition: Record<string, HomeEditionData>,
  competitions: Competition[],
  competitionId: CompetitionFilterId,
): HomeMotw | null {
  return (
    resolveEditionData(editionsByCompetition, competitions, competitionId)
      ?.latestMotw ?? null
  );
}

export function getLatestTotwForFilter(
  editionsByCompetition: Record<string, HomeEditionData>,
  competitions: Competition[],
  competitionId: CompetitionFilterId,
): HomeTotw | null {
  return (
    resolveEditionData(editionsByCompetition, competitions, competitionId)
      ?.latestTotw ?? null
  );
}

export function getActiveCompetitionMeta(
  editionsByCompetition: Record<string, HomeEditionData>,
  competitions: Competition[],
  competitionId: CompetitionFilterId,
): {
  id: string;
  name: string;
  primaryColor: string | null;
  logoUrl: string | null;
} | null {
  if (competitionId) {
    const data = editionsByCompetition[competitionId];
    if (data) {
      const comp = competitions.find((c) => c.id === data.competitionId);
      return {
        id: data.competitionId,
        name: data.competitionName,
        primaryColor: comp?.primary_color ?? null,
        logoUrl: comp?.logo_url ?? null,
      };
    }
    const comp = competitions.find((c) => c.id === competitionId);
    if (comp) {
      return {
        id: comp.id,
        name: comp.short_name ?? comp.full_name,
        primaryColor: comp.primary_color,
        logoUrl: comp.logo_url,
      };
    }
    return null;
  }
  const first = competitions[0];
  if (!first) return null;
  const data = editionsByCompetition[first.id];
  return {
    id: first.id,
    name: data?.competitionName ?? first.short_name ?? first.full_name,
    primaryColor: first.primary_color,
    logoUrl: first.logo_url,
  };
}
