import Link from "next/link";

interface TagTeam {
  id: string;
  full_name: string;
  short_name: string | null;
  logo_url: string | null;
}

interface TagCompetition {
  id: string;
  full_name: string;
  short_name: string | null;
}

interface ArticleTagsProps {
  teams: TagTeam[];
  competitions: TagCompetition[];
}

export function ArticleTags({ teams, competitions }: ArticleTagsProps) {
  if (!teams.length && !competitions.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {competitions.map((c) => (
        <Link
          key={c.id}
          href={`/competicoes/${c.id}`}
          className="rounded-full border border-[var(--color-brand)]/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand)] transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/10"
        >
          {c.short_name ?? c.full_name}
        </Link>
      ))}
      {teams.map((t) => (
        <Link
          key={t.id}
          href={`/times/${t.id}`}
          className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/60 transition-colors hover:border-white/40 hover:text-white/90"
        >
          {t.short_name ?? t.full_name}
        </Link>
      ))}
    </div>
  );
}