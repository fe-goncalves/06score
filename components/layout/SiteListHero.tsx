"use client";

import Link from "next/link";

interface SiteListHeroProps {
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  searchId?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchAutoFocus?: boolean;
}

export function SiteListHero({
  backHref = "/",
  backLabel = "Início",
  eyebrow,
  title,
  description,
  searchId,
  searchValue,
  onSearchChange,
  searchAutoFocus = false,
}: SiteListHeroProps) {
  const searchable = typeof onSearchChange === "function";

  return (
    <header className="site-list-hero page-container">
      <Link href={backHref} className="site-list-back-link">
        <span aria-hidden>←</span> {backLabel}
      </Link>
      {eyebrow ? <p className="site-list-eyebrow">{eyebrow}</p> : null}
      {searchable ? (
        <input
          id={searchId}
          type="search"
          value={searchValue ?? ""}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={title}
          autoComplete="off"
          spellCheck={false}
          autoFocus={searchAutoFocus}
          aria-label={title}
          className="site-list-title site-list-title-search"
        />
      ) : (
        <h1 className="site-list-title">{title}</h1>
      )}
      {description ? <p className="site-list-sub">{description}</p> : null}
    </header>
  );
}
