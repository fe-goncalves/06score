interface MatchHubHeaderBgProps {
  accentColor: string;
}

export function MatchHubHeaderBg({ accentColor }: MatchHubHeaderBgProps) {
  return (
    <div className="match-hub-header-bg" aria-hidden>
      <div className="match-hub-header-gradient" />
      <div className="match-hub-header-grid" />
      <div
        className="match-hub-header-glow match-hub-header-glow--left"
        style={{ background: accentColor }}
      />
      <div
        className="match-hub-header-glow match-hub-header-glow--right"
        style={{ background: accentColor }}
      />
      <div className="match-hub-header-scanline" />
    </div>
  );
}
