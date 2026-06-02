"use client";

import { OrgLogo } from "@/components/ui/OrgLogo";
import type { AthleteRosterEntry, AthleteTeamStint, Team } from "@/lib/types";

function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) {
    const m = iso.match(/^(\d{4})-(\d{2})/);
    if (m) return `${m[2]}/${m[1]!.slice(-2)}`;
    return iso;
  }
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

function teamShortLabel(
  team: {
    short_name?: string | null;
    abbreviation?: string | null;
    full_name?: string;
  } | null,
): string {
  return (
    team?.abbreviation?.trim() ||
    team?.short_name?.trim() ||
    team?.full_name?.trim() ||
    "Equipe"
  );
}

function teamLabel(
  team: { short_name?: string | null; abbreviation?: string | null; full_name?: string } | null,
): string {
  return team?.short_name?.trim() || team?.abbreviation?.trim() || team?.full_name?.trim() || "Equipe";
}

function TeamLogo({
  team,
}: {
  team: Pick<Team, "logo_url"> | null | undefined;
}) {
  return (
    <OrgLogo src={team?.logo_url} size={20} className="athlete-stint-logo" />
  );
}

interface AthleteHistoricoTabProps {
  stints: AthleteTeamStint[];
  rosterEntries: AthleteRosterEntry[];
}

type RosterTeamSnippet = NonNullable<
  NonNullable<AthleteRosterEntry["edition_teams"]>["teams"]
>;

interface GroupedRosterEntry {
  editionId: string;
  entry: AthleteRosterEntry;
  lastTeam: RosterTeamSnippet | null;
  teams: RosterTeamSnippet[];
}

function entryRecency(entry: AthleteRosterEntry): number {
  if (entry.created_at) {
    const t = new Date(entry.created_at).getTime();
    if (Number.isFinite(t)) return t;
  }
  return NaN;
}

function compareRosterEntriesNewestFirst(a: AthleteRosterEntry, b: AthleteRosterEntry): number {
  const aTime = entryRecency(a);
  const bTime = entryRecency(b);
  if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
    return bTime - aTime;
  }
  return b.id.localeCompare(a.id);
}

function uniqueTeamsFromEntries(entries: AthleteRosterEntry[]): RosterTeamSnippet[] {
  const byId = new Map<string, RosterTeamSnippet>();
  const chronological = [...entries].sort(
    (a, b) => -compareRosterEntriesNewestFirst(a, b),
  );
  for (const item of chronological) {
    const team = item.edition_teams?.teams;
    if (!team) continue;
    const key = team.id ?? team.full_name;
    if (!byId.has(key)) byId.set(key, team);
  }
  return [...byId.values()];
}

function groupRosterByEdition(entries: AthleteRosterEntry[]): GroupedRosterEntry[] {
  const byEdition = new Map<string, AthleteRosterEntry[]>();

  for (const entry of entries) {
    const editionId = entry.edition_id || entry.id;
    const list = byEdition.get(editionId) ?? [];
    list.push(entry);
    byEdition.set(editionId, list);
  }

  return [...byEdition.entries()].map(([editionId, items]) => {
    const sorted = [...items].sort(compareRosterEntriesNewestFirst);
    const lastEntry = sorted[0] ?? items[0];
    return {
      editionId,
      entry: lastEntry,
      lastTeam: lastEntry.edition_teams?.teams ?? null,
      teams: uniqueTeamsFromEntries(items),
    };
  });
}

export function AthleteHistoricoTab({ stints, rosterEntries }: AthleteHistoricoTabProps) {
  const sortedStints = [...stints].sort((a, b) =>
    b.started_at.localeCompare(a.started_at),
  );

  const groupedRoster = groupRosterByEdition(rosterEntries).sort((a, b) => {
    const aName =
      a.entry.competition_editions?.competitions?.short_name ??
      a.entry.competition_editions?.competitions?.full_name ??
      "";
    const bName =
      b.entry.competition_editions?.competitions?.short_name ??
      b.entry.competition_editions?.competitions?.full_name ??
      "";
    return bName.localeCompare(aName, "pt-BR");
  });

  return (
    <div className="athlete-historico-tab space-y-4">
      <section className="athlete-historico-block">
        <h2 className="athlete-historico-title">Linha do tempo de equipes</h2>
        {sortedStints.length === 0 ? (
          <p className="athlete-historico-empty">Nenhuma passagem por equipe registrada.</p>
        ) : (
          <ul className="athlete-stints-timeline">
            {sortedStints.map((stint, index) => {
              const prev = sortedStints[index + 1];
              const hasTransfer = Boolean(prev?.teams && stint.teams);

              return (
                <li key={stint.id} className="athlete-stints-timeline-item">
                  <div className="athlete-stint-row">
                    <div className="athlete-stint-main">
                      <div className="athlete-stint-transfer">
                        {hasTransfer && <TeamLogo team={prev!.teams} />}
                        {hasTransfer && (
                          <span className="athlete-stint-arrow" aria-hidden>
                            →
                          </span>
                        )}
                        <TeamLogo team={stint.teams} />
                      </div>
                      <span className="athlete-stint-name">
                        {teamShortLabel(stint.teams)}
                      </span>
                    </div>
                    <span className="athlete-stint-date">
                      {formatMonthYear(stint.started_at)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="athlete-historico-block">
        <h2 className="athlete-historico-title">Inscrições em competições</h2>
        {groupedRoster.length === 0 ? (
          <p className="athlete-historico-empty">
            Nenhuma inscrição em competição encontrada.
          </p>
        ) : (
          <ul className="athlete-roster-list">
            {groupedRoster.map(({ editionId, entry, lastTeam, teams }) => (
              <li key={editionId}>
                <article className="athlete-roster-row">
                  <div className="athlete-roster-body">
                    <p className="athlete-roster-comp">
                      {entry.competition_editions?.competitions?.short_name ??
                        entry.competition_editions?.competitions?.full_name ??
                        "Competição"}
                    </p>
                    <p className="athlete-roster-meta">
                      {entry.competition_editions?.seasons?.name ?? "Temporada"} •{" "}
                      {teamLabel(lastTeam)}
                    </p>
                  </div>
                  <div className="athlete-roster-logos">
                    {teams.map((team) => (
                      <OrgLogo
                        key={team.id ?? team.full_name}
                        src={team.logo_url}
                        size={22}
                        className="athlete-roster-logo"
                      />
                    ))}
                    <OrgLogo
                      src={entry.competition_editions?.competitions?.logo_url}
                      size={22}
                      className="athlete-roster-logo athlete-roster-logo--comp"
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
