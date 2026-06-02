interface FoulMeterProps {
  count: number;
  side: "home" | "away";
  max?: number;
}

export function FoulMeter({ count, side, max = 5 }: FoulMeterProps) {
  const lit = Math.min(Math.max(0, count), max);

  return (
    <div
      className={`match-foul-meter match-foul-meter--${side}`}
      aria-label={`${lit} de ${max} faltas`}
    >
      {Array.from({ length: max }, (_, index) => {
        const isActive =
          side === "home" ? index >= max - lit : index < lit;
        return (
          <span
            key={index}
            className={`match-foul-meter-bar ${isActive ? "match-foul-meter-bar--on" : ""}`}
          />
        );
      })}
    </div>
  );
}
