import { INNER_H, INNER_W, TOTW_FIELD } from "@/lib/totw/formations";

/** Linhas do campo (somente SVG, sem jogadores). */
export function TotwPitchLines() {
  const { width: FW, height: FH, padX: PAD_X, padY: PAD_Y } = TOTW_FIELD;

  return (
    <svg
      viewBox={`0 0 ${FW} ${FH}`}
      className="absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width={FW} height={FH} fill="transparent" />
      <rect
        x={PAD_X}
        y={PAD_Y}
        width={INNER_W}
        height={INNER_H}
        fill="none"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1"
      />
      <line
        x1={FW / 2}
        y1={PAD_Y}
        x2={FW / 2}
        y2={PAD_Y + INNER_H}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      <circle
        cx={FW / 2}
        cy={FH / 2}
        r={Math.min(INNER_H, INNER_W) * 0.13}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      <circle cx={FW / 2} cy={FH / 2} r="2.5" fill="rgba(255,255,255,0.15)" />
      <rect
        x={PAD_X}
        y={PAD_Y + INNER_H * 0.22}
        width={INNER_W * 0.18}
        height={INNER_H * 0.56}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      <rect
        x={PAD_X}
        y={PAD_Y + INNER_H * 0.35}
        width={INNER_W * 0.08}
        height={INNER_H * 0.3}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      <rect
        x={PAD_X + INNER_W * 0.82}
        y={PAD_Y + INNER_H * 0.22}
        width={INNER_W * 0.18}
        height={INNER_H * 0.56}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      <rect
        x={PAD_X + INNER_W * 0.92}
        y={PAD_Y + INNER_H * 0.35}
        width={INNER_W * 0.08}
        height={INNER_H * 0.3}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
    </svg>
  );
}
