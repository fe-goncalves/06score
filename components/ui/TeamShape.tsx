const SHAPES = ["triangle", "circle", "square", "pentagon"] as const;

type ShapeKind = (typeof SHAPES)[number];

interface TeamShapeProps {
  index?: number;
  color?: string | null;
  size?: number;
  className?: string;
}

function shapePath(kind: ShapeKind, s: number): string {
  const c = s / 2;
  const pad = s * 0.18;
  switch (kind) {
    case "triangle":
      return `M ${c} ${pad} L ${s - pad} ${s - pad} L ${pad} ${s - pad} Z`;
    case "circle":
      return `M ${c} ${pad} A ${c - pad} ${c - pad} 0 1 1 ${c - 0.01} ${pad} Z`;
    case "square":
      return `M ${pad} ${pad} L ${s - pad} ${pad} L ${s - pad} ${s - pad} L ${pad} ${s - pad} Z`;
    case "pentagon": {
      const r = c - pad;
      const pts: string[] = [];
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        pts.push(`${c + r * Math.cos(a)},${c + r * Math.sin(a)}`);
      }
      return `M ${pts.join(" L ")} Z`;
    }
  }
}

export function TeamShape({
  index = 0,
  color,
  size = 32,
  className = "",
}: TeamShapeProps) {
  const kind = SHAPES[Math.abs(index) % SHAPES.length];
  const stroke = color ?? "rgba(255,255,255,0.4)";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d={shapePath(kind, size)}
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function getTeamShapeIndex(teamId?: string, fallbackIndex = 0): number {
  if (!teamId) return fallbackIndex;
  let hash = 0;
  for (let i = 0; i < teamId.length; i++) {
    hash = (hash + teamId.charCodeAt(i)) % 1000;
  }
  return hash;
}
