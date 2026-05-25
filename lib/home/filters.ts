import type {
  AthleteStatLeader,
  Competition,
  HomeEditionData,
  HomeMatches,
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
  if (!competitionId) return articles;
  return articles.filter((a) => a.competition_ids.includes(competitionId));
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
  return (
    resolveEditionData(editionsByCompetition, competitions, competitionId)
      ?.teams ?? []
  );
}

export function getLeadersForFilter(
  editionsByCompetition: Record<string, HomeEditionData>,
  competitions: Competition[],
  competitionId: CompetitionFilterId,
): {
  topScorer: AthleteStatLeader | null;
  topAssister: AthleteStatLeader | null;
  topMvp: AthleteStatLeader | null;
} {
  const data = resolveEditionData(
    editionsByCompetition,
    competitions,
    competitionId,
  );
  return {
    topScorer: data?.topScorer ?? null,
    topAssister: data?.topAssister ?? null,
    topMvp: data?.topMvp ?? null,
  };
}

export function getActiveCompetitionMeta(
  editionsByCompetition: Record<string, HomeEditionData>,
  competitions: Competition[],
  competitionId: CompetitionFilterId,
): { id: string; name: string } | null {
  if (competitionId) {
    const data = editionsByCompetition[competitionId];
    if (data) return { id: data.competitionId, name: data.competitionName };
    const comp = competitions.find((c) => c.id === competitionId);
    if (comp) {
      return {
        id: comp.id,
        name: comp.short_name ?? comp.full_name,
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
  };
}
