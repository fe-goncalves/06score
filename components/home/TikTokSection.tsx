import Link from "next/link";
import { TikTokCreatorEmbed } from "@/components/home/TikTokCreatorEmbed";
import { TikTokEmbed } from "@/components/home/TikTokEmbed";
import { SectionEnter } from "@/components/ui/SectionEnter";
import { extractTikTokUsername } from "@/lib/tiktok";
import type { HomeTikTokVideo, Organization } from "@/lib/types";

interface TikTokSectionProps {
  org: Organization;
  videos: HomeTikTokVideo[];
  creatorEmbedHtml?: string | null;
}

export function TikTokSection({
  org,
  videos,
  creatorEmbedHtml,
}: TikTokSectionProps) {
  const username = extractTikTokUsername(org.tiktok_url);
  const profileHref =
    org.tiktok_url ??
    (username ? `https://www.tiktok.com/@${username}` : null);

  const hasCreatorEmbed = !!creatorEmbedHtml;
  if (!videos.length && !hasCreatorEmbed && !profileHref) return null;

  return (
    <SectionEnter className="tiktok-section py-8 md:py-10">
      <div className="page-container">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono-label text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--color-brand)]">
              Redes
            </p>
            <h2 className="font-display text-xl font-black uppercase text-white md:text-2xl">
              TikTok
            </h2>
          </div>
          {profileHref ? (
            <Link
              href={profileHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-label shrink-0 text-[9px] font-bold uppercase tracking-wider text-white/50 transition-colors hover:text-[var(--color-brand)]"
            >
              {username ? `@${username}` : "Ver perfil"}
            </Link>
          ) : null}
        </div>

        {videos.length > 0 ? (
          <div className="tiktok-scroll">
            {videos.map((video) => (
              <article key={video.id} className="tiktok-card">
                <TikTokEmbed videoId={video.video_id} title={video.title} />
                {video.title ? (
                  <p className="font-mono-label mt-2 line-clamp-2 px-1 text-[9px] uppercase text-white/55">
                    {video.title}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : hasCreatorEmbed ? (
          <TikTokCreatorEmbed html={creatorEmbedHtml} />
        ) : profileHref ? (
          <Link
            href={profileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="tiktok-profile-fallback group flex flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center transition-colors hover:border-[var(--color-brand)]/40 hover:bg-white/[0.04]"
          >
            <span className="font-display text-2xl font-black uppercase text-white group-hover:text-[var(--color-brand)]">
              {username ? `@${username}` : "Abrir TikTok"}
            </span>
            <p className="font-mono-label mt-2 max-w-sm text-[10px] uppercase text-white/45">
              Não foi possível carregar os vídeos. Abra o perfil no TikTok.
            </p>
          </Link>
        ) : null}
      </div>
    </SectionEnter>
  );
}
