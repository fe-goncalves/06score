"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PhaseFilter } from "@/components/competition/PhaseFilter";
import { OrgImage } from "@/components/ui/OrgImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Match, Matchup, Phase } from "@/lib/types";
import { formatMatchDateTime, isMatchFinished } from "@/lib/utils";

interface MatchesByRoundProps {
  matches: Match[];
  phases: Phase[];
  matchups: Matchup[];
}

interface RoundGroup {
  label: string;
  order: number;
  matches: Match[];
}

function buildRoundGroups(
  matches: Match[],
  matchups: Matchup[],
): RoundGroup[] {
  const map: Record<string, RoundGroup> = {};

  for (const m of matches) {
    let key: string;
    let order = 0;

    if (m.rounds?.custom_label ?? m.rounds?.name) {
      key = m.rounds?.custom_label ?? m.rounds?.name ?? "Sem rodada";
      order = m.rounds?.display_order ?? 0;
    } else if (m.matchup_id) {
      const mu = matchups.find((x) => x.id === m.matchup_id);
      key =
        mu?.round_label ??
        m.phases?.custom_label ??
        m.phases?.full_name ??
        "Sem rodada";
      order = mu?.display_order ?? 0;
    } else {
      key = m.phases?.custom_label ?? m.phases?.full_name ?? "Sem rodada";
      order = 0;
    }

    if (!map[key]) map[key] = { label: key, order, matches: [] };
    map[key].matches.push(m);
  }

  return Object.values(map).sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

function MatchRow({ match }: { match: Match }) {
  const finished = isMatchFinished(match.status);
  return (
    <Link
      href={`/jogos/${match.id}`}
      className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.06] card-surface px-4 py-3 transition-colors hover:border-[var(--color-brand)]/40"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/50">
          {formatMatchDateTime(match.match_date, match.match_time)}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <OrgImage
            src={match.teams_a?.logo_url}
            alt={match.teams_a?.full_name ?? "A"}
            width={28}
            height={28}
            className="h-7 w-7 rounded object-contain"
          />
          <span className="text-sm font-semibold">
            {match.teams_a?.short_name ?? match.teams_a?.full_name}
          </span>
          <span className="text-white/30">×</span>
          <span className="text-sm font-semibold">
            {match.teams_b?.short_name ?? match.teams_b?.full_name}
          </span>
          <OrgImage
            src={match.teams_b?.logo_url}
            alt={match.teams_b?.full_name ?? "B"}
            width={28}
            height={28}
            className="h-7 w-7 rounded object-contain"
          />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <StatusBadge status={match.status} />
        {finished ? (
          <span className="text-lg font-bold tabular-nums">
            {match.score_a ?? 0} × {match.score_b ?? 0}
          </span>
        ) : (
          <span className="text-sm font-bold text-[var(--color-brand)]">
            {match.match_time?.slice(0, 5) ?? "—"}
          </span>
        )}
      </div>
    </Link>
  );
}

export function MatchesByRound({
  matches,
  phases,
  matchups,
}: MatchesByRoundProps) {
  const [phaseId, setPhaseId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!phaseId) return matches;
    return matches.filter((m) => m.phase_id === phaseId);
  }, [matches, phaseId]);

  const groups = useMemo(
    () => buildRoundGroups(filtered, matchups),
    [filtered, matchups],
  );

  return (
    <div>
      <PhaseFilter
        phases={phases}
        selectedPhaseId={phaseId}
        onChange={setPhaseId}
      />
      {!groups.length ? (
        <p className="text-sm text-white/40">Nenhuma partida encontrada.</p>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h3 className="section-title mb-4">{group.label}</h3>
              <div className="space-y-2">
                {group.matches.map((m) => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
