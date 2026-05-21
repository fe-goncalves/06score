import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article";
}

export function Card({ children, className = "", as: Tag = "div" }: CardProps) {
  return (
    <Tag className={`card-base ${className}`}>{children}</Tag>
  );
}
