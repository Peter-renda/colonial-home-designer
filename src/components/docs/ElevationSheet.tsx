import { HouseParams, wallHeightFt, roofRiseFt, frontBayXs } from "../../lib/houseParams";
import SheetFrame from "./SheetFrame";

interface Props {
  params: HouseParams;
  style: string;
}

const S = 6; // px per ft

function ftIn(v: number): string {
  const ft = Math.floor(v);
  const inches = Math.round((v - ft) * 12);
  return inches === 0 ? `${ft}'-0"` : `${ft}'-${inches}"`;
}

export default function ElevationSheet({ params: p, style }: Props) {
  return (
    <SheetFrame sheetNo="A-201" title="Exterior Elevations" style={style} scale={'Scale: 1/8" = 1\'-0"'}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <FrontElevation p={p} />
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 text-center mt-1">
            1 — Front Elevation
          </p>
        </div>
        <div>
          <SideElevation p={p} />
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 text-center mt-1">
            2 — Right Side Elevation
          </p>
        </div>
      </div>
    </SheetFrame>
  );
}

function FrontElevation({ p }: { p: HouseParams }) {
  const wallH = wallHeightFt(p);
  const rise = roofRiseFt(p);
  const fnd = p.foundationExposedFt;
  const eave = fnd + wallH;
  const ridge = eave + rise;
  const totalH = ridge + 4;
  const margin = 50;
  const hasGarage = p.garage !== "none" && p.garage !== "detached2";
  const gFace = p.garage === "front2" ? p.garageWFt : p.garageDFt;
  const gH = p.firstFloorFt + 2;
  const totalW = p.widthFt + (hasGarage ? gFace : 0);
  const vbW = margin + totalW * S + margin;
  const vbH = totalH * S + 30;
  const y = (ft: number) => (totalH - ft) * S + 10;
  const x = (ft: number) => margin + (ft + p.widthFt / 2) * S; // ft from house centerline
  const bays = frontBayXs(p);
  const winH1 = p.windowH;
  const winH2 = Math.min(p.windowH, 5);
  const sill1 = fnd + 2.8;
  const sill2 = fnd + p.firstFloorFt + 3.2;
  const doorTop = fnd + 6.9;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-auto bg-white">
      {/* roof */}
      {p.roofShape === "hip" ? (
        <polygon
          points={`${x(-p.widthFt / 2 - 1)},${y(eave)} ${x(p.widthFt / 2 + 1)},${y(eave)} ${x(
            Math.max(p.widthFt / 2 - p.depthFt / 2, p.widthFt * 0.08)
          )},${y(ridge)} ${x(-Math.max(p.widthFt / 2 - p.depthFt / 2, p.widthFt * 0.08))},${y(ridge)}`}
          fill="#e7e2d8"
          stroke="#1c1917"
          strokeWidth="1.5"
        />
      ) : (
        <g>
          <rect
            x={x(-p.widthFt / 2 - 0.8)}
            y={y(ridge)}
            width={(p.widthFt + 1.6) * S}
            height={rise * S}
            fill="#e7e2d8"
            stroke="#1c1917"
            strokeWidth="1.5"
          />
          {/* shingle course lines */}
          {Array.from({ length: 5 }, (_, i) => (
            <line
              key={i}
              x1={x(-p.widthFt / 2 - 0.8)}
              y1={y(ridge) + ((i + 1) * rise * S) / 6}
              x2={x(p.widthFt / 2 + 0.8)}
              y2={y(ridge) + ((i + 1) * rise * S) / 6}
              stroke="#a8a29e"
              strokeWidth="0.5"
            />
          ))}
        </g>
      )}
      {p.roofShape === "gableFrontGable" && (
        <polygon
          points={`${x(-8)},${y(eave)} ${x(8)},${y(eave)} ${x(0)},${y(eave + 6.5)}`}
          fill="#f4f1e8"
          stroke="#1c1917"
          strokeWidth="1.2"
        />
      )}
      {/* dormers */}
      {p.dormers !== "none" &&
        [-p.widthFt / 4, 0, p.widthFt / 4].map((dx) => (
          <g key={dx}>
            <rect x={x(dx - 2.1)} y={y(eave + 9)} width={4.2 * S} height={4.6 * S} fill="#ffffff" stroke="#1c1917" strokeWidth="1" />
            <rect x={x(dx - 1.1)} y={y(eave + 8.2)} width={2.2 * S} height={2.8 * S} fill="#dbe4e8" stroke="#57534e" strokeWidth="0.7" />
            {p.dormers === "gable" && (
              <polygon
                points={`${x(dx - 2.4)},${y(eave + 9)} ${x(dx + 2.4)},${y(eave + 9)} ${x(dx)},${y(eave + 10.8)}`}
                fill="#e7e2d8"
                stroke="#1c1917"
                strokeWidth="1"
              />
            )}
            {p.dormers !== "gable" && (
              <rect x={x(dx - 2.4)} y={y(eave + 10)} width={4.8 * S} height={1 * S} fill="#e7e2d8" stroke="#1c1917" strokeWidth="1" />
            )}
          </g>
        ))}
      {/* chimney */}
      {p.chimney && (
        <rect x={x(p.widthFt / 2 - 7)} y={y(ridge + 3)} width={2.2 * S} height={(ridge + 3 - eave + 2) * S} fill="#c8a294" stroke="#1c1917" strokeWidth="1" />
      )}

      {/* wall */}
      <rect x={x(-p.widthFt / 2)} y={y(eave)} width={p.widthFt * S} height={wallH * S} fill="#faf8f2" stroke="#1c1917" strokeWidth="1.5" />
      {/* floor line */}
      <line x1={x(-p.widthFt / 2)} y1={y(fnd + p.firstFloorFt + 1)} x2={x(p.widthFt / 2)} y2={y(fnd + p.firstFloorFt + 1)} stroke="#d6d3d1" strokeWidth="0.8" />
      {/* foundation */}
      <rect x={x(-p.widthFt / 2 - 0.3)} y={y(fnd)} width={(p.widthFt + 0.6) * S} height={fnd * S} fill="#e7e5e4" stroke="#1c1917" strokeWidth="1" />

      {/* windows */}
      {bays.map((bx, i) => (
        <g key={`u${i}`}>
          <ElWindow cx={x(bx)} top={y(sill2 + winH2)} w={p.windowW * S} h={winH2 * S} shutters={p.shutters} sc={p.shutterColor} />
        </g>
      ))}
      {bays.map((bx, i) =>
        i === Math.floor(bays.length / 2) ? null : (
          <g key={`l${i}`}>
            <ElWindow cx={x(bx)} top={y(sill1 + winH1)} w={p.windowW * S} h={winH1 * S} shutters={p.shutters} sc={p.shutterColor} />
          </g>
        )
      )}

      {/* entry */}
      <g>
        {p.sidelights && (
          <rect x={x(-2.9)} y={y(doorTop - 0.2)} width={5.8 * S} height={(doorTop - 0.2 - fnd) * S} fill="#dbe4e8" stroke="#57534e" strokeWidth="0.7" />
        )}
        <rect x={x(-1.6)} y={y(doorTop)} width={3.2 * S} height={6.9 * S} fill="#a89684" stroke="#1c1917" strokeWidth="1" />
        {p.transom === "rectangular" && (
          <rect x={x(p.sidelights ? -2.9 : -1.6)} y={y(doorTop + 1.2)} width={(p.sidelights ? 5.8 : 3.2) * S} height={1.2 * S} fill="#dbe4e8" stroke="#57534e" strokeWidth="0.7" />
        )}
        {p.transom === "fanlight" && (
          <path
            d={`M ${x(-2.1)} ${y(doorTop)} A ${2.1 * S} ${2.1 * S} 0 0 1 ${x(2.1)} ${y(doorTop)} Z`}
            fill="#dbe4e8"
            stroke="#57534e"
            strokeWidth="0.7"
          />
        )}
        {p.portico !== "none" && (
          <g>
            <line x1={x(-3.7)} y1={y(fnd)} x2={x(-3.7)} y2={y(doorTop + 1.8)} stroke="#1c1917" strokeWidth="2" />
            <line x1={x(3.7)} y1={y(fnd)} x2={x(3.7)} y2={y(doorTop + 1.8)} stroke="#1c1917" strokeWidth="2" />
            <rect x={x(-4.6)} y={y(doorTop + 2.6)} width={9.2 * S} height={0.8 * S} fill="#f4f1e8" stroke="#1c1917" strokeWidth="1" />
            {p.portico === "gable" && (
              <polygon points={`${x(-4.8)},${y(doorTop + 2.6)} ${x(4.8)},${y(doorTop + 2.6)} ${x(0)},${y(doorTop + 4.6)}`} fill="#e7e2d8" stroke="#1c1917" strokeWidth="1" />
            )}
            {p.portico === "rounded" && (
              <path d={`M ${x(-4.8)} ${y(doorTop + 2.6)} A ${4.8 * S} ${4.8 * S} 0 0 1 ${x(4.8)} ${y(doorTop + 2.6)}`} fill="#e7e2d8" stroke="#1c1917" strokeWidth="1" />
            )}
            {(p.portico === "hip" || p.portico === "flat") && (
              <rect x={x(-4.9)} y={y(doorTop + 3.4)} width={9.8 * S} height={0.8 * S} fill="#e7e2d8" stroke="#1c1917" strokeWidth="1" />
            )}
          </g>
        )}
      </g>

      {/* attached garage */}
      {hasGarage && (
        <g>
          <rect x={x(p.widthFt / 2)} y={y(fnd + gH)} width={gFace * S} height={gH * S} fill="#faf8f2" stroke="#1c1917" strokeWidth="1.5" />
          {p.garage === "front2" ? (
            <g>
              <polygon
                points={`${x(p.widthFt / 2 - 0.5)},${y(fnd + gH)} ${x(p.widthFt / 2 + gFace + 0.5)},${y(fnd + gH)} ${x(p.widthFt / 2 + gFace / 2)},${y(fnd + gH + (gFace / 2) * (8 / 12))}`}
                fill="#f4f1e8"
                stroke="#1c1917"
                strokeWidth="1.2"
              />
              {[0, 1].map((i) => (
                <rect
                  key={i}
                  x={x(p.widthFt / 2 + 2 + i * (gFace / 2))}
                  y={y(fnd + 7.5)}
                  width={(gFace / 2 - 4) * S}
                  height={7.5 * S}
                  fill="#efe9dd"
                  stroke="#1c1917"
                  strokeWidth="0.8"
                />
              ))}
            </g>
          ) : (
            <rect
              x={x(p.widthFt / 2 - 0.5)}
              y={y(fnd + gH + 3)}
              width={(gFace + 1) * S}
              height={3 * S}
              fill="#e7e2d8"
              stroke="#1c1917"
              strokeWidth="1.2"
            />
          )}
        </g>
      )}

      {/* grade line */}
      <line x1={10} y1={y(0)} x2={vbW - 10} y2={y(0)} stroke="#1c1917" strokeWidth="2" />

      {/* height dims */}
      <g stroke="#57534e" strokeWidth="0.7">
        <line x1={x(-p.widthFt / 2) - 18} y1={y(0)} x2={x(-p.widthFt / 2) - 18} y2={y(ridge)} />
        <line x1={x(-p.widthFt / 2) - 23} y1={y(eave)} x2={x(-p.widthFt / 2) - 13} y2={y(eave)} />
        <line x1={x(-p.widthFt / 2) - 23} y1={y(ridge)} x2={x(-p.widthFt / 2) - 13} y2={y(ridge)} />
        <line x1={x(-p.widthFt / 2) - 23} y1={y(0)} x2={x(-p.widthFt / 2) - 13} y2={y(0)} />
        <text x={x(-p.widthFt / 2) - 26} y={(y(0) + y(eave)) / 2} textAnchor="middle" fontSize="8" fill="#1c1917" stroke="none" transform={`rotate(-90 ${x(-p.widthFt / 2) - 26} ${(y(0) + y(eave)) / 2})`}>
          {ftIn(eave)} plate
        </text>
        <text x={x(-p.widthFt / 2) - 26} y={(y(eave) + y(ridge)) / 2} textAnchor="middle" fontSize="8" fill="#1c1917" stroke="none" transform={`rotate(-90 ${x(-p.widthFt / 2) - 26} ${(y(eave) + y(ridge)) / 2})`}>
          {p.roofPitch}/12
        </text>
      </g>
    </svg>
  );
}

function SideElevation({ p }: { p: HouseParams }) {
  const wallH = wallHeightFt(p);
  const rise = roofRiseFt(p);
  const fnd = p.foundationExposedFt;
  const eave = fnd + wallH;
  const ridge = eave + rise;
  const totalH = ridge + 4;
  const margin = 40;
  const vbW = margin * 2 + p.depthFt * S;
  const vbH = totalH * S + 30;
  const y = (ft: number) => (totalH - ft) * S + 10;
  const x = (ft: number) => margin + ft * S; // ft from rear wall
  const winXs = [p.depthFt / 4, (3 * p.depthFt) / 4];
  const winH1 = p.windowH;
  const winH2 = Math.min(p.windowH, 5);
  const sill1 = fnd + 2.8;
  const sill2 = fnd + p.firstFloorFt + 3.2;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-auto bg-white">
      {/* roof profile */}
      <polygon
        points={`${x(-1)},${y(eave)} ${x(p.depthFt + 1)},${y(eave)} ${x(p.depthFt / 2)},${y(ridge)}`}
        fill={p.roofShape === "hip" ? "#e7e2d8" : "#faf8f2"}
        stroke="#1c1917"
        strokeWidth="1.5"
      />
      {p.roofShape === "hip" &&
        Array.from({ length: 4 }, (_, i) => (
          <line
            key={i}
            x1={x(2 + i * 2)}
            y1={y(eave) - 2}
            x2={x(p.depthFt / 2)}
            y2={y(ridge) + 6}
            stroke="#a8a29e"
            strokeWidth="0.4"
          />
        ))}
      {/* attic window in gable end */}
      {p.roofShape !== "hip" && (
        <circle cx={x(p.depthFt / 2)} cy={y(eave + rise * 0.45)} r={1.1 * S} fill="#dbe4e8" stroke="#57534e" strokeWidth="0.7" />
      )}

      {/* wall */}
      <rect x={x(0)} y={y(eave)} width={p.depthFt * S} height={wallH * S} fill="#faf8f2" stroke="#1c1917" strokeWidth="1.5" />
      <line x1={x(0)} y1={y(fnd + p.firstFloorFt + 1)} x2={x(p.depthFt)} y2={y(fnd + p.firstFloorFt + 1)} stroke="#d6d3d1" strokeWidth="0.8" />
      <rect x={x(-0.3)} y={y(fnd)} width={(p.depthFt + 0.6) * S} height={fnd * S} fill="#e7e5e4" stroke="#1c1917" strokeWidth="1" />

      {/* windows */}
      {winXs.map((wx, i) => (
        <g key={i}>
          <ElWindow cx={x(wx)} top={y(sill2 + winH2)} w={p.windowW * S} h={winH2 * S} shutters={false} sc="" />
          <ElWindow cx={x(wx)} top={y(sill1 + winH1)} w={p.windowW * S} h={winH1 * S} shutters={false} sc="" />
        </g>
      ))}

      {/* chimney */}
      {p.chimney && (
        <rect x={x(p.depthFt / 2 - 1.1)} y={y(ridge + 3)} width={2.2 * S} height={3 * S} fill="#c8a294" stroke="#1c1917" strokeWidth="1" />
      )}

      {/* grade line */}
      <line x1={8} y1={y(0)} x2={vbW - 8} y2={y(0)} stroke="#1c1917" strokeWidth="2" />
    </svg>
  );
}

function ElWindow({
  cx,
  top,
  w,
  h,
  shutters,
  sc,
}: {
  cx: number;
  top: number;
  w: number;
  h: number;
  shutters: boolean;
  sc: string;
}) {
  return (
    <g>
      <rect x={cx - w / 2} y={top} width={w} height={h} fill="#dbe4e8" stroke="#1c1917" strokeWidth="0.9" />
      <line x1={cx} y1={top} x2={cx} y2={top + h} stroke="#57534e" strokeWidth="0.5" />
      <line x1={cx - w / 2} y1={top + h / 2} x2={cx + w / 2} y2={top + h / 2} stroke="#57534e" strokeWidth="0.5" />
      {shutters && (
        <>
          <rect x={cx - w / 2 - w * 0.45 - 1.5} y={top} width={w * 0.45} height={h} fill={sc || "#27332b"} stroke="#1c1917" strokeWidth="0.5" />
          <rect x={cx + w / 2 + 1.5} y={top} width={w * 0.45} height={h} fill={sc || "#27332b"} stroke="#1c1917" strokeWidth="0.5" />
        </>
      )}
    </g>
  );
}
