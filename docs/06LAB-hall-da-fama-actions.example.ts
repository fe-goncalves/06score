/**
 * Copiar para o 06.LAB: app/hall-da-fama/actions.ts
 * Requer: tabela hall_of_fame_cache + policy is_admin() + Supabase com permissão de escrita.
 *
 * O pacote de cálculo pode ser copiado de 06score/lib/hall/refreshHallCache.ts
 * ou publicado como módulo compartilhado entre os apps.
 */
"use server";

import { refreshHallOfFameCache } from "@/lib/hall/refreshHallCache";

export async function updateHallOfFameCacheAction(organizationId: string) {
  const result = await refreshHallOfFameCache(organizationId);
  return {
    ok: result.errors.length === 0,
    scopes: result.scopes,
    upsertedRows: result.upsertedRows,
    errors: result.errors,
  };
}
