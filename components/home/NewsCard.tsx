import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OrgImage } from "@/components/ui/OrgImage";
import type { NewsArticle } from "@/lib/types";
import { formatPublishedDate } from "@/lib/utils";

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Link href={`/noticias/${article.id}`}>
      <Card as="article" className="overflow-hidden">
        <div className="relative aspect-[16/10] w-full bg-white/5">
          <OrgImage
            src={article.cover_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-5">
          <time className="text-xs text-white/40">
            {formatPublishedDate(article.published_at)}
          </time>
          <h3 className="mt-2 line-clamp-2 font-bold leading-snug">
            {article.title}
          </h3>
          {article.subtitle && (
            <p className="mt-2 line-clamp-2 text-sm text-white/50">
              {article.subtitle}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
