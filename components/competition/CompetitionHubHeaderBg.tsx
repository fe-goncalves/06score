interface CompetitionHubHeaderBgProps {
  accentColor: string;
}

type Triangle = { x: number; y: number; size: number; opacity: number; delay: number };

const TOP_LEFT: Triangle[] = [
  { x: 0, y: 0, size: 28, opacity: 0.7, delay: 0 },
  { x: 22, y: 0, size: 22, opacity: 0.55, delay: 0.4 },
  { x: 44, y: 0, size: 16, opacity: 0.42, delay: 0.8 },
  { x: 64, y: 0, size: 11, opacity: 0.3, delay: 1.2 },
  { x: 0, y: 24, size: 24, opacity: 0.58, delay: 0.6 },
  { x: 24, y: 20, size: 18, opacity: 0.45, delay: 1.0 },
  { x: 46, y: 16, size: 14, opacity: 0.34, delay: 1.4 },
  { x: 66, y: 12, size: 10, opacity: 0.24, delay: 1.8 },
  { x: 0, y: 46, size: 20, opacity: 0.48, delay: 1.2 },
  { x: 22, y: 40, size: 15, opacity: 0.36, delay: 1.6 },
  { x: 44, y: 34, size: 11, opacity: 0.26, delay: 2.0 },
  { x: 64, y: 28, size: 8, opacity: 0.18, delay: 2.4 },
  { x: 0, y: 66, size: 16, opacity: 0.38, delay: 1.8 },
  { x: 24, y: 58, size: 12, opacity: 0.28, delay: 2.2 },
  { x: 46, y: 50, size: 9, opacity: 0.2, delay: 2.6 },
  { x: 10, y: 86, size: 13, opacity: 0.3, delay: 2.4 },
  { x: 32, y: 76, size: 10, opacity: 0.22, delay: 2.8 },
];

/** Menos triângulos, mais compactos — cantos no mobile sem invadir o conteúdo */
const MOBILE_TOP_LEFT: Triangle[] = [
  { x: 0, y: 0, size: 18, opacity: 0.55, delay: 0 },
  { x: 16, y: 0, size: 14, opacity: 0.42, delay: 0.4 },
  { x: 30, y: 0, size: 10, opacity: 0.32, delay: 0.8 },
  { x: 0, y: 16, size: 15, opacity: 0.45, delay: 0.6 },
  { x: 18, y: 14, size: 11, opacity: 0.35, delay: 1.0 },
  { x: 32, y: 10, size: 8, opacity: 0.26, delay: 1.4 },
  { x: 0, y: 30, size: 12, opacity: 0.38, delay: 1.2 },
  { x: 16, y: 26, size: 9, opacity: 0.28, delay: 1.6 },
  { x: 30, y: 22, size: 7, opacity: 0.2, delay: 2.0 },
];

const MOBILE_CORNER_VIEW = { w: 48, h: 44 };

function mirrorTriangles(triangles: Triangle[]): Triangle[] {
  return triangles.map((t) => ({ ...t, x: -t.x, y: -t.y }));
}

const BOTTOM_RIGHT = mirrorTriangles(TOP_LEFT);
const MOBILE_BOTTOM_RIGHT = mirrorTriangles(MOBILE_TOP_LEFT);

function upwardTrianglePath(cx: number, cy: number, size: number): string {
  const h = size * 0.866;
  return `M${cx} ${cy + h * 0.33} L${cx + size / 2} ${cy - h * 0.67} L${cx - size / 2} ${cy - h * 0.67} Z`;
}

function AnimatedCorner({
  triangles,
  accentColor,
  className,
}: {
  triangles: Triangle[];
  accentColor: string;
  className: string;
}) {
  return (
    <g className={className}>
      {triangles.map((t, i) => (
        <path
          key={i}
          d={upwardTrianglePath(t.x, t.y, t.size)}
          fill={accentColor}
          fillOpacity={t.opacity}
          className="competition-hub-header-corner-tri"
          style={{ animationDelay: `${t.delay}s` }}
        />
      ))}
    </g>
  );
}

export function CompetitionHubHeaderBg({
  accentColor,
}: CompetitionHubHeaderBgProps) {
  const { w, h } = MOBILE_CORNER_VIEW;

  return (
    <>
      {/* Desktop: triângulos esticados com o header */}
      <svg
        className="competition-hub-header-svg competition-hub-header-svg--desktop"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
      >
        <AnimatedCorner
          triangles={TOP_LEFT}
          accentColor={accentColor}
          className="competition-hub-header-corner-tl"
        />
        <g transform="translate(1200, 220)">
          <AnimatedCorner
            triangles={BOTTOM_RIGHT}
            accentColor={accentColor}
            className="competition-hub-header-corner-br"
          />
        </g>
      </svg>

      {/* Mobile: cantos fixos, sem distorcer sobre breadcrumb/tabs */}
      <svg
        className="competition-hub-header-svg-corner competition-hub-header-svg-corner--tl"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMinYMin meet"
      >
        <AnimatedCorner
          triangles={MOBILE_TOP_LEFT}
          accentColor={accentColor}
          className="competition-hub-header-corner-tl competition-hub-header-corner-tl--mobile"
        />
      </svg>
      <svg
        className="competition-hub-header-svg-corner competition-hub-header-svg-corner--br"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMaxYMax meet"
      >
        <g transform={`translate(${w}, ${h})`}>
          <AnimatedCorner
            triangles={MOBILE_BOTTOM_RIGHT}
            accentColor={accentColor}
            className="competition-hub-header-corner-br competition-hub-header-corner-br--mobile"
          />
        </g>
      </svg>
    </>
  );
}
