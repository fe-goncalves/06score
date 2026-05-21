import { OrgImage } from "@/components/ui/OrgImage";
import type { Competition, CompetitionEdition } from "@/lib/types";

interface CompetitionHubHeaderProps {
  competition: Competition;
  currentEdition: CompetitionEdition | null;
}

function seasonLabel(edition: CompetitionEdition | null): string {
  if (!edition) return "";
  const seasons = edition.seasons;
  if (Array.isArray(seasons)) return seasons[0]?.name ?? "";
  return seasons?.name ?? edition.custom_name ?? "";
}

export function CompetitionHubHeader({
  competition,
  currentEdition,
}: CompetitionHubHeaderProps) {
  return (
    <header className="mb-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
      <OrgImage
        src={competition.logo_url}
        alt={competition.full_name}
        width={96}
        height={96}
        className="h-20 w-20 shrink-0 rounded object-contain sm:h-24 sm:w-24"
      />
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wide sm:text-3xl">
          {competition.full_name}
        </h1>
        {currentEdition && (
          <p className="mt-2 text-sm text-white/50">
            {seasonLabel(currentEdition)}
            {currentEdition.is_current && (
              <span className="ml-2 text-[10px] font-bold uppercase text-[var(--color-brand)]">
                · Edição atual
              </span>
            )}
          </p>
        )}
      </div>
    </header>
  );
}
