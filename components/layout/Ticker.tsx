interface TickerProps {
  label: string;
}

function TickerTrack({ label }: { label: string }) {
  const segment = (
    <>
      <span>{label}</span>
      <span className="mx-4 opacity-60">·</span>
    </>
  );

  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className="inline-flex shrink-0 items-center">
          {segment}
        </span>
      ))}
    </>
  );
}

export function Ticker({ label }: TickerProps) {
  const text = label.trim();
  if (!text) return null;

  return (
    <div
      className="ticker relative z-40 h-7 overflow-hidden border-y border-[rgba(255,107,0,0.15)] bg-[rgba(255,107,0,0.08)]"
      aria-hidden
    >
      <div className="ticker-inner font-mono-label flex h-full items-center text-[9px] font-bold uppercase tracking-widest text-[var(--color-brand)]">
        <div className="inline-flex shrink-0 items-center">
          <TickerTrack label={text} />
        </div>
        <div className="inline-flex shrink-0 items-center">
          <TickerTrack label={text} />
        </div>
      </div>
    </div>
  );
}
