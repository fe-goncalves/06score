import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OrgImage } from "@/components/ui/OrgImage";
import { formatPublishedDate } from "@/lib/utils";

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    subtitle: string | null;
    cover_url: string | null;
    published_at: string | null;
  };
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Link href={`/news/${article.id}`} className="group block">
      <Card as="article" className="overflow-hidden">
        <div className="news-card-media relative aspect-[16/10] w-full bg-white/[0.05]">
          <OrgImage
            src={article.cover_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <time className="font-mono-label text-[8px] uppercase text-white/40">
            {formatPublishedDate(article.published_at)}
          </time>
          <h3 className="font-display mt-2 line-clamp-2 text-base font-black uppercase leading-snug">
            {article.title}
          </h3>
          {article.subtitle && (
            <p className="font-body mt-2 line-clamp-2 text-sm text-white/50">
              {article.subtitle}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
