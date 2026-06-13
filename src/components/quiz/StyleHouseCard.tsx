"use client";

import { ArchitecturalStyle } from "../../types/quiz";

/**
 * Hand-illustrated SVG elevations of the three colonial styles, used as the
 * "pictures of houses" the buyer chooses between. Each renders the signature
 * massing and details of its style so the choice is visual, not verbal.
 */

export interface HousePalette {
  wall: string;
  trim: string;
  roof: string;
  door: string;
  sky: string;
}

const PALETTES: Record<string, HousePalette> = {
  brick: { wall: "#a8553f", trim: "#f3efe6", roof: "#46423f", door: "#2e3a30", sky: "#eef2f5" },
  white: { wall: "#f0ece2", trim: "#ffffff", roof: "#46423f", door: "#33424a", sky: "#eef2f5" },
  cream: { wall: "#e7dcc4", trim: "#fbf8f1", roof: "#4d4844", door: "#3d2b1f", sky: "#eef2f5" },
};

const VB_W = 260;
const VB_H = 210;
const GROUND_Y = 190;

function Sky({ p }: { p: HousePalette }) {
  return (
    <>
      <rect x="0" y="0" width={VB_W} height={GROUND_Y} fill={p.sky} />
      <rect x="0" y={GROUND_Y} width={VB_W} height={VB_H - GROUND_Y} fill="#dcd3bb" />
      <line x1="0" y1={GROUND_Y} x2={VB_W} y2={GROUND_Y} stroke="#b3a98e" strokeWidth="1" />
    </>
  );
}

function Window({ x, y, w = 16, h = 22, p, shutters }: { x: number; y: number; w?: number; h?: number; p: HousePalette; shutters?: boolean }) {
  return (
    <g>
      {shutters && (
        <>
          <rect x={x - 6} y={y} width="5" height={h} fill={p.door} opacity="0.85" />
          <rect x={x + w + 1} y={y} width="5" height={h} fill={p.door} opacity="0.85" />
        </>
      )}
      <rect x={x} y={y} width={w} height={h} fill="#bcd0dd" stroke={p.trim} strokeWidth="2" />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={p.trim} strokeWidth="1" />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={p.trim} strokeWidth="1" />
    </g>
  );
}

// ── Federal ─────────────────────────────────────────────────────
function FederalHouse({ p }: { p: HousePalette }) {
  const bodyX = 46;
  const bodyW = 168;
  const bodyY = 66;
  const bodyH = GROUND_Y - bodyY;
  const cx = bodyX + bodyW / 2;
  const bays = [0, 1, 3, 4];
  return (
    <g>
      {/* low hipped roof */}
      <polygon points={`${bodyX - 4},${bodyY} ${bodyX + bodyW + 4},${bodyY} ${bodyX + bodyW - 30},${bodyY - 24} ${bodyX + 30},${bodyY - 24}`} fill={p.roof} />
      {/* roof-top balustrade — a Federal signature */}
      <rect x={cx - 34} y={bodyY - 30} width="68" height="6" fill="none" stroke={p.trim} strokeWidth="1.5" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={cx - 34 + i * 11} y1={bodyY - 30} x2={cx - 34 + i * 11} y2={bodyY - 24} stroke={p.trim} strokeWidth="1.5" />
      ))}
      {/* slender paired chimneys */}
      <rect x={bodyX + 6} y={bodyY - 30} width="7" height="14" fill={p.roof} />
      <rect x={bodyX + bodyW - 13} y={bodyY - 30} width="7" height="14" fill={p.roof} />
      {/* smooth facade */}
      <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} fill={p.wall} stroke="#8a8068" strokeWidth="1" />
      {/* upper + lower windows, delicate, no shutters */}
      {bays.map((i) => (
        <Window key={`u${i}`} x={bodyX + 16 + i * 34} y={bodyY + 12} p={p} />
      ))}
      {bays.map((i) => (
        <Window key={`l${i}`} x={bodyX + 16 + i * 34} y={bodyY + 52} p={p} />
      ))}
      {/* entry: door + slender sidelights + elliptical fanlight */}
      <rect x={cx - 17} y={GROUND_Y - 30} width="6" height="30" fill="#bcd0dd" stroke={p.trim} strokeWidth="1" />
      <rect x={cx + 11} y={GROUND_Y - 30} width="6" height="30" fill="#bcd0dd" stroke={p.trim} strokeWidth="1" />
      <rect x={cx - 9} y={GROUND_Y - 34} width="18" height="34" fill={p.door} stroke={p.trim} strokeWidth="1.5" />
      <path d={`M ${cx - 18} ${GROUND_Y - 34} A 18 12 0 0 1 ${cx + 18} ${GROUND_Y - 34}`} fill="#cfe0ea" stroke={p.trim} strokeWidth="1.5" />
      {[-12, -6, 0, 6, 12].map((dx) => (
        <line key={dx} x1={cx} y1={GROUND_Y - 34} x2={cx + dx} y2={GROUND_Y - 45} stroke={p.trim} strokeWidth="0.8" />
      ))}
    </g>
  );
}

// ── Georgian ────────────────────────────────────────────────────
function GeorgianHouse({ p }: { p: HousePalette }) {
  const bodyX = 46;
  const bodyW = 168;
  const bodyY = 70;
  const bodyH = GROUND_Y - bodyY;
  const cx = bodyX + bodyW / 2;
  const bays = [0, 1, 3, 4];
  return (
    <g>
      {/* side-gable roof */}
      <polygon points={`${bodyX - 6},${bodyY} ${bodyX + bodyW + 6},${bodyY} ${bodyX + bodyW + 6},${bodyY - 10} ${bodyX - 6},${bodyY - 10}`} fill={p.roof} />
      <polygon points={`${bodyX - 6},${bodyY - 10} ${bodyX + bodyW + 6},${bodyY - 10} ${cx},${bodyY - 38}`} fill={p.roof} opacity="0.85" />
      {/* central pedimented front gable */}
      <polygon points={`${cx - 30},${bodyY} ${cx + 30},${bodyY} ${cx},${bodyY - 30}`} fill={p.wall} stroke={p.trim} strokeWidth="2" />
      {/* paired end chimneys */}
      <rect x={bodyX - 2} y={bodyY - 34} width="9" height="20" fill={p.roof} />
      <rect x={bodyX + bodyW - 7} y={bodyY - 34} width="9" height="20" fill={p.roof} />
      {/* brick facade */}
      <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} fill={p.wall} stroke="#7c5040" strokeWidth="1" />
      {/* quoins */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={bodyX} y={bodyY + 6 + i * 18} width="8" height="9" fill={p.trim} opacity="0.9" />
          <rect x={bodyX + bodyW - 8} y={bodyY + 6 + i * 18} width="8" height="9" fill={p.trim} opacity="0.9" />
        </g>
      ))}
      {/* symmetrical windows with raised-panel shutters */}
      {bays.map((i) => (
        <Window key={`u${i}`} x={bodyX + 18 + i * 34} y={bodyY + 12} p={p} shutters />
      ))}
      {bays.map((i) => (
        <Window key={`l${i}`} x={bodyX + 18 + i * 34} y={bodyY + 52} p={p} shutters />
      ))}
      {/* centered door with pediment crown + pilasters */}
      <rect x={cx - 12} y={GROUND_Y - 38} width="24" height="38" fill={p.door} stroke={p.trim} strokeWidth="1.5" />
      <rect x={cx - 16} y={GROUND_Y - 38} width="4" height="38" fill={p.trim} />
      <rect x={cx + 12} y={GROUND_Y - 38} width="4" height="38" fill={p.trim} />
      <polygon points={`${cx - 18},${GROUND_Y - 40} ${cx + 18},${GROUND_Y - 40} ${cx},${GROUND_Y - 54}`} fill={p.trim} stroke="#8a8068" strokeWidth="0.8" />
    </g>
  );
}

// ── Greek Revival ───────────────────────────────────────────────
function GreekRevivalHouse({ p }: { p: HousePalette }) {
  const bodyX = 60;
  const bodyW = 140;
  const bodyY = 78;
  const bodyH = GROUND_Y - bodyY;
  const cx = bodyX + bodyW / 2;
  // full-width temple pediment
  const pedY = 40;
  return (
    <g>
      {/* deep wide pediment / front gable */}
      <polygon points={`${bodyX - 18},${bodyY} ${bodyX + bodyW + 18},${bodyY} ${cx},${pedY}`} fill={p.wall} stroke={p.trim} strokeWidth="2" />
      {/* entablature band */}
      <rect x={bodyX - 18} y={bodyY} width={bodyW + 36} height="10" fill={p.trim} stroke="#8a8068" strokeWidth="0.8" />
      {/* main body */}
      <rect x={bodyX} y={bodyY + 10} width={bodyW} height={bodyH - 10} fill={p.wall} stroke="#8a8068" strokeWidth="1" />
      {/* upper windows behind columns */}
      {[0, 1, 2].map((i) => (
        <Window key={`u${i}`} x={bodyX + 22 + i * 40} y={bodyY + 18} w={14} h={18} p={p} />
      ))}
      {/* full-height columns carrying the pediment */}
      {[0, 1, 2, 3].map((i) => {
        const colX = bodyX - 10 + i * ((bodyW + 20) / 3) - 4;
        return <rect key={i} x={colX} y={bodyY + 10} width="9" height={GROUND_Y - (bodyY + 10)} fill={p.trim} stroke="#8a8068" strokeWidth="0.8" />;
      })}
      {/* tall central door with rectangular transom + sidelights */}
      <rect x={cx - 14} y={GROUND_Y - 52} width="28" height="14" fill="#cfe0ea" stroke={p.trim} strokeWidth="1.2" />
      <rect x={cx - 13} y={GROUND_Y - 38} width="26" height="38" fill={p.door} stroke={p.trim} strokeWidth="1.5" />
      <line x1={cx} y1={GROUND_Y - 38} x2={cx} y2={GROUND_Y} stroke={p.trim} strokeWidth="1" />
    </g>
  );
}

interface Props {
  style: ArchitecturalStyle;
  palette?: keyof typeof PALETTES;
  className?: string;
}

export default function StyleHouseCard({ style, palette = "brick", className }: Props) {
  const p = PALETTES[palette] ?? PALETTES.brick;
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={className ?? "w-full h-auto"} role="img" aria-label={`${style} colonial house`}>
      <Sky p={p} />
      {style === "Federal" && <FederalHouse p={p} />}
      {style === "Georgian" && <GeorgianHouse p={p} />}
      {style === "Greek Revival" && <GreekRevivalHouse p={p} />}
    </svg>
  );
}
