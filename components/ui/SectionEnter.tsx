"use client";

import { useInView } from "@/hooks/useInView";

interface SectionEnterProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionEnter({ children, className = "" }: SectionEnterProps) {
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      className={`section-enter section-fade-top ${inView ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
