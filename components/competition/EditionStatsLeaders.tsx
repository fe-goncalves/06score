import { OrgImage } from "@/components/ui/OrgImage";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { AthleteStatLeader } from "@/lib/types";
import { athleteDisplayName } from "@/lib/utils";

interface LeaderBlockProps {
  title: string;
  leaders: AthleteStatLeader[];
  valueKey: "goals" | "assists" | "yellow_cards";
}

function LeaderBlock({ title, leaders, valueKey }: LeaderBlockProps) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      {!leaders.length ? (
        <p className="text-sm text-white/40">Sem dados.</p>
      ) : (
        <ol className="space-y-2">
          {leaders.map((row, i) => {
            const athlete = row.athletes;
            const team = row.teams;
            if (!athlete) return null;
            const value = row[valueKey] ?? 0;
            return (
              <li
                key={`${valueKey}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#141414] px-3 py-2"
              >
                <span className="w-6 shrink-0 text-center text-xs font-bold text-white/40">
                  {i + 1}
                </span>
                <OrgImage
                  src={athlete.photo_url}
                  alt={athlete.full_name}
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {athleteDisplayName(athlete.full_name, athlete.surname)}
                  </p>
                  <p className="truncate text-xs text-white/50">
                    {team?.full_name ?? "—"}
                  </p>
                </div>
                <span className="shrink-0 text-lg font-bold tabular-nums text-[var(--color-brand)]">
                  {value}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

interface EditionStatsLeadersProps {
  topScorers: AthleteStatLeader[];
  topAssisters: AthleteStatLeader[];
  topYellowCards: AthleteStatLeader[];
}

export function EditionStatsLeaders({
  topScorers,
  topAssisters,
  topYellowCards,
}: EditionStatsLeadersProps) {
  return (
    <div className="grid gap-12 lg:grid-cols-3">
      <LeaderBlock title="Artilharia" leaders={topScorers} valueKey="goals" />
      <LeaderBlock
        title="Assistências"
        leaders={topAssisters}
        valueKey="assists"
      />
      <LeaderBlock
        title="Cartões amarelos"
        leaders={topYellowCards}
        valueKey="yellow_cards"
      />
    </div>
  );
}
