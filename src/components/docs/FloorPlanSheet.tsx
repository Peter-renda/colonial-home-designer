import { QuizAnswers } from "../../types/quiz";
import { HouseParams, frontBayXs } from "../../lib/houseParams";
import SheetFrame from "./SheetFrame";

interface Props {
  floor: "first" | "second";
  params: HouseParams;
  answers: QuizAnswers;
  style: string;
}

interface Room {
  name: string;
  /** ft from left wall */
  x: number;
  /** ft from rear wall (front of house is at y = depth) */
  y: number;
  w: number;
  h: number;
  /** ft to nudge the label horizontally (e.g., clear of the stair) */
  labelDx?: number;
  /** suppress the size line when the room is too tight for it */
  noDims?: boolean;
}

const S = 10; // px per ft
const M = 70; // sheet margin for dimension strings

function ftIn(v: number): string {
  const ft = Math.floor(v);
  const inches = Math.round((v - ft) * 12);
  return inches === 0 ? `${ft}'-0"` : `${ft}'-${inches}"`;
}

function firstFloorRooms(p: HouseParams): Room[] {
  return [
    { name: "DINING", x: 0, y: 24, w: 13.5, h: 16 },
    { name: "FOYER", x: 13.5, y: 24, w: 9, h: 16, labelDx: 2.3, noDims: true },
    { name: "STUDY", x: 22.5, y: 24, w: 13.5, h: 16 },
    { name: "BREAKFAST", x: 0, y: 0, w: 15, h: 10 },
    { name: "KITCHEN", x: 0, y: 10, w: 15, h: 14 },
    { name: "FAMILY", x: 15, y: 8, w: 21, h: 16 },
    { name: "PANTRY", x: 15, y: 0, w: 8, h: 8 },
    { name: "POWDER", x: 23, y: 0, w: 6, h: 8 },
    { name: "MUD", x: 29, y: 0, w: 7, h: 8 },
  ];
}

function secondFloorRooms(p: HouseParams): Room[] {
  return [
    { name: "PRIMARY BDRM", x: 21, y: 24, w: 15, h: 16 },
    { name: "PRIM. BATH", x: 21, y: 16, w: 7.5, h: 8 },
    { name: "W.I.C.", x: 28.5, y: 16, w: 7.5, h: 8 },
    { name: "BDRM 4", x: 21, y: 0, w: 15, h: 16 },
    { name: "BDRM 2", x: 0, y: 0, w: 14, h: 14 },
    { name: "BATH 2", x: 0, y: 14, w: 7, h: 8 },
    { name: "LAUNDRY", x: 7, y: 14, w: 7, h: 8 },
    { name: "LINEN", x: 0, y: 22, w: 14, h: 4 },
    { name: "BDRM 3", x: 0, y: 26, w: 14, h: 14 },
    { name: "BATH 1", x: 14, y: 0, w: 7, h: 8 },
    { name: "HALL", x: 14, y: 8, w: 7, h: 32 },
  ];
}

export default function FloorPlanSheet({ floor, params: p, answers, style }: Props) {
  const W = p.widthFt * S;
  const H = p.depthFt * S;
  const rooms = floor === "first" ? firstFloorRooms(p) : secondFloorRooms(p);
  const bays = frontBayXs(p).map((x) => M + (x + p.widthFt / 2) * S);
  const sideYs = [p.depthFt / 4, (3 * p.depthFt) / 4].map((y) => M + y * S);
  const hasAttachedGarage = floor === "first" && p.garage !== "none" && p.garage !== "detached2";
  const gW = (p.garage === "front2" ? p.garageWFt : p.garageDFt) * S;
  const gH = (p.garage === "front2" ? p.garageDFt : p.garageWFt) * S;
  const gX = M + W;
  const gY = p.garage === "front2" ? M + H - gH : M + (H - gH) / 2;
  const extraRight = hasAttachedGarage ? gW + 30 : p.sunroom === "right" && floor === "first" ? 110 : 30;
  const extraLeft = p.sunroom === "left" && floor === "first" ? 110 : 0;
  const vbW = M + W + M / 2 + extraRight + extraLeft;
  const vbH = M + H + M;
  const winLen = p.windowW * S;

  return (
    <SheetFrame
      sheetNo={floor === "first" ? "A-101" : "A-102"}
      title={floor === "first" ? "First Floor Plan" : "Second Floor Plan"}
      style={style}
      scale={'Scale: 3/16" = 1\'-0"'}
    >
      <svg
        viewBox={`${-extraLeft} 0 ${vbW} ${vbH}`}
        className="w-full h-auto"
        style={{ maxHeight: "78vh" }}
      >
        {/* rooms */}
        {rooms.map((r) => (
          <g key={r.name}>
            <rect
              x={M + r.x * S}
              y={M + r.y * S}
              width={r.w * S}
              height={r.h * S}
              fill="#ffffff"
              stroke="#57534e"
              strokeWidth="1.2"
            />
            <text
              x={M + (r.x + r.w / 2 + (r.labelDx ?? 0)) * S}
              y={M + (r.y + r.h / 2) * S - 2}
              textAnchor="middle"
              fontSize="9"
              letterSpacing="1"
              fill="#44403c"
            >
              {r.name}
            </text>
            {!r.noDims && (
              <text
                x={M + (r.x + r.w / 2 + (r.labelDx ?? 0)) * S}
                y={M + (r.y + r.h / 2) * S + 10}
                textAnchor="middle"
                fontSize="7.5"
                fill="#a8a29e"
              >
                {ftIn(r.w)} × {ftIn(r.h)}
              </text>
            )}
          </g>
        ))}

        {/* exterior wall — heavy line */}
        <rect x={M} y={M} width={W} height={H} fill="none" stroke="#1c1917" strokeWidth="5" />

        {/* stair */}
        <Stair p={p} floor={floor} />

        {/* windows: front wall (bottom edge); door bay skipped on 1st floor */}
        {bays.map((bx, i) => {
          if (floor === "first" && i === Math.floor(bays.length / 2)) return null;
          return <WinGap key={`f${i}`} cx={bx} cy={M + H} len={winLen} vertical={false} />;
        })}
        {/* rear wall */}
        {bays.map((bx, i) =>
          floor === "first" && i === Math.floor(bays.length / 2) ? null : (
            <WinGap key={`r${i}`} cx={bx} cy={M} len={winLen} vertical={false} />
          )
        )}
        {/* side walls */}
        {sideYs.map((sy, i) => (
          <g key={`s${i}`}>
            <WinGap cx={M} cy={sy} len={winLen} vertical />
            <WinGap cx={M + W} cy={sy} len={winLen} vertical />
          </g>
        ))}

        {/* front door + swing */}
        {floor === "first" && (
          <g>
            <rect x={M + W / 2 - 18} y={M + H - 3} width={36} height={6} fill="#ffffff" />
            <line
              x1={M + W / 2 - 16}
              y1={M + H}
              x2={M + W / 2 - 16}
              y2={M + H - 32}
              stroke="#44403c"
              strokeWidth="1.4"
            />
            <path
              d={`M ${M + W / 2 - 16} ${M + H - 32} A 32 32 0 0 1 ${M + W / 2 + 16} ${M + H}`}
              fill="none"
              stroke="#a8a29e"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
          </g>
        )}
        {/* rear door / patio door */}
        {floor === "first" && (
          <g>
            <rect
              x={M + W / 2 - (p.patioDoor ? 30 : 16)}
              y={M - 3}
              width={p.patioDoor ? 60 : 32}
              height={6}
              fill="#ffffff"
            />
            <line
              x1={M + W / 2 - (p.patioDoor ? 30 : 16)}
              y1={M}
              x2={M + W / 2 + (p.patioDoor ? 30 : 16)}
              y2={M}
              stroke="#44403c"
              strokeWidth="1.2"
            />
            <text x={M + W / 2} y={M - 8} textAnchor="middle" fontSize="7" fill="#a8a29e">
              {p.patioDoor ? "PATIO DOOR" : "REAR DOOR"}
            </text>
          </g>
        )}

        {/* porches, dashed */}
        {floor === "first" && (p.frontPorch || p.portico !== "none") && !p.fullWidthPorch && (
          <DashedRect x={M + W / 2 - 40} y={M + H} w={80} h={60} label="PORCH" />
        )}
        {floor === "first" && p.fullWidthPorch && (
          <DashedRect x={M - 10} y={M + H} w={W + 20} h={100} label="COVERED PORCH" />
        )}
        {floor === "first" && p.rearPorch && (
          <DashedRect x={M + W / 2 - 100} y={M - 100} w={200} h={100} label="REAR PORCH" />
        )}

        {/* sunroom */}
        {floor === "first" && p.sunroom !== "none" && (
          <g>
            <rect
              x={p.sunroom === "left" ? M - 100 : M + W}
              y={M + H / 2 - 70}
              width={100}
              height={140}
              fill="#ffffff"
              stroke="#1c1917"
              strokeWidth="2.5"
            />
            <text
              x={p.sunroom === "left" ? M - 50 : M + W + 50}
              y={M + H / 2}
              textAnchor="middle"
              fontSize="8"
              letterSpacing="1"
              fill="#44403c"
            >
              SUNROOM
            </text>
          </g>
        )}

        {/* garage */}
        {hasAttachedGarage && (
          <g>
            <rect x={gX} y={gY} width={gW} height={gH} fill="#ffffff" stroke="#1c1917" strokeWidth="4" />
            <text
              x={gX + gW / 2}
              y={gY + gH / 2 - 2}
              textAnchor="middle"
              fontSize="9"
              letterSpacing="1"
              fill="#44403c"
            >
              {p.garage === "side3" ? "3-CAR GARAGE" : "2-CAR GARAGE"}
            </text>
            <text x={gX + gW / 2} y={gY + gH / 2 + 10} textAnchor="middle" fontSize="7.5" fill="#a8a29e">
              {p.garage === "front2"
                ? `${ftIn(p.garageWFt)} × ${ftIn(p.garageDFt)}`
                : `${ftIn(p.garageDFt)} × ${ftIn(p.garageWFt)}`}
            </text>
            {/* bay door openings */}
            {p.garage === "front2" ? (
              <rect x={gX + gW / 2 - 50} y={gY + gH - 3} width={100} height={6} fill="#ffffff" />
            ) : (
              <rect x={gX + gW - 3} y={gY + gH / 2 - 50} width={6} height={100} fill="#ffffff" />
            )}
          </g>
        )}
        {floor === "second" && p.garage !== "none" && p.garage !== "detached2" && (
          <DashedRect
            x={gX}
            y={p.garage === "front2" ? M + H - p.garageDFt * S : M + (H - p.garageWFt * S) / 2}
            w={(p.garage === "front2" ? p.garageWFt : p.garageDFt) * S}
            h={(p.garage === "front2" ? p.garageDFt : p.garageWFt) * S}
            label="GARAGE ROOF BELOW"
          />
        )}

        {/* dimension strings */}
        <DimH x1={M} x2={M + W} y={M - 28} label={ftIn(p.widthFt)} />
        <DimV y1={M} y2={M + H} x={M - 28} label={ftIn(p.depthFt)} />

        {/* north arrow (rear of house faces up) */}
        <g transform={`translate(${M + W + (hasAttachedGarage ? gW : 0) + 24}, ${M + 16})`}>
          <circle r="11" fill="none" stroke="#57534e" strokeWidth="1" />
          <path d="M 0 7 L 0 -7 M 0 -7 L -3.5 -1 M 0 -7 L 3.5 -1" stroke="#57534e" strokeWidth="1.2" fill="none" />
          <text y="24" textAnchor="middle" fontSize="8" fill="#a8a29e">
            N
          </text>
        </g>

        {/* front label */}
        <text x={M + W / 2} y={M + H + 52} textAnchor="middle" fontSize="8" letterSpacing="2" fill="#a8a29e">
          FRONT
        </text>
      </svg>
    </SheetFrame>
  );
}

// ─── drawing helpers ────────────────────────────────────────────

function WinGap({ cx, cy, len, vertical }: { cx: number; cy: number; len: number; vertical: boolean }) {
  if (vertical) {
    return (
      <g>
        <rect x={cx - 3} y={cy - len / 2} width={6} height={len} fill="#ffffff" />
        <line x1={cx} y1={cy - len / 2} x2={cx} y2={cy + len / 2} stroke="#78716c" strokeWidth="1" />
        <line x1={cx - 3} y1={cy - len / 2} x2={cx + 3} y2={cy - len / 2} stroke="#1c1917" strokeWidth="1" />
        <line x1={cx - 3} y1={cy + len / 2} x2={cx + 3} y2={cy + len / 2} stroke="#1c1917" strokeWidth="1" />
      </g>
    );
  }
  return (
    <g>
      <rect x={cx - len / 2} y={cy - 3} width={len} height={6} fill="#ffffff" />
      <line x1={cx - len / 2} y1={cy} x2={cx + len / 2} y2={cy} stroke="#78716c" strokeWidth="1" />
      <line x1={cx - len / 2} y1={cy - 3} x2={cx - len / 2} y2={cy + 3} stroke="#1c1917" strokeWidth="1" />
      <line x1={cx + len / 2} y1={cy - 3} x2={cx + len / 2} y2={cy + 3} stroke="#1c1917" strokeWidth="1" />
    </g>
  );
}

function DashedRect({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#78716c" strokeWidth="1.2" strokeDasharray="6 4" />
      <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize="7.5" letterSpacing="1" fill="#a8a29e">
        {label}
      </text>
    </g>
  );
}

function DimH({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g stroke="#57534e" strokeWidth="0.8">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 18} />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 18} />
      <line x1={x1 - 4} y1={y + 4} x2={x1 + 4} y2={y - 4} />
      <line x1={x2 - 4} y1={y + 4} x2={x2 + 4} y2={y - 4} />
      <text
        x={(x1 + x2) / 2}
        y={y - 6}
        textAnchor="middle"
        fontSize="10"
        fill="#1c1917"
        stroke="none"
      >
        {label}
      </text>
    </g>
  );
}

function DimV({ y1, y2, x, label }: { y1: number; y2: number; x: number; label: string }) {
  return (
    <g stroke="#57534e" strokeWidth="0.8">
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <line x1={x - 5} y1={y1} x2={x + 18} y2={y1} />
      <line x1={x - 5} y1={y2} x2={x + 18} y2={y2} />
      <line x1={x - 4} y1={y1 + 4} x2={x + 4} y2={y1 - 4} />
      <line x1={x - 4} y1={y2 + 4} x2={x + 4} y2={y2 - 4} />
      <text
        x={x - 8}
        y={(y1 + y2) / 2}
        textAnchor="middle"
        fontSize="10"
        fill="#1c1917"
        stroke="none"
        transform={`rotate(-90 ${x - 8} ${(y1 + y2) / 2})`}
      >
        {label}
      </text>
    </g>
  );
}

function Stair({ p, floor }: { p: HouseParams; floor: "first" | "second" }) {
  // stair stacks in the foyer/hall on both floors: x 14.3..18.1 ft, y 26..38 ft
  const x = M + 14.3 * S;
  const y = M + 26 * S;
  const w = 3.8 * S;
  const h = 12 * S;
  const treads = 12;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#ffffff" stroke="#57534e" strokeWidth="1" />
      {Array.from({ length: treads - 1 }, (_, i) => (
        <line
          key={i}
          x1={x}
          y1={y + ((i + 1) * h) / treads}
          x2={x + w}
          y2={y + ((i + 1) * h) / treads}
          stroke="#78716c"
          strokeWidth="0.7"
        />
      ))}
      <line x1={x + w / 2} y1={y + h - 6} x2={x + w / 2} y2={y + 8} stroke="#44403c" strokeWidth="1" />
      <path
        d={`M ${x + w / 2} ${y + 8} l -3.5 6 M ${x + w / 2} ${y + 8} l 3.5 6`}
        stroke="#44403c"
        strokeWidth="1"
        fill="none"
      />
      <text x={x + w / 2} y={y + h + 10} textAnchor="middle" fontSize="7" fill="#a8a29e">
        {floor === "first" ? "UP" : "DN"}
      </text>
    </g>
  );
}
