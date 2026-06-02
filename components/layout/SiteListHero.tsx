import Link from "next/link";

interface SiteListHeroProps {
  backHref?: string;
  backLabel?: string;
  eyebrow: string;
  title: string;
  description: string;
}

export function SiteListHero({
  backHref = "/",
  backLabel = "Início",
  eyebrow,
  title,
  description,
}: SiteListHeroProps) {
  return (
    <header className="site-list-hero page-container">
      <Link href={backHref} className="site-list-back-link">
        <span aria-hidden>←</span> {backLabel}
      </Link>
      <p className="site-list-eyebrow">{eyebrow}</p>
      <h1 className="site-list-title font-display">{title}</h1>
      <p className="site-list-sub font-body">{description}</p>
    </header>
  );
}
