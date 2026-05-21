import { OrgImage } from "@/components/ui/OrgImage";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { AthleteTeamStint } from "@/lib/types";
import { formatStintDate } from "@/lib/utils";

interface AthleteStintsTimelineProps {
  stints: AthleteTeamStint[];
}

export function AthleteStintsTimeline({ stints }: AthleteStintsTimelineProps) {
  return (
    <section className="py-8">
      <SectionTitle>Histórico de equipes</SectionTitle>
      {!stints.length ? (
        <p className="mt-4 text-sm text-white/40">Sem histórico.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {stints.map((stint) => (
            <li
              key={stint.id}
              className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-[#141414] px-4 py-3"
            >
              <OrgImage
                src={stint.teams?.logo_url}
                alt={stint.teams?.full_name ?? "Time"}
                width={32}
                height={32}
                className="h-8 w-8 rounded object-contain"
              />
              <div className="flex-1">
                <p className="font-semibold">{stint.teams?.full_name ?? "—"}</p>
                <p className="text-xs text-white/50">
                  {formatStintDate(stint.started_at)} —{" "}
                  {stint.is_current
                    ? "Atual"
                    : formatStintDate(stint.ended_at)}
                </p>
              </div>
              {stint.is_current && (
                <span className="text-[10px] font-bold uppercase text-[var(--color-brand)]">
                  Atual
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
