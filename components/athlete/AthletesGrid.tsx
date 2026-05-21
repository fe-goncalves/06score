"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { OrgImage } from "@/components/ui/OrgImage";
import type { AthleteListItem } from "@/lib/types";
import { athleteDisplayName } from "@/lib/utils";

interface AthletesGridProps {
  athletes: AthleteListItem[];
}

export function AthletesGrid({ athletes }: AthletesGridProps) {
  const teams = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of athletes) {
      const t = a.current_team;
      if (t?.full_name) map.set(t.full_name, t.full_name);
    }
    return Array.from(map.values()).sort();
  }, [athletes]);

  const [teamFilter, setTeamFilter] = useState<string>("");

  const filtered = useMemo(() => {
    if (!teamFilter) return athletes;
    return athletes.filter((a) => a.current_team?.full_name === teamFilter);
  }, [athletes, teamFilter]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <label
          htmlFor="team-filter"
          className="text-[10px] font-bold uppercase tracking-wider text-white/50"
        >
          Equipe:
        </label>
        <select
          id="team-filter"
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="rounded border border-white/[0.08] bg-[#141414] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-brand)]"
        >
          <option value="">Todas</option>
          {teams.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {!filtered.length ? (
        <p className="text-sm text-white/40">Nenhum atleta encontrado.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((athlete) => (
            <Link key={athlete.id} href={`/atletas/${athlete.id}`}>
              <Card className="flex items-center gap-4 p-4">
                <OrgImage
                  src={athlete.photo_url}
                  alt={athlete.full_name}
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {athleteDisplayName(athlete.full_name, athlete.surname)}
                  </p>
                  <p className="truncate text-xs text-white/50">
                    {athlete.current_team?.short_name ??
                      athlete.current_team?.full_name ??
                      "Sem clube"}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
