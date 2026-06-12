"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { HouseParams, SiteParams } from "../../lib/houseParams";

/**
 * Pre-house construction stages for the live 3D panel:
 *  - SiteModel       — the raw lot: terrain, boundary, staked footprint
 *  - FoundationModel — step-by-step foundation build (slab/crawl/basement)
 *  - FramingModel    — lumber skeleton only; studs track ceiling heights
 *
 * Same coordinate system as HouseModel: front faces +z, y up, units feet.
 */

const DIRT = "#8a6f52";
const DIRT_DARK = "#94795b";
const CONCRETE = "#c9c4b8";
const CONCRETE_WET = "#b7b2a6";
const CMU = "#a6a094";
const STONE = "#b3a98f";
const FOAM_PINK = "#e0938f";
const FOAM_BLUE = "#7fa8c9";
const FORM_WOOD = "#a87f4f";
const LUMBER = "#d9b886";
const LUMBER_DARK = "#c5a06b";
const CHALK = "#f3f1e8";
const GRASS = "#b9c4a0";

// ─── shared helpers ─────────────────────────────────────────────

const SLOPE_PCT: Record<SiteParams["slope"], number> = {
  flat: 0,
  gentle: 0.045,
  moderate: 0.1,
  steep: 0.17,
};

function slopeDirVec(site: SiteParams): [number, number] {
  switch (site.slopeDir) {
    case "front":
      return [0, 1];
    case "rear":
      return [0, -1];
    case "left":
      return [-1, 0];
    default:
      return [1, 0];
  }
}

/** Terrain elevation at (x, z) — slope flattened over the building pad. */
function terrainY(x: number, z: number, site: SiteParams, padX: number, padZ: number): number {
  const pct = SLOPE_PCT[site.slope];
  const [dx, dz] = slopeDirVec(site);
  const along = x * dx + z * dz;
  const raw = -pct * along + 0.5 * Math.sin(x * 0.045) * Math.cos(z * 0.04);
  // blend factor: 0 over the pad, 1 beyond pad + 18 ft
  const r = Math.max(Math.abs(x) / (padX + 8), Math.abs(z) / (padZ + 8));
  const t = Math.min(Math.max((r - 1) / 0.5, 0), 1);
  const blend = t * t * (3 - 2 * t);
  return raw * blend;
}

function seededRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Sloped (optionally topo-textured) terrain plane. */
function Terrain({ p, sizeFt }: { p: HouseParams; sizeFt: number }) {
  const padX = p.widthFt / 2 + 10;
  const padZ = p.depthFt / 2 + 10;
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(sizeFt, sizeFt, 56, 56);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      // after rotation.x = -90°, local (x, y) → world (x, -z)
      pos.setZ(i, terrainY(px, -py, p.site, padX, padZ));
    }
    g.computeVertexNormals();
    return g;
  }, [sizeFt, p.site, padX, padZ]);

  return (
    <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      {p.site.topoMapUrl ? (
        <Suspense fallback={<meshStandardMaterial color={GRASS} />}>
          <TopoMaterial url={p.site.topoMapUrl} />
        </Suspense>
      ) : (
        <meshStandardMaterial color={GRASS} />
      )}
    </mesh>
  );
}

function TopoMaterial({ url }: { url: string }) {
  const texture = useLoader(THREE.TextureLoader, url);
  return <meshStandardMaterial map={texture} color="#d8d8d0" />;
}

/** Chalk lines + corner stakes marking the house footprint. */
function StakedFootprint({ p, stakes = true }: { p: HouseParams; stakes?: boolean }) {
  const w = p.widthFt;
  const d = p.depthFt;
  const corners: [number, number][] = [
    [-w / 2, -d / 2],
    [w / 2, -d / 2],
    [w / 2, d / 2],
    [-w / 2, d / 2],
  ];
  return (
    <group>
      {/* chalk outline */}
      <mesh position={[0, 0.06, d / 2]}>
        <boxGeometry args={[w, 0.04, 0.22]} />
        <meshStandardMaterial color={CHALK} />
      </mesh>
      <mesh position={[0, 0.06, -d / 2]}>
        <boxGeometry args={[w, 0.04, 0.22]} />
        <meshStandardMaterial color={CHALK} />
      </mesh>
      <mesh position={[-w / 2, 0.06, 0]}>
        <boxGeometry args={[0.22, 0.04, d]} />
        <meshStandardMaterial color={CHALK} />
      </mesh>
      <mesh position={[w / 2, 0.06, 0]}>
        <boxGeometry args={[0.22, 0.04, d]} />
        <meshStandardMaterial color={CHALK} />
      </mesh>
      {stakes &&
        corners.map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.8, 0]} castShadow>
              <boxGeometry args={[0.18, 1.6, 0.18]} />
              <meshStandardMaterial color="#d8c49a" />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.5, 0.3, 0.04]} />
              <meshStandardMaterial color="#e2638a" />
            </mesh>
          </group>
        ))}
    </group>
  );
}

// ─── SITE MODEL ─────────────────────────────────────────────────

const TREE_COUNT: Record<SiteParams["trees"], number> = {
  open: 3,
  scattered: 9,
  partial: 16,
  wooded: 28,
};

export function SiteModel({ p }: { p: HouseParams }) {
  const lot = p.site.lotSideFt;
  const padX = p.widthFt / 2 + 10;
  const padZ = p.depthFt / 2 + 10;
  const tY = (x: number, z: number) => terrainY(x, z, p.site, padX, padZ);

  // boundary stakes: 6 per edge
  const boundary = useMemo(() => {
    const posts: [number, number][] = [];
    const half = lot / 2;
    const n = 6;
    for (let i = 0; i < n; i++) {
      const t = -half + (lot * i) / (n - 1);
      posts.push([t, -half], [t, half]);
      if (i !== 0 && i !== n - 1) posts.push([-half, t], [half, t]);
    }
    return posts;
  }, [lot]);

  // deterministic tree field outside the pad
  const trees = useMemo(() => {
    const out: { x: number; z: number; s: number }[] = [];
    const count = TREE_COUNT[p.site.trees];
    const half = lot / 2 - 7;
    for (let i = 0; i < count; i++) {
      let x = (seededRand(i + 1) * 2 - 1) * half;
      let z = (seededRand(i + 101) * 2 - 1) * half;
      if (Math.abs(x) < padX + 6 && Math.abs(z) < padZ + 6) {
        // push out of the building pad
        x = Math.sign(x || 1) * (padX + 8 + seededRand(i + 201) * Math.max(half - padX - 9, 2));
      }
      out.push({ x, z, s: 0.7 + seededRand(i + 301) * 0.7 });
    }
    return out;
  }, [p.site.trees, lot, padX, padZ]);

  // drainage arrows pointing downhill
  const [dx, dz] = slopeDirVec(p.site);
  const showFlow = p.site.slope !== "flat";
  const flowYaw = Math.atan2(dx, dz);

  // sun marker toward south, relative to the direction the home faces
  const sunTheta = THREE.MathUtils.degToRad(180 - p.site.streetFacingDeg);
  const sunDist = lot / 2 + 18;
  const sunPos: [number, number, number] = [
    Math.sin(sunTheta) * sunDist,
    44,
    Math.cos(sunTheta) * sunDist,
  ];

  return (
    <group>
      <Terrain p={p} sizeFt={lot + 70} />
      <StakedFootprint p={p} />

      {/* lot boundary survey stakes */}
      {boundary.map(([x, z], i) => (
        <group key={i} position={[x, tY(x, z), z]}>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.16, 1.4, 0.16]} />
            <meshStandardMaterial color="#e8e2d0" />
          </mesh>
          <mesh position={[0, 1.32, 0]}>
            <boxGeometry args={[0.42, 0.26, 0.05]} />
            <meshStandardMaterial color="#d6603f" />
          </mesh>
        </group>
      ))}

      {/* trees */}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, tY(t.x, t.z), t.z]} scale={t.s}>
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.6, 6, 8]} />
            <meshStandardMaterial color="#7a5c3e" />
          </mesh>
          <mesh position={[0, 9, 0]} castShadow>
            <coneGeometry args={[4.4, 9, 10]} />
            <meshStandardMaterial color="#6f8757" />
          </mesh>
          <mesh position={[0, 13.5, 0]} castShadow>
            <coneGeometry args={[3, 6, 10]} />
            <meshStandardMaterial color="#7b9362" />
          </mesh>
        </group>
      ))}

      {/* drainage arrows */}
      {showFlow &&
        [-16, 0, 16].map((off) => {
          const px = dx * (p.depthFt / 2 + 22) + -dz * off;
          const pz = dz * (p.depthFt / 2 + 22) + dx * off;
          return (
            <group key={off} position={[px, tY(px, pz) + 0.5, pz]} rotation={[0, flowYaw, 0]}>
              <mesh>
                <boxGeometry args={[0.6, 0.14, 6]} />
                <meshStandardMaterial color="#5d83b4" />
              </mesh>
              <mesh position={[0, 0, 3.9]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[1.1, 2.4, 12]} />
                <meshStandardMaterial color="#5d83b4" />
              </mesh>
            </group>
          );
        })}

      {/* sun marker on the southern sky */}
      <mesh position={sunPos}>
        <sphereGeometry args={[3.4, 20, 20]} />
        <meshStandardMaterial color="#f4c542" emissive="#f4b400" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

// ─── FOUNDATION MODEL — staged build ────────────────────────────

export const FOUNDATION_STEP_COUNT = 5;

export function foundationSteps(type: HouseParams["foundationType"]): string[] {
  if (type === "basement")
    return ["Site staked", "Excavation", "Footings", "Pour walls", "Slab + backfill"];
  if (type === "crawlspace")
    return ["Site staked", "Excavation", "Footings", "Stem walls", "Backfill + vents"];
  return ["Site staked", "Excavation", "Footings", "Stone + forms", "Pour slab"];
}

interface PitSpec {
  depth: number;
  margin: number;
}

function pitSpec(p: HouseParams): PitSpec {
  if (p.foundationType === "basement") return { depth: 8.5, margin: 6 };
  if (p.foundationType === "crawlspace") return { depth: 2.0, margin: 4 };
  return { depth: 1.2, margin: 3 };
}

/** Flat ground plane with an open excavation pit (hole + dirt walls + floor). */
function GroundWithPit({ p, open }: { p: HouseParams; open: boolean }) {
  const G = 170;
  const { depth, margin } = pitSpec(p);
  const pw = p.widthFt + margin * 2;
  const pd = p.depthFt + margin * 2;

  const holeGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-G, -G);
    shape.lineTo(G, -G);
    shape.lineTo(G, G);
    shape.lineTo(-G, G);
    shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-pw / 2, -pd / 2);
    hole.lineTo(pw / 2, -pd / 2);
    hole.lineTo(pw / 2, pd / 2);
    hole.lineTo(-pw / 2, pd / 2);
    hole.closePath();
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape);
  }, [pw, pd]);

  if (!open) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[G * 2, G * 2]} />
        <meshStandardMaterial color={GRASS} />
      </mesh>
    );
  }

  return (
    <group>
      <mesh geometry={holeGeom} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <meshStandardMaterial color={GRASS} />
      </mesh>
      {/* pit walls */}
      <mesh position={[0, -depth / 2, -pd / 2 + 0.25]}>
        <boxGeometry args={[pw, depth, 0.5]} />
        <meshStandardMaterial color={DIRT} />
      </mesh>
      <mesh position={[0, -depth / 2, pd / 2 - 0.25]}>
        <boxGeometry args={[pw, depth, 0.5]} />
        <meshStandardMaterial color={DIRT} />
      </mesh>
      <mesh position={[-pw / 2 + 0.25, -depth / 2, 0]}>
        <boxGeometry args={[0.5, depth, pd]} />
        <meshStandardMaterial color={DIRT} />
      </mesh>
      <mesh position={[pw / 2 - 0.25, -depth / 2, 0]}>
        <boxGeometry args={[0.5, depth, pd]} />
        <meshStandardMaterial color={DIRT} />
      </mesh>
      {/* pit floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -depth, 0]} receiveShadow>
        <planeGeometry args={[pw, pd]} />
        <meshStandardMaterial color={DIRT_DARK} />
      </mesh>
      {/* spoil pile waiting to become backfill */}
      <mesh position={[pw / 2 + 14, 0, -8]} scale={[1, 0.35, 1]} castShadow>
        <sphereGeometry args={[Math.min(7 + depth, 12), 16, 12]} />
        <meshStandardMaterial color={DIRT} />
      </mesh>
    </group>
  );
}

/** Concrete footing strips around the footprint perimeter. */
function Footings({ p, y }: { p: HouseParams; y: number }) {
  const w = p.widthFt;
  const d = p.depthFt;
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0, d / 2]} castShadow>
        <boxGeometry args={[w + 2, 0.8, 2]} />
        <meshStandardMaterial color={CONCRETE_WET} />
      </mesh>
      <mesh position={[0, 0, -d / 2]} castShadow>
        <boxGeometry args={[w + 2, 0.8, 2]} />
        <meshStandardMaterial color={CONCRETE_WET} />
      </mesh>
      <mesh position={[-w / 2, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.8, d - 2]} />
        <meshStandardMaterial color={CONCRETE_WET} />
      </mesh>
      <mesh position={[w / 2, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.8, d - 2]} />
        <meshStandardMaterial color={CONCRETE_WET} />
      </mesh>
    </group>
  );
}

/** Perimeter wall ring (stem walls or basement walls). */
function WallRing({
  p,
  bottom,
  top,
  thickness,
  color,
}: {
  p: HouseParams;
  bottom: number;
  top: number;
  thickness: number;
  color: string;
}) {
  const w = p.widthFt;
  const d = p.depthFt;
  const h = top - bottom;
  const cy = bottom + h / 2;
  return (
    <group>
      <mesh position={[0, cy, d / 2 - thickness / 2]} castShadow>
        <boxGeometry args={[w, h, thickness]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, cy, -d / 2 + thickness / 2]} castShadow>
        <boxGeometry args={[w, h, thickness]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-w / 2 + thickness / 2, cy, 0]} castShadow>
        <boxGeometry args={[thickness, h, d - thickness * 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[w / 2 - thickness / 2, cy, 0]} castShadow>
        <boxGeometry args={[thickness, h, d - thickness * 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function FoundationModel({ p, step }: { p: HouseParams; step: number }) {
  const w = p.widthFt;
  const d = p.depthFt;
  const { depth } = pitSpec(p);
  const fd = p.foundationDetail;
  const type = p.foundationType;

  const pitOpen = step >= 1 && step < 4;
  const stoneH = fd.stoneBaseIn / 12;
  const slabH = fd.slabDepthIn / 12;

  return (
    <group>
      <GroundWithPit p={p} open={pitOpen} />
      {step === 0 && <StakedFootprint p={p} />}
      {step === 1 && <StakedFootprint p={p} stakes={false} />}

      {/* footings on the pit floor */}
      {step >= 2 && <Footings p={p} y={-depth + 0.4} />}

      {/* ── slab on grade ── */}
      {type === "slab" && step >= 3 && (
        <group>
          {/* compacted stone base */}
          <mesh position={[0, -0.6 + stoneH / 2, 0]}>
            <boxGeometry args={[w, stoneH, d]} />
            <meshStandardMaterial color={STONE} />
          </mesh>
          {/* under-slab rigid foam */}
          {fd.bottomInsulation && (
            <mesh position={[0, -0.6 + stoneH + 0.08, 0]}>
              <boxGeometry args={[w, 0.16, d]} />
              <meshStandardMaterial color={FOAM_BLUE} />
            </mesh>
          )}
          {/* form boards */}
          {step === 3 && (
            <WallRing p={{ ...p, widthFt: w + 0.4, depthFt: d + 0.4 }} bottom={-0.4} top={0.7} thickness={0.16} color={FORM_WOOD} />
          )}
        </group>
      )}
      {type === "slab" && step >= 4 && (
        <group>
          {/* the cured slab */}
          <mesh position={[0, 0.55 - slabH / 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[w, slabH, d]} />
            <meshStandardMaterial color={CONCRETE} />
          </mesh>
          {/* slab-edge insulation */}
          {fd.sideInsulation && (
            <WallRing p={{ ...p, widthFt: w + 0.5, depthFt: d + 0.5 }} bottom={-0.55} top={0.55} thickness={0.2} color={FOAM_PINK} />
          )}
        </group>
      )}

      {/* ── crawlspace ── */}
      {type === "crawlspace" && step >= 3 && (
        <WallRing p={p} bottom={-depth + 0.8} top={fd.crawlHeightFt} thickness={0.7} color={CMU} />
      )}
      {type === "crawlspace" && step >= 4 && (
        <group>
          {/* crawlspace vents on the front wall */}
          {[-w / 3, 0, w / 3].map((x) => (
            <mesh key={x} position={[x, fd.crawlHeightFt - 0.55, d / 2 + 0.04]}>
              <boxGeometry args={[1.3, 0.65, 0.08]} />
              <meshStandardMaterial color="#3f3b35" />
            </mesh>
          ))}
          {/* sill plate, ready for framing */}
          <WallRing p={p} bottom={fd.crawlHeightFt} top={fd.crawlHeightFt + 0.13} thickness={0.7} color={LUMBER_DARK} />
        </group>
      )}

      {/* ── basement ── */}
      {type === "basement" && step >= 3 && (
        <group>
          <WallRing p={p} bottom={-depth + 0.8} top={1.5} thickness={0.7} color={CONCRETE} />
          {/* waterproofing coat below grade */}
          <WallRing
            p={{ ...p, widthFt: w + 0.14, depthFt: d + 0.14 }}
            bottom={-depth + 0.8}
            top={-0.2}
            thickness={0.1}
            color="#3a3632"
          />
        </group>
      )}
      {type === "basement" && step >= 4 && (
        <group>
          {/* basement floor slab */}
          <mesh position={[0, -depth + 0.8 + slabH / 2, 0]}>
            <boxGeometry args={[w - 1.4, slabH, d - 1.4]} />
            <meshStandardMaterial color={CONCRETE} />
          </mesh>
          <WallRing p={p} bottom={1.5} top={1.63} thickness={0.7} color={LUMBER_DARK} />
        </group>
      )}
    </group>
  );
}

// ─── FRAMING MODEL ──────────────────────────────────────────────

interface Piece {
  pos: [number, number, number];
  size: [number, number, number];
  rot?: [number, number, number];
}

function LumberInstances({ pieces, color }: { pieces: Piece[]; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const v = new THREE.Vector3();
    const s = new THREE.Vector3();
    pieces.forEach((pc, i) => {
      e.set(pc.rot?.[0] ?? 0, pc.rot?.[1] ?? 0, pc.rot?.[2] ?? 0);
      q.setFromEuler(e);
      v.set(...pc.pos);
      s.set(...pc.size);
      m.compose(v, q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [pieces]);

  return (
    <instancedMesh
      key={pieces.length}
      ref={ref}
      args={[undefined, undefined, pieces.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </instancedMesh>
  );
}

const STUD_T = 1.5 / 12; // 1.5" stud thickness
const SPACING_16 = 16 / 12;
const SPACING_24 = 2;

function gridPositions(span: number, spacing: number): number[] {
  const out: number[] = [];
  for (let x = -span / 2; x <= span / 2 - spacing / 2; x += spacing) out.push(x);
  out.push(span / 2);
  return out;
}

export function FramingModel({ p }: { p: HouseParams }) {
  const w = p.widthFt;
  const d = p.depthFt;
  const studD = p.framingDetail.studDepthFt;
  const fnd = p.foundationType === "slab" ? 0.7 : 1.5;
  const onSlab = p.foundationType === "slab";
  const crawlTop = p.foundationType === "crawlspace" ? fnd + p.foundationDetail.crawlHeightFt - 1 : fnd;

  const platform = 1.0; // joists + subfloor
  const joistH = 0.85;
  const base1 = onSlab ? fnd : fnd + platform;
  const wall1Top = base1 + p.firstFloorFt;
  const base2 = wall1Top + platform;
  const wall2Top = base2 + p.secondFloorFt;
  const pitch = p.roofPitch / 12;
  const ridgeY = wall2Top + (d / 2) * pitch;

  // ── studs: a wall = bottom plate + studs + double top plate ──
  const { studs, plates, joists, rafters } = useMemo(() => {
    const studs: Piece[] = [];
    const plates: Piece[] = [];
    const joists: Piece[] = [];
    const rafters: Piece[] = [];

    function wall(base: number, height: number) {
      const studH = height - 3 * STUD_T;
      const studY = base + STUD_T + studH / 2;
      // front + back walls (full width, along x)
      for (const z of [d / 2 - studD / 2, -d / 2 + studD / 2]) {
        for (const x of gridPositions(w - STUD_T, SPACING_16)) {
          studs.push({ pos: [x, studY, z], size: [STUD_T, studH, studD] });
        }
        plates.push({ pos: [0, base + STUD_T / 2, z], size: [w, STUD_T, studD] });
        plates.push({ pos: [0, base + height - STUD_T * 1.5, z], size: [w, STUD_T, studD] });
        plates.push({ pos: [0, base + height - STUD_T / 2, z], size: [w, STUD_T, studD] });
      }
      // side walls (between front/back, along z)
      const sideSpan = d - 2 * studD;
      for (const x of [w / 2 - studD / 2, -w / 2 + studD / 2]) {
        for (const z of gridPositions(sideSpan - STUD_T, SPACING_16)) {
          studs.push({ pos: [x, studY, z], size: [studD, studH, STUD_T] });
        }
        plates.push({ pos: [x, base + STUD_T / 2, 0], size: [studD, STUD_T, sideSpan] });
        plates.push({ pos: [x, base + height - STUD_T * 1.5, 0], size: [studD, STUD_T, sideSpan] });
        plates.push({ pos: [x, base + height - STUD_T / 2, 0], size: [studD, STUD_T, sideSpan] });
      }
    }

    function floorJoists(top: number) {
      const y = top - 0.07 - joistH / 2;
      for (const x of gridPositions(w - STUD_T, SPACING_16)) {
        joists.push({ pos: [x, y, 0], size: [STUD_T, joistH, d - 0.4] });
      }
      // rim joists
      joists.push({ pos: [0, y, d / 2 - 0.1], size: [w, joistH, 0.2] });
      joists.push({ pos: [0, y, -d / 2 + 0.1], size: [w, joistH, 0.2] });
    }

    if (!onSlab) floorJoists(base1);
    wall(base1, p.firstFloorFt);
    floorJoists(base2);
    wall(base2, p.secondFloorFt);

    // ceiling joists across the second-floor ceiling
    for (const x of gridPositions(w - STUD_T, SPACING_16)) {
      joists.push({ pos: [x, wall2Top + 0.3, 0], size: [STUD_T, 0.6, d - 0.6] });
    }

    // rafters, both slopes at 24" o.c.
    const run = d / 2 + 1;
    const rise = run * pitch;
    const len = Math.hypot(run, rise);
    const ang = Math.atan2(rise, run);
    for (const x of gridPositions(w - STUD_T, SPACING_24)) {
      rafters.push({
        pos: [x, (wall2Top + 0.4 + ridgeY) / 2 + 0.35, run / 2 - 0.5],
        size: [STUD_T, 0.7, len],
        rot: [ang, 0, 0],
      });
      rafters.push({
        pos: [x, (wall2Top + 0.4 + ridgeY) / 2 + 0.35, -(run / 2 - 0.5)],
        size: [STUD_T, 0.7, len],
        rot: [-ang, 0, 0],
      });
    }

    return { studs, plates, joists, rafters };
  }, [w, d, studD, onSlab, base1, base2, wall2Top, ridgeY, pitch, p.firstFloorFt, p.secondFloorFt]);

  return (
    <group>
      {/* graded site */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[340, 340]} />
        <meshStandardMaterial color={GRASS} />
      </mesh>

      {/* foundation below the framing */}
      {onSlab ? (
        <mesh position={[0, fnd / 2, 0]} receiveShadow>
          <boxGeometry args={[w + 0.6, fnd, d + 0.6]} />
          <meshStandardMaterial color={CONCRETE} />
        </mesh>
      ) : (
        <WallRing
          p={p}
          bottom={0}
          top={p.foundationType === "crawlspace" ? Math.max(crawlTop, fnd) : fnd}
          thickness={0.7}
          color={p.foundationType === "crawlspace" ? CMU : CONCRETE}
        />
      )}

      {/* subfloor decks */}
      {!onSlab && (
        <mesh position={[0, base1 - 0.035, 0]} receiveShadow>
          <boxGeometry args={[w, 0.07, d]} />
          <meshStandardMaterial color="#cba36b" />
        </mesh>
      )}
      <mesh position={[0, base2 - 0.035, 0]} receiveShadow>
        <boxGeometry args={[w, 0.07, d]} />
        <meshStandardMaterial color="#cba36b" />
      </mesh>

      <LumberInstances pieces={studs} color={LUMBER} />
      <LumberInstances pieces={plates} color={LUMBER_DARK} />
      <LumberInstances pieces={joists} color="#cfa874" />
      <LumberInstances pieces={rafters} color="#d3ae7e" />

      {/* ridge board */}
      <mesh position={[0, ridgeY + 0.55, 0]} castShadow>
        <boxGeometry args={[w, 0.9, STUD_T]} />
        <meshStandardMaterial color={LUMBER_DARK} />
      </mesh>
    </group>
  );
}
