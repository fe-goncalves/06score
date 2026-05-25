import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article";
  elevated?: boolean;
}

export function Card({
  children,
  className = "",
  as: Tag = "div",
  elevated = false,
}: CardProps) {
  return (
    <Tag
      className={`${elevated ? "card-surface-elevated" : "card-surface"} ${className}`}
    >
      {children}
    </Tag>
  );
}
