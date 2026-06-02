"use client";

import Image from "next/image";
import {
  getLabFieldMetrics,
  isLabFormationKey,
  LAB_TOTS_FORMATIONS,
  labSlotPosition,
} from "@/lib/tots/labPitch";

export interface LabTotsPitchSlot {
  name: string;
  photo: string | null;
  teamName: string;
  teamLogo: string | null;
  teamColor: string | null;
}

interface LabTotsPitchProps {
  formation: string;
  slots: (LabTotsPitchSlot | null)[];
}

export function LabTotsPitch({ formation, slots }: LabTotsPitchProps) {
  const formationKey = isLabFormationKey(formation) ? formation : "2-3-1";
  const formationSlots = LAB_TOTS_FORMATIONS[formationKey].slots;
  const { FW, FH, PAD_X, PAD_Y, INNER_W, INNER_H, AVATAR_R } =
    getLabFieldMetrics();

  return (
    <div className="lab-tots-pitch-scroll">
      <div className="lab-tots-pitch-wrap">
        <svg
          viewBox={`0 0 ${FW} ${FH}`}
          className="lab-tots-pitch-svg"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Campo da seleção da temporada"
        >
        <rect width={FW} height={FH} className="lab-tots-pitch-bg" />
        <rect
          x={PAD_X}
          y={PAD_Y}
          width={INNER_W}
          height={INNER_H}
          className="lab-tots-pitch-inner"
        />
        <line
          x1={FW / 2}
          y1={PAD_Y}
          x2={FW / 2}
          y2={PAD_Y + INNER_H}
          className="lab-tots-pitch-line"
        />
        <circle
          cx={FW / 2}
          cy={FH / 2}
          r={Math.min(INNER_H, INNER_W) * 0.13}
          className="lab-tots-pitch-line"
          fill="none"
        />
        <circle cx={FW / 2} cy={FH / 2} r={3} className="lab-tots-pitch-dot" />
        <rect
          x={PAD_X}
          y={PAD_Y + INNER_H * 0.22}
          width={INNER_W * 0.18}
          height={INNER_H * 0.56}
          className="lab-tots-pitch-line"
          fill="none"
        />
        <rect
          x={PAD_X}
          y={PAD_Y + INNER_H * 0.35}
          width={INNER_W * 0.08}
          height={INNER_H * 0.3}
          className="lab-tots-pitch-line"
          fill="none"
        />
        <rect
          x={PAD_X - 14}
          y={PAD_Y + INNER_H * 0.4}
          width={14}
          height={INNER_H * 0.2}
          className="lab-tots-pitch-goal"
          fill="none"
        />
        <circle
          cx={PAD_X + INNER_W * 0.12}
          cy={FH / 2}
          r={2.5}
          className="lab-tots-pitch-dot"
        />
        <rect
          x={PAD_X + INNER_W * 0.82}
          y={PAD_Y + INNER_H * 0.22}
          width={INNER_W * 0.18}
          height={INNER_H * 0.56}
          className="lab-tots-pitch-line"
          fill="none"
        />
        <rect
          x={PAD_X + INNER_W * 0.92}
          y={PAD_Y + INNER_H * 0.35}
          width={INNER_W * 0.08}
          height={INNER_H * 0.3}
          className="lab-tots-pitch-line"
          fill="none"
        />
        <rect
          x={PAD_X + INNER_W}
          y={PAD_Y + INNER_H * 0.4}
          width={14}
          height={INNER_H * 0.2}
          className="lab-tots-pitch-goal"
          fill="none"
        />
        <circle
          cx={PAD_X + INNER_W * 0.88}
          cy={FH / 2}
          r={2.5}
          className="lab-tots-pitch-dot"
        />

        {formationSlots.map((slot, i) => {
          const { cx, cy } = labSlotPosition(slot.col, slot.row, slot.total);
          const data = slots[i];
          const foSize = AVATAR_R * 2;

          if (!data) {
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={AVATAR_R}
                  className="lab-tots-slot-empty-ring"
                />
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  className="lab-tots-slot-empty-label"
                >
                  {slot.label}
                </text>
              </g>
            );
          }

          const teamColor = data.teamColor ?? "var(--color-brand)";

          return (
            <foreignObject
              key={i}
              x={cx - foSize / 2 - 8}
              y={cy - foSize / 2 - 8}
              width={foSize + 16}
              height={foSize + 48}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className="lab-tots-slot-fo"
              >
                <div
                  className="lab-tots-slot-avatar-wrap"
                  style={{ width: foSize, height: foSize }}
                >
                  <div
                    className="lab-tots-slot-avatar-glow"
                    aria-hidden
                    style={{
                      background: `radial-gradient(circle, ${teamColor}44 0%, transparent 70%)`,
                    }}
                  />
                  <div className="lab-tots-slot-avatar">
                    {data.photo ? (
                      <Image
                        src={data.photo}
                        alt=""
                        width={foSize}
                        height={foSize}
                        className="lab-tots-slot-avatar-img"
                      />
                    ) : (
                      <span className="lab-tots-slot-avatar-fallback">
                        {data.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {data.teamLogo && (
                    <span className="lab-tots-slot-team-badge">
                      <Image
                        src={data.teamLogo}
                        alt=""
                        width={14}
                        height={14}
                        className="h-[14px] w-[14px] object-contain"
                      />
                    </span>
                  )}
                </div>
                <p className="lab-tots-slot-name">{data.name}</p>
                {data.teamName && (
                  <p className="lab-tots-slot-team">{data.teamName}</p>
                )}
              </div>
            </foreignObject>
          );
        })}
        </svg>
      </div>
    </div>
  );
}
