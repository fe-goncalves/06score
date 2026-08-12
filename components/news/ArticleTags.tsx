import Link from "next/link";
import { OrgImage } from "@/components/ui/OrgImage";

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
  logo_url?: string | null;
}

interface ArticleTagsProps {
  teams: TagTeam[];
  competitions: TagCompetition[];
}

type TagItem = {
  key: string;
  href: string;
  label: string;
  logoUrl: string | null;
};

export function ArticleTags({ teams, competitions }: ArticleTagsProps) {
  const items: TagItem[] = [
    ...competitions.map((competition) => ({
      key: `comp-${competition.id}`,
      href: `/competicoes/${competition.id}`,
      label: (competition.short_name ?? competition.full_name).trim(),
      logoUrl: competition.logo_url?.trim() || null,
    })),
    ...teams.map((team) => ({
      key: `team-${team.id}`,
      href: `/times/${team.id}`,
      label: (team.short_name ?? team.full_name).trim(),
      logoUrl: team.logo_url?.trim() || null,
    })),
  ].filter((item) => item.label);

  if (!items.length) return null;

  return (
    <nav className="article-tags" aria-label="Tags">
      {items.map((item, index) => (
        <span key={item.key} className="article-tag-wrap">
          {index > 0 ? (
            <span className="article-tag-sep" aria-hidden>
              ·
            </span>
          ) : null}
          <Link href={item.href} className="article-tag">
            <span className="article-tag-logo-slot">
              {item.logoUrl ? (
                <OrgImage
                  src={item.logoUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="article-tag-logo"
                />
              ) : (
                <span className="article-tag-logo article-tag-logo--ph" aria-hidden />
              )}
            </span>
            <span className="article-tag-label">{item.label}</span>
          </Link>
        </span>
      ))}
    </nav>
  );
}
