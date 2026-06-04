import { computeHallData } from "@/lib/data/hall";
import { upsertHallCacheSnapshot } from "@/lib/hall/hallCacheWrite";
import { getOrgEditionIds } from "@/lib/hall/hallScope";
import type { HallFilters, HallGender } from "@/lib/types";

const REFRESH_GENDERS: HallGender[] = ["all", "male", "female"];

export interface RefreshHallCacheResult {
  scopes: number;
  upsertedRows: number;
  errors: string[];
}

/**
 * Recalcula e grava hall_of_fame_cache para uma organização.
 * Usar no 06.LAB (Server Action com sessão admin / service role).
 */
export async function refreshHallOfFameCache(
  organizationId: string,
): Promise<RefreshHallCacheResult> {
  const editionIds = await getOrgEditionIds(organizationId);
  const scopes: (string | null)[] = [null, ...editionIds];

  let upsertedRows = 0;
  const errors: string[] = [];

  for (const gender of REFRESH_GENDERS) {
    for (const editionId of scopes) {
      const filters: HallFilters = {
        gender,
        competitionId: "",
        year: "",
        editionId: editionId ?? "",
      };

      try {
        const data = await computeHallData(organizationId, filters, "all");
        const result = await upsertHallCacheSnapshot(
          organizationId,
          gender,
          editionId,
          data,
        );
        upsertedRows += result.rows;
        errors.push(...result.errors);
      } catch (err) {
        errors.push(
          `${gender}/${editionId ?? "historico"}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  return {
    scopes: scopes.length * REFRESH_GENDERS.length,
    upsertedRows,
    errors,
  };
}
