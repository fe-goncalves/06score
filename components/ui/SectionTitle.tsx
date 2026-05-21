interface SectionTitleProps {
  children: React.ReactNode;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return <h2 className="section-title mb-8">{children}</h2>;
}
