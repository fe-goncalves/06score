interface MatchTabPlaceholderProps {
  label: string;
}

export function MatchTabPlaceholder({ label }: MatchTabPlaceholderProps) {
  return (
    <p className="match-tab-placeholder font-mono-label py-14 text-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
      {label} — em breve
    </p>
  );
}
