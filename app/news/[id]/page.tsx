import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrgSlug, getOrganization } from "@/lib/org";
import { getNewsArticle } from "@/lib/data/news";
import { OrgImage } from "@/components/ui/OrgImage";
import { ArticleBody } from "@/components/news/ArticleBody";
import { ArticleTags } from "@/components/news/ArticleTags";
import { formatPublishedDate } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) return {};
  const article = await getNewsArticle(id, org.id);
  if (!article) return {};
  return {
    title: article.title,
    description: article.subtitle ?? undefined,
    openGraph: {
      title: article.title,
      description: article.subtitle ?? undefined,
      images: article.cover_url ? [article.cover_url] : [],
    },
  };
}

export default async function NoticiaDetailPage({ params }: Props) {
  const { id } = await params;
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) notFound();

  const article = await getNewsArticle(id, org.id);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/news"
        className="mb-8 inline-block text-xs font-bold uppercase tracking-wider text-white/40 transition-colors hover:text-[var(--color-brand)]"
      >
        ← Notícias
      </Link>

      {article.cover_url && (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl">
          <OrgImage
            src={article.cover_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <time className="text-xs text-white/40">
          {formatPublishedDate(article.published_at)}
        </time>
        <h1 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="mt-3 text-lg text-white/60">{article.subtitle}</p>
        )}
      </header>

      <ArticleBody body={article.body} />

      <footer className="mt-10 border-t border-white/[0.06] pt-8">
        <ArticleTags
          teams={article.tags_teams}
          competitions={article.tags_competitions}
        />
      </footer>
    </main>
  );
}