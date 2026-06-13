"use client";

import { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HouseParams } from "../../lib/houseParams";

/**
 * Small standalone 3D "detail" models that mirror the architect detail
 * sketches on the framing and insulation pages — an exterior wall section,
 * the floor system (I-joists / trusses), and a roof truss with attic
 * insulation. Each renders in its own compact viewer and rebuilds from the
 * same selections that drive the 2D details.
 *
 * Same conventions as the main scene: units in feet, y up.
 */

const LUMBER = "#d9b886";
const LUMBER_DARK = "#c5a06b";
const OSB = "#b78a55";
const ZIP = "#3f7d4f";
const DRYWALL = "#efe9dd";
const CLADDING = "#cdbfa6";
const FOAM = "#e0938f";
const BATT = "#e7b7b0";
const SUBFLOOR = "#cba36b";
const IJOIST_WEB = "#b88a55";

const STUD = 1.5 / 12;

// ─── viewer shell ───────────────────────────────────────────────
function DetailViewer({
  children,
  camera = [4, 3.4, 5],
  target = [0, 1.5, 0],
  minD = 2.5,
  maxD = 18,
}: {
  children: ReactNode;
  camera?: [number, number, number];
  target?: [number, number, number];
  minD?: number;
  maxD?: number;
}) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: camera, fov: 35 }}>
      <color attach="background" args={["#eef0ea"]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#dfe8f2", "#b8b09a", 0.5]} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#dfe2d8" />
      </mesh>
      {children}
      <OrbitControls
        target={target}
        enableDamping
        minDistance={minD}
        maxDistance={maxD}
        maxPolarAngle={Math.PI / 2 - 0.02}
      />
    </Canvas>
  );
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-[#eef0ea] border border-stone-200 overflow-hidden">
      <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-stone-400 border-b border-stone-200 bg-stone-50">
        {title}
      </div>
      <div className="w-full aspect-square">{children}</div>
    </div>
  );
}

// ─── exterior wall section ──────────────────────────────────────
function WallSection3D({
  studDepthFt,
  sheathing,
  insulated,
  exteriorFoam,
}: {
  studDepthFt: number;
  sheathing: "osb" | "zip" | null;
  insulated: boolean;
  exteriorFoam: boolean;
}) {
  const segW = 3;
  const segH = 4;
  const tDry = 0.05;
  const tStud = studDepthFt;
  const tSheath = 0.045;
  const tFoam = exteriorFoam ? 0.12 : 0;
  const tClad = 0.06;

  // z-stack, interior (−z) → exterior (+z)
  let z = -(tDry + tStud + tSheath + tFoam + tClad) / 2;
  const dryZ = z + tDry / 2;
  z += tDry;
  const studZ = z + tStud / 2;
  z += tStud;
  const sheathZ = z + tSheath / 2;
  z += tSheath;
  const foamZ = z + tFoam / 2;
  z += tFoam;
  const cladZ = z + tClad / 2;

  const studXs = [-segW / 2 + STUD / 2, 0, segW / 2 - STUD / 2];
  const bayH = segH - 2 * STUD;
  const bays: { cx: number; w: number }[] = [];
  for (let i = 0; i < studXs.length - 1; i++) {
    const a = studXs[i] + STUD / 2;
    const b = studXs[i + 1] - STUD / 2;
    bays.push({ cx: (a + b) / 2, w: b - a });
  }
  const sheathColor = sheathing === "zip" ? ZIP : sheathing === "osb" ? OSB : "#cfc7b6";

  return (
    <group position={[0, segH / 2, 0]}>
      {/* drywall (interior) */}
      <mesh position={[0, 0, dryZ]} castShadow receiveShadow>
        <boxGeometry args={[segW, segH, tDry]} />
        <meshStandardMaterial color={DRYWALL} />
      </mesh>
      {/* batt insulation in the stud bays */}
      {insulated &&
        bays.map((b) => (
          <mesh key={b.cx} position={[b.cx, 0, studZ]}>
            <boxGeometry args={[b.w, bayH, tStud * 0.9]} />
            <meshStandardMaterial color={BATT} />
          </mesh>
        ))}
      {/* top & bottom plates */}
      <mesh position={[0, segH / 2 - STUD / 2, studZ]} castShadow>
        <boxGeometry args={[segW, STUD, tStud]} />
        <meshStandardMaterial color={LUMBER_DARK} />
      </mesh>
      <mesh position={[0, -segH / 2 + STUD / 2, studZ]} castShadow>
        <boxGeometry args={[segW, STUD, tStud]} />
        <meshStandardMaterial color={LUMBER_DARK} />
      </mesh>
      {/* studs */}
      {studXs.map((sx) => (
        <mesh key={sx} position={[sx, 0, studZ]} castShadow>
          <boxGeometry args={[STUD, bayH, tStud]} />
          <meshStandardMaterial color={LUMBER} />
        </mesh>
      ))}
      {/* sheathing */}
      <mesh position={[0, 0, sheathZ]} castShadow>
        <boxGeometry args={[segW, segH, tSheath]} />
        <meshStandardMaterial color={sheathColor} />
      </mesh>
      {/* continuous exterior rigid foam */}
      {exteriorFoam && (
        <mesh position={[0, 0, foamZ]} castShadow>
          <boxGeometry args={[segW, segH, tFoam]} />
          <meshStandardMaterial color={FOAM} />
        </mesh>
      )}
      {/* cladding */}
      <mesh position={[0, 0, cladZ]} castShadow>
        <boxGeometry args={[segW, segH, tClad]} />
        <meshStandardMaterial color={CLADDING} />
      </mesh>
    </group>
  );
}

// ─── floor system ───────────────────────────────────────────────
function IJoist({ x, h, len }: { x: number; h: number; len: number }) {
  const fw = 0.25;
  const ft = 0.09;
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, h - ft / 2, 0]} castShadow>
        <boxGeometry args={[fw, ft, len]} />
        <meshStandardMaterial color={LUMBER} />
      </mesh>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[0.05, h - 2 * ft, len]} />
        <meshStandardMaterial color={IJOIST_WEB} />
      </mesh>
      <mesh position={[0, ft / 2, 0]} castShadow>
        <boxGeometry args={[fw, ft, len]} />
        <meshStandardMaterial color={LUMBER} />
      </mesh>
    </group>
  );
}

function WebBar({ x, z0, y0, z1, y1 }: { x: number; z0: number; y0: number; z1: number; y1: number }) {
  const dz = z1 - z0;
  const dy = y1 - y0;
  const len = Math.hypot(dz, dy);
  return (
    <mesh position={[x, (y0 + y1) / 2, (z0 + z1) / 2]} rotation={[Math.atan2(-dy, dz), 0, 0]} castShadow>
      <boxGeometry args={[0.08, 0.08, len]} />
      <meshStandardMaterial color={LUMBER_DARK} />
    </mesh>
  );
}

function FloorTruss({ x, h, len }: { x: number; h: number; len: number }) {
  const c = 0.13;
  const n = 5;
  const step = len / n;
  const webs: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const z0 = -len / 2 + i * step;
    const z1 = z0 + step;
    if (i % 2 === 0) webs.push(<WebBar key={i} x={x} z0={z0} y0={0} z1={z1} y1={h} />);
    else webs.push(<WebBar key={i} x={x} z0={z0} y0={h} z1={z1} y1={0} />);
  }
  return (
    <group>
      {/* top & bottom chords */}
      <mesh position={[x, h, 0]} castShadow>
        <boxGeometry args={[c, c, len]} />
        <meshStandardMaterial color={LUMBER} />
      </mesh>
      <mesh position={[x, 0, 0]} castShadow>
        <boxGeometry args={[c, c, len]} />
        <meshStandardMaterial color={LUMBER} />
      </mesh>
      {/* end posts */}
      <mesh position={[x, h / 2, -len / 2]} castShadow>
        <boxGeometry args={[c, h, c]} />
        <meshStandardMaterial color={LUMBER_DARK} />
      </mesh>
      <mesh position={[x, h / 2, len / 2]} castShadow>
        <boxGeometry args={[c, h, c]} />
        <meshStandardMaterial color={LUMBER_DARK} />
      </mesh>
      {webs}
    </group>
  );
}

function FloorSystem3D({ floorSystem }: { floorSystem: "truss" | "ijoist" }) {
  const W = 5;
  const L = 5;
  const joistH = 1.0;
  const deckT = 0.12;
  const joistXs = [-2, -0.67, 0.67, 2];
  return (
    <group>
      {/* subfloor deck */}
      <mesh position={[0, joistH + deckT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, deckT, L]} />
        <meshStandardMaterial color={SUBFLOOR} />
      </mesh>
      {floorSystem === "ijoist"
        ? joistXs.map((x) => <IJoist key={x} x={x} h={joistH} len={L} />)
        : joistXs.map((x) => <FloorTruss key={x} x={x} h={joistH} len={L} />)}
    </group>
  );
}

// ─── roof truss + attic insulation ──────────────────────────────
function ChordBar({ x0, y0, x1, y1, z, c }: { x0: number; y0: number; x1: number; y1: number; z: number; c: number }) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  return (
    <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, z]} rotation={[0, 0, Math.atan2(dy, dx)]} castShadow>
      <boxGeometry args={[len, c, c]} />
      <meshStandardMaterial color={LUMBER} />
    </mesh>
  );
}

function RoofTruss({ z, span, apexY, c }: { z: number; span: number; apexY: number; c: number }) {
  const half = span / 2;
  return (
    <group>
      {/* top chords */}
      <ChordBar x0={-half} y0={0} x1={0} y1={apexY} z={z} c={c} />
      <ChordBar x0={half} y0={0} x1={0} y1={apexY} z={z} c={c} />
      {/* bottom chord */}
      <mesh position={[0, 0, z]} castShadow>
        <boxGeometry args={[span, c, c]} />
        <meshStandardMaterial color={LUMBER_DARK} />
      </mesh>
      {/* king post + diagonal webs */}
      <mesh position={[0, apexY / 2, z]} castShadow>
        <boxGeometry args={[c * 0.8, apexY, c * 0.8]} />
        <meshStandardMaterial color={LUMBER} />
      </mesh>
      <ChordBar x0={-half / 2} y0={0} x1={0} y1={apexY} z={z} c={c * 0.7} />
      <ChordBar x0={half / 2} y0={0} x1={0} y1={apexY} z={z} c={c * 0.7} />
    </group>
  );
}

function AtticSection3D({ rValue }: { rValue: string }) {
  const span = 8;
  const apexY = 3.6;
  const c = 0.16;
  const depth = rValue === "R-60" ? 1.6 : rValue === "R-50" ? 1.3 : rValue === "R-38" ? 1.0 : 0;
  const trussZ = [-1.6, 1.6];
  const blanketZ = trussZ[1] - trussZ[0];
  // keep the blanket inside the rafters at its top edge
  const topHalf = depth > 0 ? (span / 2) * (1 - depth / apexY) : 0;
  const blanketW = Math.max(topHalf * 2 * 0.95, 1.2);
  return (
    <group>
      {trussZ.map((tz) => (
        <RoofTruss key={tz} z={tz} span={span} apexY={apexY} c={c} />
      ))}
      {/* ceiling deck */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[span, 0.08, blanketZ + 0.6]} />
        <meshStandardMaterial color={DRYWALL} />
      </mesh>
      {/* attic insulation blanket on the ceiling */}
      {depth > 0 && (
        <mesh position={[0, depth / 2, 0]} castShadow>
          <boxGeometry args={[blanketW, depth, blanketZ - 0.1]} />
          <meshStandardMaterial color={BATT} />
        </mesh>
      )}
    </group>
  );
}

// ─── grids wired into the live model panel ──────────────────────
export function FramingDetails3D({
  params,
  sheathingChosen,
}: {
  params: HouseParams;
  sheathingChosen: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <DetailCard title={`Exterior wall · ${params.framingDetail.studLabel}`}>
        <DetailViewer camera={[3.4, 3.2, 4.6]} target={[0, 2, 0]} minD={2.2} maxD={14}>
          <WallSection3D
            studDepthFt={params.framingDetail.studDepthFt}
            sheathing={sheathingChosen ? params.framingDetail.sheathing : null}
            insulated={false}
            exteriorFoam={false}
          />
        </DetailViewer>
      </DetailCard>
      <DetailCard
        title={`Floor system · ${params.framingDetail.floorSystem === "ijoist" ? "I-joists" : "Trusses"}`}
      >
        <DetailViewer camera={[5, 4.2, 6]} target={[0, 0.7, 0]} minD={3} maxD={18}>
          <FloorSystem3D floorSystem={params.framingDetail.floorSystem} />
        </DetailViewer>
      </DetailCard>
    </div>
  );
}

export function InsulationDetails3D({
  params,
  insulated,
  exteriorFoam,
  rAttic,
  sheathingChosen,
}: {
  params: HouseParams;
  insulated: boolean;
  exteriorFoam: boolean;
  rAttic: string;
  sheathingChosen: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <DetailCard title="Wall cavity — insulation">
        <DetailViewer camera={[3.4, 3.2, 4.6]} target={[0, 2, 0]} minD={2.2} maxD={14}>
          <WallSection3D
            studDepthFt={params.framingDetail.studDepthFt}
            sheathing={sheathingChosen ? params.framingDetail.sheathing : null}
            insulated={insulated}
            exteriorFoam={exteriorFoam}
          />
        </DetailViewer>
      </DetailCard>
      <DetailCard title="Attic / roof trusses">
        <DetailViewer camera={[7.5, 5, 8.5]} target={[0, 1.4, 0]} minD={4} maxD={26}>
          <AtticSection3D rValue={rAttic} />
        </DetailViewer>
      </DetailCard>
    </div>
  );
}
