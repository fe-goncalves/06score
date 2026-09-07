import { unstable_cache } from "next/cache";
import { getAthleteProfile } from "@/lib/data/athlete";
import {
  getCompetitionHub as loadCompetitionHub,
  getCompetitionName,
} from "@/lib/data/competition";
import { getActiveCompetitions, getOrgTeams } from "@/lib/data/home";
import { getStaffProfile } from "@/lib/data/staff";
import { getOrganization } from "@/lib/org";
import type {
  AthleteProfileData,
  CompetitionHubData,
  StaffProfileData,
} from "@/lib/types";

const LAYOUT_REVALIDATE = 120;
const HUB_REVALIDATE = 45;
const ATHLETE_REVALIDATE = 75;

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
  editionId?: string | null,
): Promise<string | null> {
  const editionKey = editionId?.trim() || "current";
  return unstable_cache(
    () =>
      getCompetitionName(
        competitionId,
        orgId,
        editionKey === "current" ? null : editionKey,
      ),
    ["competition-title", competitionId, orgId, editionKey],
    { revalidate: HUB_REVALIDATE },
  )();
}

export function getCachedAthleteProfile(
  athleteId: string,
  orgId: string,
): Promise<AthleteProfileData | null> {
  return unstable_cache(
    () => getAthleteProfile(athleteId, orgId),
    ["athlete-profile", athleteId, orgId],
    { revalidate: ATHLETE_REVALIDATE },
  )();
}

export function getCachedStaffProfile(
  staffId: string,
  orgId: string,
): Promise<StaffProfileData | null> {
  return unstable_cache(
    () => getStaffProfile(staffId, orgId),
    ["staff-profile", staffId, orgId],
    { revalidate: ATHLETE_REVALIDATE },
  )();
}
