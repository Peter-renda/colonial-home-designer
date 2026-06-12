"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { HouseParams, wallHeightFt, frontBayXs } from "../../lib/houseParams";
import { gablePrism, hipPrism, shedPrism, gableEndShape } from "./geometry";

/**
 * Parametric Colonial massing model. Front of house faces +z, y is up.
 * All units are feet. Everything derives from HouseParams, so the model
 * rebuilds live as quiz answers change.
 */

const OVERHANG = 1; // eave overhang, ft
const RAKE = 0.8; // rake (gable-end) overhang, ft

interface Props {
  params: HouseParams;
}

export default function HouseModel({ params: p }: Props) {
  const wallH = wallHeightFt(p);
  const fnd = p.foundationExposedFt;
  const eaveY = fnd + wallH;
  const pp = p.roofPitch / 12;
  const frontZ = p.depthFt / 2;
  const ridgeY = eaveY - OVERHANG * pp + ((p.depthFt / 2 + OVERHANG) * pp);

  return (
    <group>
      <Ground p={p} />
      <Foundation p={p} fnd={fnd} />
      <MainBody p={p} fnd={fnd} wallH={wallH} />
      <MainRoof p={p} eaveY={eaveY} />
      {p.dormers !== "none" && <Dormers p={p} eaveY={eaveY} />}
      {p.roofShape === "gableFrontGable" && <FrontGable p={p} eaveY={eaveY} />}
      <FrontFacade p={p} fnd={fnd} frontZ={frontZ} />
      <SideAndRearOpenings p={p} fnd={fnd} />
      <Entry p={p} fnd={fnd} frontZ={frontZ} />
      {p.fullWidthPorch && <FullWidthPorch p={p} fnd={fnd} frontZ={frontZ} />}
      {p.rearPorch && (
        <mesh position={[0, fnd / 2, -frontZ - 5]} receiveShadow castShadow>
          <boxGeometry args={[20, Math.max(fnd, 0.5), 10]} />
          <meshStandardMaterial color="#c9c2b2" />
        </mesh>
      )}
      {p.garage !== "none" && <Garage p={p} fnd={fnd} frontZ={frontZ} />}
      {p.chimney && (
        <mesh
          position={[p.widthFt / 2 - 6, (ridgeY + 3) / 2, 0]}
          castShadow
        >
          <boxGeometry args={[2.2, ridgeY + 3, 2.2]} />
          <meshStandardMaterial color="#8a4434" />
        </mesh>
      )}
      {p.sunroom !== "none" && <Sunroom p={p} fnd={fnd} />}
    </group>
  );
}

// ─── Site ───────────────────────────────────────────────────────

function Ground({ p }: { p: HouseParams }) {
  const frontZ = p.depthFt / 2;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#b9c4a0" />
      </mesh>
      {/* front walkway */}
      <mesh position={[0, 0.02, frontZ + 14]} receiveShadow>
        <boxGeometry args={[4, 0.08, 24]} />
        <meshStandardMaterial color="#cfcabc" />
      </mesh>
      {/* driveway */}
      {p.garage !== "none" && (
        <mesh
          position={
            p.garage === "front2"
              ? [p.widthFt / 2 + p.garageWFt / 2, 0.02, frontZ + 18]
              : [p.widthFt / 2 + p.garageDFt + 12, 0.02, 4]
          }
          receiveShadow
        >
          <boxGeometry
            args={
              p.garage === "front2"
                ? [p.garageWFt - 2, 0.08, 32]
                : [22, 0.08, Math.max(p.garageWFt, 22) + 18]
            }
          />
          <meshStandardMaterial color="#c4bfb2" />
        </mesh>
      )}
    </group>
  );
}

function Foundation({ p, fnd }: { p: HouseParams; fnd: number }) {
  return (
    <mesh position={[0, fnd / 2, 0]} receiveShadow>
      <boxGeometry args={[p.widthFt + 0.6, fnd, p.depthFt + 0.6]} />
      <meshStandardMaterial color={p.foundationColor} />
    </mesh>
  );
}

// ─── Massing ────────────────────────────────────────────────────

function MainBody({ p, fnd, wallH }: { p: HouseParams; fnd: number; wallH: number }) {
  return (
    <mesh position={[0, fnd + wallH / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[p.widthFt, wallH, p.depthFt]} />
      <meshStandardMaterial color={p.facadeColor} />
    </mesh>
  );
}

function MainRoof({ p, eaveY }: { p: HouseParams; eaveY: number }) {
  const pp = p.roofPitch / 12;
  const wExt = p.widthFt + 2 * RAKE;
  const dExt = p.depthFt + 2 * OVERHANG;
  const rise = (dExt / 2) * pp;
  const baseY = eaveY - OVERHANG * pp;

  const roofGeom = useMemo(
    () => (p.roofShape === "hip" ? hipPrism(wExt, dExt, rise) : gablePrism(wExt, dExt, rise)),
    [p.roofShape, wExt, dExt, rise]
  );
  const endGeom = useMemo(
    () => gableEndShape(p.depthFt, (p.depthFt / 2) * pp),
    [p.depthFt, pp]
  );

  return (
    <group>
      <mesh geometry={roofGeom} position={[0, baseY, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={p.roofColor} flatShading />
      </mesh>
      {p.roofShape !== "hip" && (
        <>
          <mesh geometry={endGeom} position={[-p.widthFt / 2, eaveY, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <meshStandardMaterial color={p.facadeColor} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={endGeom} position={[p.widthFt / 2, eaveY, 0]} rotation={[0, Math.PI / 2, 0]}>
            <meshStandardMaterial color={p.facadeColor} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      {/* fascia band along eaves */}
      <mesh position={[0, eaveY - 0.3, p.depthFt / 2 + OVERHANG / 2]}>
        <boxGeometry args={[wExt, 0.7, OVERHANG + 0.2]} />
        <meshStandardMaterial color={p.trimColor} />
      </mesh>
      <mesh position={[0, eaveY - 0.3, -p.depthFt / 2 - OVERHANG / 2]}>
        <boxGeometry args={[wExt, 0.7, OVERHANG + 0.2]} />
        <meshStandardMaterial color={p.trimColor} />
      </mesh>
    </group>
  );
}

function FrontGable({ p, eaveY }: { p: HouseParams; eaveY: number }) {
  const pp = p.roofPitch / 12;
  const w = 14;
  const rise = ((w / 2 + OVERHANG) * pp) * 0.9;
  const roofGeom = useMemo(() => gablePrism(12, w + 2 * RAKE, rise), [w, rise]);
  const endGeom = useMemo(() => gableEndShape(w, (w / 2) * pp * 0.9), [w, pp]);
  return (
    <group>
      {/* cross-gable ridge runs toward the street (along z) */}
      <mesh
        geometry={roofGeom}
        position={[0, eaveY, p.depthFt / 2 - 5.5]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
      >
        <meshStandardMaterial color={p.roofColor} flatShading />
      </mesh>
      <mesh geometry={endGeom} position={[0, eaveY, p.depthFt / 2 + 0.05]}>
        <meshStandardMaterial color={p.facadeColor} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Dormers({ p, eaveY }: { p: HouseParams; eaveY: number }) {
  const pp = p.roofPitch / 12;
  const upSlope = 6; // plan distance from eave to dormer face
  const z0 = p.depthFt / 2 - upSlope;
  const baseY = eaveY + upSlope * pp - 1.2;
  const xs = [-p.widthFt / 4, 0, p.widthFt / 4].slice(0, p.dormerCount);
  const w = 4.2;
  const h = 4.8;

  const capGeom = useMemo(() => {
    if (p.dormers === "gable") return gablePrism(5.4, w + 0.8, 1.8);
    if (p.dormers === "hip") return hipPrism(5.4, w + 0.8, 1.4);
    return shedPrism(w + 0.8, 5.4, 1.4);
  }, [p.dormers, w]);

  return (
    <group>
      {xs.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, baseY + h / 2, z0 - 2.5]} castShadow>
            <boxGeometry args={[w, h, 5]} />
            <meshStandardMaterial color={p.trimColor} />
          </mesh>
          {/* dormer window */}
          <mesh position={[0, baseY + h / 2 + 0.2, z0 + 0.06]}>
            <boxGeometry args={[2.2, 2.8, 0.1]} />
            <meshStandardMaterial color="#9fbcc8" roughness={0.15} metalness={0.2} />
          </mesh>
          <mesh
            geometry={capGeom}
            position={[0, baseY + h, z0 - 2.5]}
            rotation={p.dormers === "shed" ? [0, 0, 0] : [0, Math.PI / 2, 0]}
            castShadow
          >
            <meshStandardMaterial color={p.roofColor} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Openings ───────────────────────────────────────────────────

function WindowUnit({
  p,
  w,
  h,
  shutters,
}: {
  p: HouseParams;
  w: number;
  h: number;
  shutters: boolean;
}) {
  return (
    <group>
      {/* casing */}
      <mesh castShadow>
        <boxGeometry args={[w + 0.5, h + 0.5, 0.25]} />
        <meshStandardMaterial color={p.trimColor} />
      </mesh>
      {/* glass */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[w - 0.15, h - 0.15, 0.1]} />
        <meshStandardMaterial color="#9fbcc8" roughness={0.12} metalness={0.25} />
      </mesh>
      {/* muntins */}
      <mesh position={[0, 0, 0.17]}>
        <boxGeometry args={[0.1, h - 0.2, 0.02]} />
        <meshStandardMaterial color={p.trimColor} />
      </mesh>
      <mesh position={[0, 0, 0.17]}>
        <boxGeometry args={[w - 0.2, 0.1, 0.02]} />
        <meshStandardMaterial color={p.trimColor} />
      </mesh>
      {/* sill */}
      <mesh position={[0, -h / 2 - 0.3, 0.05]}>
        <boxGeometry args={[w + 0.8, 0.3, 0.45]} />
        <meshStandardMaterial color={p.trimColor} />
      </mesh>
      {shutters && (
        <>
          <mesh position={[-(w / 2 + 0.45 + w * 0.22), 0, 0]}>
            <boxGeometry args={[w * 0.44, h, 0.15]} />
            <meshStandardMaterial color={p.shutterColor} />
          </mesh>
          <mesh position={[w / 2 + 0.45 + w * 0.22, 0, 0]}>
            <boxGeometry args={[w * 0.44, h, 0.15]} />
            <meshStandardMaterial color={p.shutterColor} />
          </mesh>
        </>
      )}
    </group>
  );
}

function FrontFacade({ p, fnd, frontZ }: { p: HouseParams; fnd: number; frontZ: number }) {
  const xs = frontBayXs(p);
  const firstY = fnd + 2.8 + p.windowH / 2;
  const upperH = Math.min(p.windowH, 5);
  const secondY = fnd + p.firstFloorFt + 1 + 2.2 + upperH / 2;
  return (
    <group position={[0, 0, frontZ + 0.05]}>
      {/* second floor: window in every bay */}
      {xs.map((x) => (
        <group key={`u-${x}`} position={[x, secondY, 0]}>
          <WindowUnit p={p} w={p.windowW} h={upperH} shutters={p.shutters} />
        </group>
      ))}
      {/* first floor: skip the center bay (door) */}
      {xs.map((x, i) =>
        i === Math.floor(xs.length / 2) ? null : (
          <group key={`l-${x}`} position={[x, firstY, 0]}>
            <WindowUnit p={p} w={p.windowW} h={p.windowH} shutters={p.shutters} />
          </group>
        )
      )}
    </group>
  );
}

function SideAndRearOpenings({ p, fnd }: { p: HouseParams; fnd: number }) {
  const firstY = fnd + 2.8 + p.windowH / 2;
  const upperH = Math.min(p.windowH, 5);
  const secondY = fnd + p.firstFloorFt + 1 + 2.2 + upperH / 2;
  const sideXs = [-p.depthFt / 4, p.depthFt / 4];
  const rearXs = frontBayXs(p);
  return (
    <group>
      {/* sides */}
      {([-1, 1] as const).map((side) => (
        <group
          key={side}
          position={[side * (p.widthFt / 2 + 0.05), 0, 0]}
          rotation={[0, (side * Math.PI) / 2, 0]}
        >
          {sideXs.map((x) => (
            <group key={`s1-${x}`} position={[x, firstY, 0]}>
              <WindowUnit p={p} w={p.windowW} h={p.windowH} shutters={false} />
            </group>
          ))}
          {sideXs.map((x) => (
            <group key={`s2-${x}`} position={[x, secondY, 0]}>
              <WindowUnit p={p} w={p.windowW} h={upperH} shutters={false} />
            </group>
          ))}
        </group>
      ))}
      {/* rear */}
      <group position={[0, 0, -p.depthFt / 2 - 0.05]} rotation={[0, Math.PI, 0]}>
        {rearXs.map((x, i) =>
          i === Math.floor(rearXs.length / 2) ? null : (
            <group key={`r1-${x}`} position={[x, firstY, 0]}>
              <WindowUnit p={p} w={p.windowW} h={p.windowH} shutters={false} />
            </group>
          )
        )}
        {rearXs.map((x) => (
          <group key={`r2-${x}`} position={[x, secondY, 0]}>
            <WindowUnit p={p} w={p.windowW} h={upperH} shutters={false} />
          </group>
        ))}
        {/* rear door / patio door */}
        <mesh position={[0, fnd + 3.5, 0]}>
          <boxGeometry args={[p.patioDoor ? 8 : 3.2, 7, 0.3]} />
          <meshStandardMaterial
            color={p.patioDoor ? "#9fbcc8" : p.doorColor}
            roughness={p.patioDoor ? 0.15 : 0.7}
            metalness={p.patioDoor ? 0.25 : 0}
          />
        </mesh>
      </group>
    </group>
  );
}

// ─── Entry: door, surround, portico, stoop ──────────────────────

function Entry({ p, fnd, frontZ }: { p: HouseParams; fnd: number; frontZ: number }) {
  const doorH = 6.9;
  const doorY = fnd + doorH / 2;
  const pp = p.roofPitch / 12;

  const porticoW = 9;
  const porticoD = 6.2;
  const porticoTop = fnd + doorH + (p.transom !== "none" ? 2.2 : 1.2);

  const gableGeom = useMemo(() => gablePrism(porticoD + 1, porticoW + 1, ((porticoW / 2) * pp) / 2), [porticoD, porticoW, pp]);
  const hipGeom = useMemo(() => hipPrism(porticoW + 1, porticoD + 1, 1.6), [porticoW, porticoD]);

  return (
    <group position={[0, 0, frontZ]}>
      {/* stoop / front porch slab */}
      {(p.frontPorch || p.portico !== "none") && !p.fullWidthPorch && (
        <mesh position={[0, Math.max(fnd, 0.5) / 2, 3.2]} receiveShadow castShadow>
          <boxGeometry args={[9, Math.max(fnd, 0.5), 6.4]} />
          <meshStandardMaterial color="#c9c2b2" />
        </mesh>
      )}
      {/* door surround */}
      <mesh position={[0, doorY + (p.transom !== "none" ? 0.9 : 0.3), 0.12]}>
        <boxGeometry args={[p.sidelights ? 7.4 : 4.6, doorH + (p.transom !== "none" ? 2.4 : 1.2), 0.2]} />
        <meshStandardMaterial color={p.trimColor} />
      </mesh>
      {/* door slab */}
      <mesh position={[0, doorY, 0.28]}>
        <boxGeometry args={[3.2, doorH, 0.18]} />
        <meshStandardMaterial color={p.doorColor} roughness={0.6} />
      </mesh>
      {/* sidelights */}
      {p.sidelights && (
        <>
          <mesh position={[-2.4, doorY, 0.26]}>
            <boxGeometry args={[1, doorH - 0.4, 0.12]} />
            <meshStandardMaterial color="#9fbcc8" roughness={0.15} metalness={0.25} />
          </mesh>
          <mesh position={[2.4, doorY, 0.26]}>
            <boxGeometry args={[1, doorH - 0.4, 0.12]} />
            <meshStandardMaterial color="#9fbcc8" roughness={0.15} metalness={0.25} />
          </mesh>
        </>
      )}
      {/* transom */}
      {p.transom === "rectangular" && (
        <mesh position={[0, fnd + doorH + 0.8, 0.26]}>
          <boxGeometry args={[p.sidelights ? 5.6 : 3.2, 1.2, 0.12]} />
          <meshStandardMaterial color="#9fbcc8" roughness={0.15} metalness={0.25} />
        </mesh>
      )}
      {p.transom === "fanlight" && (
        <mesh position={[0, fnd + doorH + 0.15, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2.1, 2.1, 0.12, 24, 1, false, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color="#9fbcc8" roughness={0.15} metalness={0.25} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* portico */}
      {p.portico !== "none" && (
        <group>
          {/* columns */}
          {[-porticoW / 2 + 0.8, porticoW / 2 - 0.8].map((x) => (
            <mesh key={x} position={[x, fnd + (porticoTop - fnd) / 2, porticoD - 1]} castShadow>
              <cylinderGeometry args={[0.42, 0.5, porticoTop - fnd, 16]} />
              <meshStandardMaterial color={p.trimColor} />
            </mesh>
          ))}
          {/* entablature */}
          <mesh position={[0, porticoTop + 0.5, porticoD / 2 - 0.6]} castShadow>
            <boxGeometry args={[porticoW + 1, 1, porticoD + 1]} />
            <meshStandardMaterial color={p.trimColor} />
          </mesh>
          {p.portico === "gable" && (
            <mesh
              geometry={gableGeom}
              position={[0, porticoTop + 1, porticoD / 2 - 0.6]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <meshStandardMaterial color={p.roofColor} flatShading />
            </mesh>
          )}
          {p.portico === "hip" && (
            <mesh geometry={hipGeom} position={[0, porticoTop + 1, porticoD / 2 - 0.6]} castShadow>
              <meshStandardMaterial color={p.roofColor} flatShading />
            </mesh>
          )}
          {p.portico === "rounded" && (
            <mesh position={[0, porticoTop + 1, porticoD / 2 - 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry
                args={[(porticoD + 1) / 2, (porticoD + 1) / 2, porticoW + 1, 24, 1, false, 0, Math.PI]}
              />
              <meshStandardMaterial color={p.roofColor} side={THREE.DoubleSide} flatShading />
            </mesh>
          )}
          {p.portico === "flat" && (
            <mesh position={[0, porticoTop + 1.15, porticoD / 2 - 0.6]} castShadow>
              <boxGeometry args={[porticoW + 1.4, 0.35, porticoD + 1.4]} />
              <meshStandardMaterial color={p.roofColor} />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}

function FullWidthPorch({ p, fnd, frontZ }: { p: HouseParams; fnd: number; frontZ: number }) {
  const porchD = 10;
  const roofY = fnd + p.firstFloorFt + 1.5;
  const shedGeom = useMemo(() => shedPrism(p.widthFt + 2, porchD + 1.5, 2.4), [p.widthFt]);
  const colXs = frontBayXs(p);
  return (
    <group position={[0, 0, frontZ]}>
      <mesh position={[0, Math.max(fnd, 0.5) / 2, porchD / 2]} receiveShadow castShadow>
        <boxGeometry args={[p.widthFt + 2, Math.max(fnd, 0.5), porchD]} />
        <meshStandardMaterial color="#c9c2b2" />
      </mesh>
      {colXs.map((x) => (
        <mesh key={x} position={[x, fnd + (roofY - fnd) / 2, porchD - 1]} castShadow>
          <cylinderGeometry args={[0.4, 0.48, roofY - fnd, 14]} />
          <meshStandardMaterial color={p.trimColor} />
        </mesh>
      ))}
      <mesh geometry={shedGeom} position={[0, roofY, porchD / 2 - 0.5]} castShadow>
        <meshStandardMaterial color={p.roofColor} flatShading />
      </mesh>
    </group>
  );
}

// ─── Garage ─────────────────────────────────────────────────────

function Garage({ p, fnd, frontZ }: { p: HouseParams; fnd: number; frontZ: number }) {
  const gH = p.firstFloorFt + 2;
  const gPitch = 8 / 12;
  const frontLoad = p.garage === "front2";
  const detached = p.garage === "detached2";
  const doorCount = p.garage === "side3" ? 3 : 2;

  // front-load: bay doors face the street (+z); side-load: doors face +x
  const gx = frontLoad ? p.garageWFt : p.garageDFt; // extent along x
  const gz = frontLoad ? p.garageDFt : p.garageWFt; // extent along z
  const cx = p.widthFt / 2 + gx / 2 + (detached ? 8 : 0);
  const cz = frontLoad ? frontZ - gz / 2 : detached ? -p.depthFt / 4 : Math.min(frontZ - gz / 2, 4);

  const ridgeAlongZ = frontLoad || detached;
  const span = ridgeAlongZ ? gx : gz;
  const ridgeLen = (ridgeAlongZ ? gz : gx) + 2 * RAKE;
  const rise = ((span / 2 + OVERHANG) * gPitch);
  const roofGeom = useMemo(
    () =>
      p.roofShape === "hip"
        ? hipPrism(ridgeLen, span + 2 * OVERHANG, rise)
        : gablePrism(ridgeLen, span + 2 * OVERHANG, rise),
    [p.roofShape, ridgeLen, span, rise]
  );
  const endGeom = useMemo(() => gableEndShape(span, (span / 2) * gPitch), [span, gPitch]);

  const doorW = doorCount === 3 ? 8 : 9;
  const faceLen = frontLoad ? gx : gz;
  const doorPositions = Array.from({ length: doorCount }, (_, i) => {
    const spacing = faceLen / doorCount;
    return -faceLen / 2 + spacing * (i + 0.5);
  });

  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, fnd + gH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[gx, gH, gz]} />
        <meshStandardMaterial color={p.facadeColor} />
      </mesh>
      <mesh position={[0, fnd / 2, 0]}>
        <boxGeometry args={[gx + 0.4, fnd, gz + 0.4]} />
        <meshStandardMaterial color={p.foundationColor} />
      </mesh>
      <mesh
        geometry={roofGeom}
        position={[0, fnd + gH, 0]}
        rotation={ridgeAlongZ ? [0, Math.PI / 2, 0] : [0, 0, 0]}
        castShadow
      >
        <meshStandardMaterial color={p.roofColor} flatShading />
      </mesh>
      {p.roofShape !== "hip" &&
        (ridgeAlongZ ? (
          <mesh geometry={endGeom} position={[0, fnd + gH, gz / 2 + 0.05]}>
            <meshStandardMaterial color={p.facadeColor} side={THREE.DoubleSide} />
          </mesh>
        ) : (
          <mesh geometry={endGeom} position={[gx / 2 + 0.05, fnd + gH, 0]} rotation={[0, Math.PI / 2, 0]}>
            <meshStandardMaterial color={p.facadeColor} side={THREE.DoubleSide} />
          </mesh>
        ))}
      {/* bay doors */}
      <group
        position={frontLoad ? [0, 0, gz / 2 + 0.08] : [gx / 2 + 0.08, 0, 0]}
        rotation={frontLoad ? [0, 0, 0] : [0, Math.PI / 2, 0]}
      >
        {doorPositions.map((x) => (
          <group key={x} position={[x, fnd + 3.75, 0]}>
            <mesh>
              <boxGeometry args={[doorW + 0.6, 8, 0.12]} />
              <meshStandardMaterial color={p.trimColor} />
            </mesh>
            <mesh position={[0, 0, 0.08]}>
              <boxGeometry args={[doorW, 7.5, 0.1]} />
              <meshStandardMaterial color={p.garageDoorColor} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function Sunroom({ p, fnd }: { p: HouseParams; fnd: number }) {
  const side = p.sunroom === "left" ? -1 : 1;
  // skip if it would collide with a side-load garage on the right
  if (side === 1 && (p.garage === "side2" || p.garage === "side3" || p.garage === "detached2")) {
    return null;
  }
  const h = p.firstFloorFt + 1;
  return (
    <group position={[side * (p.widthFt / 2 + 5), 0, 2]}>
      <mesh position={[0, fnd + h / 2, 0]} castShadow>
        <boxGeometry args={[10, h, 14]} />
        <meshStandardMaterial color="#9fbcc8" roughness={0.15} metalness={0.3} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, fnd + h + 0.2, 0]} castShadow>
        <boxGeometry args={[10.8, 0.4, 14.8]} />
        <meshStandardMaterial color={p.roofColor} />
      </mesh>
      <mesh position={[0, fnd / 2, 0]}>
        <boxGeometry args={[10.4, fnd, 14.4]} />
        <meshStandardMaterial color={p.foundationColor} />
      </mesh>
    </group>
  );
}
