"use client";

// Pencil-sketch exterior components — ported from the House Design handoff
// bundle (window-components.jsx). Units are inches. All components render
// as <g transform="translate(x,y)"> blocks so they compose on a shared
// inch grid.

import React from "react";

// ---------- Shared dimensional constants (inches) ----------
const BRICK_MOLD = 2.0;
const FRAME_JAMB = 0.75;
const SASH_STILE = 2.0;
const TOP_RAIL = 2.0;
const BOTTOM_RAIL = 2.0;
const MEETING_RAIL = 1.5;
const MUNTIN = 0.6;
const SHADOW_DX = 0.45;
const SHADOW_DY = 0.55;

const SHUT_STILE = 1.5;
const SHUT_RAIL_TB = 3.0;
const SHUT_RAIL_MID = 3.0;
const LOUVER_H = 1.5;
const SHUT_W_DEFAULT = 16;

const ROOF_PITCH = 6 / 12;
const FASCIA_DROP = 4;
const SHINGLE_EXPOSURE = 6;
const SHINGLE_TAB = 14;

// ---------- Geometry helpers ----------
type Rect = { x: number; y: number; w: number; h: number };

function makeWindowGeometry(widthFt: number, heightFt: number, cols = 3, rows = 2) {
  const w = widthFt * 12;
  const h = heightFt * 12;
  const op: Rect = { x: FRAME_JAMB, y: FRAME_JAMB, w: w - 2 * FRAME_JAMB, h: h - 2 * FRAME_JAMB };
  const sashH = op.h / 2;
  const topSash: Rect = { x: op.x, y: op.y, w: op.w, h: sashH };
  const botSash: Rect = { x: op.x, y: op.y + sashH, w: op.w, h: sashH };
  const topGlass: Rect = {
    x: op.x + SASH_STILE,
    y: op.y + TOP_RAIL,
    w: op.w - 2 * SASH_STILE,
    h: sashH - TOP_RAIL - MEETING_RAIL,
  };
  const botGlass: Rect = {
    x: op.x + SASH_STILE,
    y: op.y + sashH + MEETING_RAIL,
    w: op.w - 2 * SASH_STILE,
    h: sashH - MEETING_RAIL - BOTTOM_RAIL,
  };
  function muntins(glass: Rect) {
    const colW = (glass.w - (cols - 1) * MUNTIN) / cols;
    const rowH = (glass.h - (rows - 1) * MUNTIN) / rows;
    const verts: Rect[] = [];
    for (let i = 1; i < cols; i++) {
      verts.push({
        x: glass.x + i * colW + (i - 1) * MUNTIN,
        y: glass.y,
        w: MUNTIN,
        h: glass.h,
      });
    }
    const horzs: Rect[] = [];
    for (let i = 1; i < rows; i++) {
      horzs.push({
        x: glass.x,
        y: glass.y + i * rowH + (i - 1) * MUNTIN,
        w: glass.w,
        h: MUNTIN,
      });
    }
    return { verts, horzs, all: [...verts, ...horzs] };
  }
  return {
    width: w,
    height: h,
    opening: op,
    sashH,
    topSash,
    botSash,
    topGlass,
    botGlass,
    topM: muntins(topGlass),
    botM: muntins(botGlass),
  };
}

function makeShutterGeometry(widthIn: number, heightIn: number) {
  const louverTotal = heightIn - SHUT_RAIL_TB * 2 - SHUT_RAIL_MID;
  const upperH = louverTotal / 2;
  const lowerH = louverTotal / 2;
  const louverX = SHUT_STILE;
  const louverW = widthIn - 2 * SHUT_STILE;
  const slatsU = Math.max(2, Math.round(upperH / LOUVER_H));
  const slatsL = Math.max(2, Math.round(lowerH / LOUVER_H));
  return {
    width: widthIn,
    height: heightIn,
    rails: {
      top: { x: 0, y: 0, w: widthIn, h: SHUT_RAIL_TB } as Rect,
      mid: { x: 0, y: SHUT_RAIL_TB + upperH, w: widthIn, h: SHUT_RAIL_MID } as Rect,
      bot: { x: 0, y: heightIn - SHUT_RAIL_TB, w: widthIn, h: SHUT_RAIL_TB } as Rect,
    },
    panels: {
      upper: { x: louverX, y: SHUT_RAIL_TB, w: louverW, h: upperH } as Rect,
      lower: {
        x: louverX,
        y: SHUT_RAIL_TB + upperH + SHUT_RAIL_MID,
        w: louverW,
        h: lowerH,
      } as Rect,
    },
    upper: { x: louverX, y: SHUT_RAIL_TB, w: louverW, h: upperH, n: slatsU, slatH: upperH / slatsU },
    lower: {
      x: louverX,
      y: SHUT_RAIL_TB + upperH + SHUT_RAIL_MID,
      w: louverW,
      h: lowerH,
      n: slatsL,
      slatH: lowerH / slatsL,
    },
  };
}

// Reusable jittered-rectangle sketch — draws ~2 wobbling outlines per rect.
function makeSketchRect(filterId: string) {
  return function sketchRect(r: Rect, key: string, weight = 0.07, passes = 2) {
    const out: React.ReactElement[] = [];
    for (let p = 0; p < passes; p++) {
      const j = (n: number) => Math.sin((p + 1) * (n + key.length)) * 0.05;
      const o1 = j(1),
        o2 = j(2),
        o3 = j(3),
        o4 = j(4);
      const ov = 0.1 * (p + 1);
      const d = `M ${r.x - ov + o1} ${r.y + o1}
                 L ${r.x + r.w + ov + o2} ${r.y + o2}
                 M ${r.x + r.w + o3} ${r.y - ov + o3}
                 L ${r.x + r.w + o4} ${r.y + r.h + ov + o4}
                 M ${r.x + r.w + ov - o1} ${r.y + r.h - o1}
                 L ${r.x - ov - o2} ${r.y + r.h - o2}
                 M ${r.x - o3} ${r.y + r.h + ov - o3}
                 L ${r.x - o4} ${r.y - ov - o4}`;
      out.push(
        <path
          key={`${key}-p${p}`}
          d={d}
          fill="none"
          stroke="#2a241d"
          strokeWidth={weight}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.55 + p * 0.15}
          filter={`url(#${filterId})`}
        />
      );
    }
    return out;
  };
}

// =====================================================================
// PENCIL WINDOW — 3'×6' double-hung, 6/6 grid
// =====================================================================
export function PencilWindow({
  x = 0,
  y = 0,
  widthFt = 3,
  heightFt = 6,
}: {
  x?: number;
  y?: number;
  widthFt?: number;
  heightFt?: number;
}) {
  const g = makeWindowGeometry(widthFt, heightFt);
  const id = React.useId().replace(/:/g, "");
  const sketchRect = makeSketchRect(`${id}-rough`);

  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="0.5" />
        </filter>
        <filter id={`${id}-rough2`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="11" />
          <feDisplacementMap in="SourceGraphic" scale="0.25" />
        </filter>
        <clipPath id={`${id}-tCl`}>
          <rect {...g.topGlass} />
        </clipPath>
        <clipPath id={`${id}-bCl`}>
          <rect {...g.botGlass} />
        </clipPath>
        <pattern id={`${id}-hatch`} patternUnits="userSpaceOnUse" width="0.55" height="0.55" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.55" stroke="#2c2620" strokeWidth="0.08" />
        </pattern>
        <pattern id={`${id}-hatchX`} patternUnits="userSpaceOnUse" width="0.7" height="0.7" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="0.7" stroke="#2c2620" strokeWidth="0.06" />
        </pattern>
      </defs>

      {/* Light glass tone */}
      <rect {...g.topGlass} fill="#cfd9df" fillOpacity="0.45" filter={`url(#${id}-rough2)`} />
      <rect {...g.botGlass} fill="#cfd9df" fillOpacity="0.45" filter={`url(#${id}-rough2)`} />

      {/* Cross-hatch shadow under raised muntins */}
      <g clipPath={`url(#${id}-tCl)`}>
        {g.topM.all.map((m, i) => (
          <g key={i}>
            <rect x={m.x + SHADOW_DX} y={m.y + SHADOW_DY} width={m.w} height={m.h} fill={`url(#${id}-hatch)`} opacity="0.85" />
            <rect x={m.x + SHADOW_DX} y={m.y + SHADOW_DY} width={m.w} height={m.h} fill={`url(#${id}-hatchX)`} opacity="0.55" />
          </g>
        ))}
      </g>
      <g clipPath={`url(#${id}-bCl)`}>
        {g.botM.all.map((m, i) => (
          <g key={i}>
            <rect x={m.x + SHADOW_DX} y={m.y + SHADOW_DY} width={m.w} height={m.h} fill={`url(#${id}-hatch)`} opacity="0.85" />
            <rect x={m.x + SHADOW_DX} y={m.y + SHADOW_DY} width={m.w} height={m.h} fill={`url(#${id}-hatchX)`} opacity="0.55" />
          </g>
        ))}
      </g>

      {/* Faint hatch on the brick mold (corner shading) */}
      <g opacity="0.35">
        <rect x={-BRICK_MOLD} y={-BRICK_MOLD} width={g.width + 2 * BRICK_MOLD} height={BRICK_MOLD * 0.5} fill={`url(#${id}-hatchX)`} />
        <rect x={-BRICK_MOLD} y={-BRICK_MOLD} width={BRICK_MOLD * 0.5} height={g.height + 2 * BRICK_MOLD} fill={`url(#${id}-hatchX)`} />
      </g>

      {/* Outline strokes — jittered passes */}
      <g>
        {sketchRect({ x: -BRICK_MOLD, y: -BRICK_MOLD, w: g.width + 2 * BRICK_MOLD, h: g.height + 2 * BRICK_MOLD }, "bm", 0.08, 2)}
        {sketchRect({ x: -BRICK_MOLD + 0.5, y: -BRICK_MOLD + 0.5, w: g.width + 2 * BRICK_MOLD - 1, h: g.height + 2 * BRICK_MOLD - 1 }, "bm2", 0.06, 1)}
        {sketchRect({ x: 0, y: 0, w: g.width, h: g.height }, "fr", 0.08, 2)}
        {sketchRect(g.topSash, "ts", 0.07, 2)}
        {sketchRect(g.botSash, "bs", 0.07, 2)}
        {sketchRect(g.topGlass, "tg", 0.07, 2)}
        {sketchRect(g.botGlass, "bg", 0.07, 2)}
        {g.topM.all.map((m, i) => sketchRect(m, `tm${i}`, 0.05, 1))}
        {g.botM.all.map((m, i) => sketchRect(m, `bm${i}`, 0.05, 1))}
      </g>
    </g>
  );
}

// =====================================================================
// PENCIL SHUTTER — louvered single panel
// =====================================================================
export function PencilShutter({
  x = 0,
  y = 0,
  widthIn = SHUT_W_DEFAULT,
  heightIn = 72,
  hingeSide = "left",
  withHinges = false,
  withDog = false,
  dogSide = "right",
}: {
  x?: number;
  y?: number;
  widthIn?: number;
  heightIn?: number;
  hingeSide?: "left" | "right";
  withHinges?: boolean;
  withDog?: boolean;
  dogSide?: "left" | "right";
}) {
  const sg = makeShutterGeometry(widthIn, heightIn);
  const id = React.useId().replace(/:/g, "");
  const sketchRect = makeSketchRect(`${id}-rough`);

  function louvers(field: { x: number; y: number; w: number; h: number; n: number; slatH: number }, key: string) {
    const out: React.ReactElement[] = [];
    for (let i = 0; i < field.n; i++) {
      const yTop = field.y + i * field.slatH;
      const yShad = yTop + field.slatH * 0.62;
      out.push(
        <line
          key={`${key}-t${i}`}
          x1={field.x + 0.18}
          y1={yTop}
          x2={field.x + field.w - 0.18}
          y2={yTop}
          stroke="#2a241d"
          strokeWidth="0.07"
          strokeLinecap="round"
          opacity="0.7"
          filter={`url(#${id}-rough2)`}
        />
      );
      out.push(
        <rect
          key={`${key}-h${i}`}
          x={field.x + 0.25}
          y={yTop + field.slatH * 0.1}
          width={field.w - 0.5}
          height={field.slatH * 0.55}
          fill={`url(#${id}-louvHatch)`}
          opacity="0.55"
        />
      );
      out.push(
        <line
          key={`${key}-s${i}`}
          x1={field.x + 0.25}
          y1={yShad}
          x2={field.x + field.w - 0.25}
          y2={yShad}
          stroke="#2a241d"
          strokeWidth="0.04"
          strokeLinecap="round"
          opacity="0.4"
          filter={`url(#${id}-rough2)`}
        />
      );
    }
    out.push(
      <line
        key={`${key}-end`}
        x1={field.x + 0.18}
        y1={field.y + field.h}
        x2={field.x + field.w - 0.18}
        y2={field.y + field.h}
        stroke="#2a241d"
        strokeWidth="0.07"
        strokeLinecap="round"
        opacity="0.7"
        filter={`url(#${id}-rough2)`}
      />
    );
    return out;
  }

  function strapHinge(yCenter: number, side: "left" | "right") {
    const bodyW = 1.3;
    const bodyH = 2.6;
    const strapW = 1.3;
    const strapH = 0.7;
    const innerX = side === "left" ? 0 : widthIn;
    const bodyX = side === "left" ? innerX - bodyW + 0.3 : innerX - 0.3;
    const strapX = side === "left" ? innerX + 0.3 : innerX - strapW - 0.3;
    return (
      <g key={`hin-${yCenter}`} filter={`url(#${id}-rough2)`}>
        <rect x={strapX} y={yCenter - strapH / 2} width={strapW} height={strapH} fill="#1a1612" opacity="0.85" />
        <rect x={bodyX} y={yCenter - bodyH / 2} width={bodyW} height={bodyH} fill="#1a1612" opacity="0.9" />
        <circle
          cx={strapX + (side === "left" ? strapW - 0.35 : 0.35)}
          cy={yCenter}
          r={0.13}
          fill="#f7f3e8"
          opacity="0.7"
        />
      </g>
    );
  }

  function shutterDog(side: "left" | "right") {
    const cx = side === "left" ? -0.5 : widthIn + 0.5;
    const dir = side === "left" ? 1 : -1;
    const d = `
      M ${cx} ${heightIn}
      L ${cx} ${heightIn + 0.6}
      C ${cx} ${heightIn + 1.4}, ${cx + dir * 1.6} ${heightIn + 1.6}, ${cx + dir * 1.6} ${heightIn + 2.4}
      C ${cx + dir * 1.6} ${heightIn + 3.2}, ${cx} ${heightIn + 3.2}, ${cx} ${heightIn + 4.0}
      C ${cx} ${heightIn + 4.6}, ${cx + dir * 1.0} ${heightIn + 4.8}, ${cx + dir * 1.4} ${heightIn + 4.4}
    `;
    return (
      <g key="dog" filter={`url(#${id}-rough2)`}>
        <path
          d={d}
          fill="none"
          stroke="#1a1612"
          strokeWidth="0.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x={cx - 0.3} y={heightIn - 0.1} width={0.6} height={0.5} fill="#1a1612" />
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="0.5" />
        </filter>
        <filter id={`${id}-rough2`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="13" />
          <feDisplacementMap in="SourceGraphic" scale="0.25" />
        </filter>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08 0.9" numOctaves="2" seed="5" />
          <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.32  0 0 0 0 0.20  0 0 0 0.18 0" />
        </filter>
        <pattern id={`${id}-louvHatch`} patternUnits="userSpaceOnUse" width="0.32" height="0.32" patternTransform="rotate(8)">
          <line x1="0" y1="0" x2="0.32" y2="0" stroke="#2a241d" strokeWidth="0.06" />
        </pattern>
      </defs>

      {/* Faint warm wash for wood tone */}
      <rect x={-0.3} y={-0.3} width={widthIn + 0.6} height={heightIn + 0.6} fill="#e7dcc1" fillOpacity="0.45" filter={`url(#${id}-rough2)`} />
      <rect x={0} y={0} width={widthIn} height={heightIn} fill="#a98a5d" fillOpacity="0.18" filter={`url(#${id}-grain)`} />

      {louvers(sg.upper, "u")}
      {louvers(sg.lower, "l")}

      {sketchRect({ x: 0, y: 0, w: widthIn, h: heightIn }, "outer", 0.09, 2)}
      {sketchRect(sg.panels.upper, "panU", 0.06, 1)}
      {sketchRect(sg.panels.lower, "panL", 0.06, 1)}

      <g filter={`url(#${id}-rough)`} fill="none" stroke="#2a241d" strokeWidth="0.1" strokeLinecap="round" opacity="0.65">
        <line x1={0.2} y1={SHUT_RAIL_TB} x2={widthIn - 0.2} y2={SHUT_RAIL_TB} />
        <line x1={0.2} y1={heightIn - SHUT_RAIL_TB} x2={widthIn - 0.2} y2={heightIn - SHUT_RAIL_TB} />
        <line x1={0.2} y1={sg.rails.mid.y} x2={widthIn - 0.2} y2={sg.rails.mid.y} />
        <line x1={0.2} y1={sg.rails.mid.y + sg.rails.mid.h} x2={widthIn - 0.2} y2={sg.rails.mid.y + sg.rails.mid.h} />
        <line x1={SHUT_STILE} y1={SHUT_RAIL_TB + 0.2} x2={SHUT_STILE} y2={heightIn - SHUT_RAIL_TB - 0.2} />
        <line x1={widthIn - SHUT_STILE} y1={SHUT_RAIL_TB + 0.2} x2={widthIn - SHUT_STILE} y2={heightIn - SHUT_RAIL_TB - 0.2} />
      </g>

      {withHinges && [
        strapHinge(SHUT_RAIL_TB + 1.5, hingeSide),
        strapHinge(sg.rails.mid.y + sg.rails.mid.h / 2, hingeSide),
        strapHinge(heightIn - SHUT_RAIL_TB - 1.5, hingeSide),
      ]}
      {withDog && shutterDog(dogSide)}
    </g>
  );
}

// =====================================================================
// PENCIL DOOR — 6-panel
// =====================================================================
export function PencilDoor({
  x = 0,
  y = 0,
  widthIn = 36,
  heightIn = 80,
}: {
  x?: number;
  y?: number;
  widthIn?: number;
  heightIn?: number;
}) {
  const id = React.useId().replace(/:/g, "");
  const sketchRect = makeSketchRect(`${id}-rough`);
  const stile = 5;
  const topRail = 5;
  const lockRail = 8;
  const bottomRail = 8;
  const muntinV = 4;
  const upperH = (heightIn - topRail - lockRail - bottomRail) / 2;
  const panelW = (widthIn - stile * 2 - muntinV) / 2;
  const panelXs = [stile, stile + panelW + muntinV];
  const rowYs = [topRail, topRail + upperH, topRail + upperH + lockRail];
  const rowHs = [
    upperH * 0.55,
    upperH * 0.45,
    heightIn - bottomRail - (topRail + upperH + lockRail),
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="17" />
          <feDisplacementMap in="SourceGraphic" scale="0.5" />
        </filter>
        <filter id={`${id}-rough2`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="23" />
          <feDisplacementMap in="SourceGraphic" scale="0.25" />
        </filter>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.7" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.40  0 0 0 0 0.30  0 0 0 0 0.20  0 0 0 0.18 0" />
        </filter>
      </defs>
      <rect x={0} y={0} width={widthIn} height={heightIn} fill="#e7dcc1" fillOpacity="0.5" filter={`url(#${id}-rough2)`} />
      <rect x={0} y={0} width={widthIn} height={heightIn} fill="#a98a5d" fillOpacity="0.18" filter={`url(#${id}-grain)`} />
      {sketchRect({ x: 0, y: 0, w: widthIn, h: heightIn }, "door", 0.1, 2)}
      {[0, 1, 2].map((row) =>
        panelXs.map((px, col) =>
          sketchRect({ x: px, y: rowYs[row], w: panelW, h: rowHs[row] }, `pan-${row}-${col}`, 0.06, 1)
        )
      )}
      <g filter={`url(#${id}-rough2)`}>
        <circle cx={widthIn - 4} cy={heightIn / 2 + 2} r={0.8} fill="#1a1612" opacity="0.85" />
        <rect x={widthIn - 5} y={heightIn / 2 + 1} width={2} height={2} fill="#1a1612" opacity="0.6" />
      </g>
    </g>
  );
}

// =====================================================================
// SIDE-GABLE ROOF — front-elevation view
// =====================================================================
export function PencilSideGableRoof({
  x = 0,
  y = 0,
  widthIn,
  pitch = 9 / 12,
  buildingDepthFt = 28,
  rakeOverhang = 12,
  fasciaH = 7,
}: {
  x?: number;
  y?: number;
  widthIn: number;
  pitch?: number;
  buildingDepthFt?: number;
  rakeOverhang?: number;
  fasciaH?: number;
}) {
  const id = React.useId().replace(/:/g, "");
  const W = widthIn;
  const halfD = (buildingDepthFt * 12) / 2;
  const rise = halfD * pitch;
  const eaveBottom = FASCIA_DROP;
  const eaveTop = eaveBottom - fasciaH;
  const roofTop = eaveTop - rise;
  const xL = -rakeOverhang;
  const xR = W + rakeOverhang;
  const bodyPath = `M ${xL} ${eaveTop} L ${xR} ${eaveTop} L ${xR} ${roofTop} L ${xL} ${roofTop} Z`;

  const courses: number[] = [];
  for (let h = 0; h * SHINGLE_EXPOSURE < rise + 2; h++) courses.push(h);

  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={`${id}-body`}>
          <path d={bodyPath} />
        </clipPath>
        <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" seed="51" />
          <feDisplacementMap in="SourceGraphic" scale="0.6" />
        </filter>
        <filter id={`${id}-rough2`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.0" numOctaves="2" seed="53" />
          <feDisplacementMap in="SourceGraphic" scale="0.35" />
        </filter>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="2.0" numOctaves="2" seed="57" />
          <feColorMatrix values="0 0 0 0 0.30  0 0 0 0 0.27  0 0 0 0 0.22  0 0 0 0.22 0" />
        </filter>
      </defs>

      <path d={bodyPath} fill="#bcb3a4" fillOpacity="0.55" filter={`url(#${id}-rough2)`} />
      <path d={bodyPath} fill="#3a342a" fillOpacity="0.08" filter={`url(#${id}-grain)`} />

      <g clipPath={`url(#${id}-body)`}>
        {courses.map((i) => {
          const yLine = eaveTop - i * SHINGLE_EXPOSURE;
          const xOff = (i % 2) * (SHINGLE_TAB / 2);
          const els: React.ReactElement[] = [];
          els.push(
            <line
              key={`l${i}`}
              x1={xL - 5}
              y1={yLine}
              x2={xR + 5}
              y2={yLine}
              stroke="#3a342a"
              strokeWidth="0.45"
              opacity={i === 0 ? 0.85 : 0.45}
              strokeLinecap="round"
              filter={`url(#${id}-rough2)`}
            />
          );
          for (let xt = xL + xOff; xt < xR + 5; xt += SHINGLE_TAB) {
            els.push(
              <line
                key={`t${i}-${xt}`}
                x1={xt}
                y1={yLine}
                x2={xt}
                y2={yLine + SHINGLE_EXPOSURE * 0.55}
                stroke="#2a241d"
                strokeWidth="0.35"
                opacity="0.55"
                strokeLinecap="round"
                filter={`url(#${id}-rough2)`}
              />
            );
          }
          els.push(
            <rect
              key={`sh${i}`}
              x={xL - 5}
              y={yLine}
              width={xR + 5 - (xL - 5)}
              height={1.2}
              fill="#2a241d"
              opacity="0.1"
              filter={`url(#${id}-rough2)`}
            />
          );
          return <g key={i}>{els}</g>;
        })}
      </g>

      <line x1={xL - 2} y1={roofTop} x2={xR + 2} y2={roofTop} stroke="#2a241d" strokeWidth="1.0" opacity="0.85" strokeLinecap="round" filter={`url(#${id}-rough)`} />
      <line x1={xL - 2} y1={roofTop + 1.4} x2={xR + 2} y2={roofTop + 1.4} stroke="#2a241d" strokeWidth="0.4" opacity="0.4" strokeLinecap="round" filter={`url(#${id}-rough)`} />

      <rect x={xL} y={eaveTop} width={xR - xL} height={fasciaH} fill="#efe5cf" fillOpacity="0.9" />
      <rect x={xL} y={eaveTop} width={xR - xL} height={fasciaH} fill="#3a342a" fillOpacity="0.08" filter={`url(#${id}-grain)`} />

      <g filter={`url(#${id}-rough)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {[0, 1].map((p) => {
          const j = (n: number) => Math.sin((p + 1) * (n + 11)) * 0.12;
          const ov = 0.6 * (p + 1);
          const o1 = j(1),
            o2 = j(2),
            o3 = j(3),
            o4 = j(4);
          return (
            <g key={p}>
              <path d={`M ${xL - ov + o1} ${eaveTop + o1} L ${xR + ov + o2} ${eaveTop + o2}`} stroke="#2a241d" strokeWidth={0.85 + p * 0.2} opacity={0.55 + p * 0.2} />
              <path d={`M ${xL - ov + o3} ${eaveBottom + o3} L ${xR + ov + o4} ${eaveBottom + o4}`} stroke="#2a241d" strokeWidth={0.95 + p * 0.2} opacity={0.6 + p * 0.2} />
              <path d={`M ${xL - ov + o1} ${eaveTop + o1} L ${xL - ov + o3} ${eaveBottom + o3}`} stroke="#2a241d" strokeWidth={0.7 + p * 0.15} opacity={0.45 + p * 0.2} />
              <path d={`M ${xR + ov + o2} ${eaveTop + o2} L ${xR + ov + o4} ${eaveBottom + o4}`} stroke="#2a241d" strokeWidth={0.7 + p * 0.15} opacity={0.45 + p * 0.2} />
            </g>
          );
        })}
      </g>

      <g transform={`translate(${xR - 60}, ${roofTop + 18})`} stroke="#2a241d" fill="none" strokeWidth="0.5" opacity="0.7" filter={`url(#${id}-rough)`}>
        <path d="M 0 0 L 24 0 L 24 -18 Z" />
        <line x1={26} y1={-3} x2={32} y2={-3} stroke="#2a241d" strokeWidth="0.5" />
        <line x1={28} y1={-9} x2={32} y2={-9} stroke="#2a241d" strokeWidth="0.5" />
      </g>
    </g>
  );
}

// =====================================================================
// FRONT ELEVATION — composes wall, roof, windows, door
// =====================================================================
function WinWithShut({ x, y, h }: { x: number; y: number; h: number }) {
  const sWidth = 14; // shutter width — slightly less than half the window
  return (
    <g transform={`translate(${x},${y})`}>
      <PencilShutter
        x={-BRICK_MOLD - 1.0 - sWidth}
        y={0}
        widthIn={sWidth}
        heightIn={h}
        hingeSide="right"
        withHinges
        withDog
        dogSide="left"
      />
      <PencilWindow widthFt={3} heightFt={h / 12} />
      <PencilShutter
        x={36 + BRICK_MOLD + 1.0}
        y={0}
        widthIn={sWidth}
        heightIn={h}
        hingeSide="left"
        withHinges
        withDog
        dogSide="right"
      />
    </g>
  );
}

function PencilFrontElevation({
  x = 0,
  y = 0,
  widthFt = 39.4,
  wallHeightFt = 20,
  firstFloorHeightFt = 10,
  roof = null,
}: {
  x?: number;
  y?: number;
  widthFt?: number;
  wallHeightFt?: number;
  firstFloorHeightFt?: number;
  roof?: React.ReactNode;
}) {
  const id = React.useId().replace(/:/g, "");
  const W = widthFt * 12;
  const H = wallHeightFt * 12;
  const ff = firstFloorHeightFt * 12;

  const winW = 36;
  const cols = 5;
  const totalOpening = cols * winW;
  const sumGap = W - totalOpening;
  const gap = sumGap / (cols + 1);
  const colXs: number[] = [];
  for (let i = 0; i < cols; i++) colXs.push(gap + i * (winW + gap));
  const doorColIdx = 2;

  const ff1Sill = 3 * 12;
  const ff2Sill = ff + 2.5 * 12;
  const doorH = 80;
  const doorY = H - doorH;

  const sketchRect = makeSketchRect(`${id}-rough`);

  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <filter id={`${id}-rough`} x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" seed="41" />
          <feDisplacementMap in="SourceGraphic" scale="0.5" />
        </filter>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="2" seed="43" />
          <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.82  0 0 0 0 0.74  0 0 0 0.16 0" />
        </filter>
      </defs>

      <rect x={0} y={0} width={W} height={H} fill="#f7f3e8" />
      <rect x={0} y={0} width={W} height={H} filter={`url(#${id}-grain)`} opacity="0.55" />

      <line x1={0} y1={ff} x2={W} y2={ff} stroke="#3a342a" strokeWidth="0.35" opacity="0.18" filter={`url(#${id}-rough)`} />
      {sketchRect({ x: 0, y: 0, w: W, h: H }, "wall", 0.18, 2)}
      {roof}

      <line x1={-20} y1={H} x2={W + 20} y2={H} stroke="#2a241d" strokeWidth="0.5" opacity="0.85" filter={`url(#${id}-rough)`} />
      <line x1={-20} y1={H + 0.6} x2={W + 20} y2={H + 0.6} stroke="#2a241d" strokeWidth="0.25" opacity="0.5" filter={`url(#${id}-rough)`} />

      <g stroke="#2a241d" strokeWidth="0.18" opacity="0.5" filter={`url(#${id}-rough)`}>
        {Array.from({ length: 80 }).map((_, i) => {
          const xi = -20 + i * ((W + 40) / 80);
          return <line key={i} x1={xi} y1={H + 0.8} x2={xi - 1.2} y2={H + 2.6} />;
        })}
      </g>

      {colXs.map((cx, i) =>
        i === doorColIdx ? null : (
          <WinWithShut key={`f1-${i}`} x={cx} y={H - ff1Sill - 6 * 12} h={6 * 12} />
        )
      )}
      {colXs.map((cx, i) => (
        <WinWithShut key={`f2-${i}`} x={cx} y={H - ff2Sill - 5 * 12} h={5 * 12} />
      ))}

      <PencilDoor x={colXs[doorColIdx]} y={doorY} widthIn={winW} heightIn={doorH} />
    </g>
  );
}

function frontElevationSideGableBounds(
  widthFt: number,
  wallHeightFt: number,
  pitch: number,
  buildingDepthFt: number,
  rakeOverhang: number
) {
  const W = widthFt * 12;
  const H = wallHeightFt * 12;
  const rise = ((buildingDepthFt * 12) / 2) * pitch;
  const sideMargin = Math.max(22, rakeOverhang + 10);
  const topMargin = 14;
  const bottomMargin = 14;
  return {
    x: -sideMargin,
    y: -(rise + 8) - topMargin,
    w: W + 2 * sideMargin,
    h: H + (rise + 8) + topMargin + bottomMargin,
  };
}

export function StandaloneFrontElevationSideGable({
  widthFt = 39.4,
  wallHeightFt = 20,
  pitch = 9 / 12,
  buildingDepthFt = 28,
}: {
  widthFt?: number;
  wallHeightFt?: number;
  pitch?: number;
  buildingDepthFt?: number;
}) {
  const b = frontElevationSideGableBounds(widthFt, wallHeightFt, pitch, buildingDepthFt, 12);
  return (
    <svg
      viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <PencilFrontElevation
        widthFt={widthFt}
        wallHeightFt={wallHeightFt}
        roof={
          <PencilSideGableRoof
            widthIn={widthFt * 12}
            pitch={pitch}
            buildingDepthFt={buildingDepthFt}
          />
        }
      />
    </svg>
  );
}

// Standalone wrapper for a single window+shutter assembly
function windowWithShuttersBounds(widthFt: number, heightFt: number, shutterWidthIn: number, hingeGapIn = 1.0) {
  const winW = widthFt * 12;
  const winH = heightFt * 12;
  return {
    x: -BRICK_MOLD - hingeGapIn - shutterWidthIn - 0.5,
    y: -BRICK_MOLD - 0.5,
    w: winW + 2 * BRICK_MOLD + 2 * hingeGapIn + 2 * shutterWidthIn + 1,
    h: winH + 2 * BRICK_MOLD + 6,
  };
}

export function StandaloneAssembly({
  widthFt = 3,
  heightFt = 6,
  shutterWidthIn = SHUT_W_DEFAULT,
}: {
  widthFt?: number;
  heightFt?: number;
  shutterWidthIn?: number;
}) {
  const b = windowWithShuttersBounds(widthFt, heightFt, shutterWidthIn);
  const winW = widthFt * 12;
  const winH = heightFt * 12;
  return (
    <svg
      viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <PencilShutter
        x={-BRICK_MOLD - 1.0 - shutterWidthIn}
        y={0}
        widthIn={shutterWidthIn}
        heightIn={winH}
        hingeSide="right"
        withHinges
        withDog
        dogSide="left"
      />
      <PencilWindow widthFt={widthFt} heightFt={heightFt} />
      <PencilShutter
        x={winW + BRICK_MOLD + 1.0}
        y={0}
        widthIn={shutterWidthIn}
        heightIn={winH}
        hingeSide="left"
        withHinges
        withDog
        dogSide="right"
      />
    </svg>
  );
}
