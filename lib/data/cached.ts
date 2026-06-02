import { unstable_cache } from "next/cache";
import {
  getCompetitionHub as loadCompetitionHub,
  getCompetitionName,
} from "@/lib/data/competition";
import { getActiveCompetitions, getOrgTeams } from "@/lib/data/home";
import { getOrganization } from "@/lib/org";
import type { CompetitionHubData } from "@/lib/types";

const LAYOUT_REVALIDATE = 120;
const HUB_REVALIDATE = 45;

export function getCachedOrganization(slug: string) {
  return unstable_cache(
    () => getOrganization(slug),
    ["organization", slug],
    { revalidate: LAYOUT_REVALIDATE },
  )();
}

export function getCachedOrgTeams(orgId: string) {
  return unstable_cache(
    () => getOrgTeams(orgId),
    ["org-teams", orgId],
    { revalidate: LAYOUT_REVALIDATE },
  )();
}

export function getCachedActiveCompetitions(orgId: string) {
  return unstable_cache(
    () => getActiveCompetitions(orgId),
    ["org-competitions", orgId],
    { revalidate: LAYOUT_REVALIDATE },
  )();
}

export function getCachedCompetitionHub(
  competitionId: string,
  orgId: string,
  editionId?: string | null,
): Promise<CompetitionHubData | null> {
  const editionKey = editionId?.trim() || "current";

  return unstable_cache(
    () =>
      loadCompetitionHub(
        competitionId,
        orgId,
        editionKey === "current" ? null : editionKey,
      ),
    ["competition-hub", competitionId, orgId, editionKey],
    { revalidate: HUB_REVALIDATE },
  )();
}

export function getCompetitionTitle(
  competitionId: string,
  orgId: string,
): Promise<string | null> {
  return unstable_cache(
    () => getCompetitionName(competitionId, orgId),
    ["competition-title", competitionId, orgId],
    { revalidate: HUB_REVALIDATE },
  )();
}
