"use client";

import { SectionEnter } from "@/components/ui/SectionEnter";

interface AthleteSectionProps {
  title: string;
  children: React.ReactNode;
  titleId?: string;
}

export function AthleteSection({
  title,
  children,
  titleId,
}: AthleteSectionProps) {
  const id = titleId ?? `athlete-section-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <SectionEnter className="athlete-section">
      <div className="athlete-section-inner card-surface">
        <header className="athlete-section-head">
          <span className="athlete-section-bar" aria-hidden />
          <h2 id={id} className="athlete-section-title">
            {title}
          </h2>
        </header>
        <div className="athlete-section-body">{children}</div>
      </div>
    </SectionEnter>
  );
}
