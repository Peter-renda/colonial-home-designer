"use client";

import { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { QuizAnswers } from "../../types/quiz";

/**
 * Interior 3D room models for the "rooms" group. As the user makes
 * selections for a given room (kitchen cabinets, bath fixtures, flooring,
 * trim, staircase, …) the matching room rebuilds here in the 3D Model tab.
 *
 * Feet, y up. Rooms are an open corner — back wall at −z, left wall at −x —
 * so the camera looks in from the +x/+z side.
 */

const WALL = "#efe9dd";
const CEILING = "#f7f5ef";
const TRIM = "#f4f1e8";
const GLASS = "#cfe4f0";

const ROOM_W = 15;
const ROOM_D = 13;

function ans(answers: QuizAnswers, id: string): string {
  const v = answers[id];
  if (Array.isArray(v)) return v.join(", ");
  return (v as string) ?? "";
}

function ceilingFt(v: string): number {
  if (v.includes("10")) return 10;
  if (v.includes("8")) return 8;
  return 9;
}

// ── material → colour helpers (mirror the 2D sketches) ──────────
function floorColor(mat: string): string {
  if (mat.includes("Carpet")) return "#c8b8a4";
  if (mat.includes("Checkered") || mat.includes("marble")) return "#e7e2d6";
  if (mat.includes("Hexagon")) return "#dcdcd8";
  if (mat.includes("Basketweave")) return "#e0ddcf";
  if (mat.includes("LVP")) return "#b98e5e";
  if (mat.includes("Engineered")) return "#a8794c";
  if (!mat) return "#a8794e";
  return "#a8794e"; // oak
}

function cabinetColor(mat: string): string {
  if (mat === "Cherry") return "#7a3f28";
  if (mat === "Poplar") return "#d8c5a4";
  return "#e8e2d2"; // MDF / painted
}

function stoneColor(mat: string): string {
  if (mat.includes("Soapstone")) return "#3a3a3a";
  if (mat.includes("Taj")) return "#d8c8a0";
  if (mat.includes("Butcher")) return "#a8794e";
  if (mat.includes("danby")) return "#e9e6dd";
  return "#ece6dc"; // marble
}

function metalColor(level: string): string {
  return level.includes("brass") ? "#c79b3a" : level.includes("bronze") ? "#6b4f33" : "#9a8f80";
}

// ── shared shell ────────────────────────────────────────────────
function RoomShell({
  H,
  floor,
  children,
}: {
  H: number;
  floor: string;
  children?: ReactNode;
}) {
  const W = ROOM_W;
  const D = ROOM_D;
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={floor} />
      </mesh>
      {/* back + left walls */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <boxGeometry args={[W, H, 0.3]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.3, H, D]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={CEILING} />
      </mesh>
      {/* baseboards */}
      <mesh position={[0, 0.3, -D / 2 + 0.17]}>
        <boxGeometry args={[W, 0.6, 0.08]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      <mesh position={[-W / 2 + 0.17, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.6, D]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      {children}
    </group>
  );
}

function WindowOnBack({ H }: { H: number }) {
  const D = ROOM_D;
  return (
    <group position={[2.5, H * 0.55, -D / 2 + 0.16]}>
      <mesh>
        <boxGeometry args={[3.4, 4, 0.12]} />
        <meshStandardMaterial color={GLASS} emissive="#bcd8e8" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[3.7, 0.18, 0.06]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.16, 4, 0.06]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
    </group>
  );
}

// ── FLOORING ────────────────────────────────────────────────────
function FloorRoom({ answers, H, floor }: { answers: QuizAnswers; H: number; floor: "first" | "second" }) {
  const mat = ans(answers, floor === "first" ? "firstFloorFlooring" : "bedroomFlooring");
  const stair = ans(answers, floor === "first" ? "firstFloorStaircaseFlooring" : "secondFloorStaircaseFlooring");
  return (
    <RoomShell H={H} floor={floorColor(mat)}>
      <WindowOnBack H={H} />
      {/* an area rug to read the floor against, tinted by the stair runner choice */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.5, 0.02, 1.5]}>
        <planeGeometry args={[7, 5]} />
        <meshStandardMaterial color={stair.includes("runner") || stair.includes("Carpet") ? "#b9897e" : "#cfc3aa"} />
      </mesh>
    </RoomShell>
  );
}

// ── TRIM ────────────────────────────────────────────────────────
function TrimRoom({ answers, H }: { answers: QuizAnswers; H: number }) {
  const W = ROOM_W;
  const D = ROOM_D;
  const hasCrown = ans(answers, "crownMolding") !== "" || ans(answers, "kitchenTrimByRoom").includes("Crown");
  const hasWainscot =
    ans(answers, "diningRoomTrimDetail").includes("paneling") ||
    ans(answers, "kitchenTrimByRoom").includes("Wainscoting") ||
    ans(answers, "livingRoomTrimByRoom").includes("Wainscoting");
  const hasChair = ans(answers, "diningRoomTrimDetail").includes("Chair") || hasWainscot;
  return (
    <RoomShell H={H} floor={floorColor(ans(answers, "firstFloorFlooring"))}>
      {/* crown molding */}
      {hasCrown && (
        <>
          <mesh position={[0, H - 0.35, -D / 2 + 0.2]}>
            <boxGeometry args={[W, 0.7, 0.18]} />
            <meshStandardMaterial color={TRIM} />
          </mesh>
          <mesh position={[-W / 2 + 0.2, H - 0.35, 0]}>
            <boxGeometry args={[0.18, 0.7, D]} />
            <meshStandardMaterial color={TRIM} />
          </mesh>
        </>
      )}
      {/* wainscoting on the back wall */}
      {hasWainscot && (
        <mesh position={[0, 1.6, -D / 2 + 0.2]}>
          <boxGeometry args={[W - 0.6, 3.0, 0.1]} />
          <meshStandardMaterial color="#f0ead8" />
        </mesh>
      )}
      {/* chair rail */}
      {hasChair && (
        <mesh position={[0, 3.1, -D / 2 + 0.24]}>
          <boxGeometry args={[W, 0.18, 0.1]} />
          <meshStandardMaterial color={TRIM} />
        </mesh>
      )}
      <WindowOnBack H={H} />
    </RoomShell>
  );
}

// ── BUILT-INS ───────────────────────────────────────────────────
function BuiltInsRoom({ answers, H }: { answers: QuizAnswers; H: number }) {
  const D = ROOM_D;
  const has = ans(answers, "livingRoomBuiltIns") === "Yes" || ans(answers, "hallwayBuiltIns") === "Yes";
  const shelves = [1.2, 2.6, 4.0, 5.4];
  return (
    <RoomShell H={H} floor={floorColor(ans(answers, "firstFloorFlooring"))}>
      {has && (
        <group position={[-2, 0, -D / 2 + 0.5]}>
          {/* carcass */}
          <mesh position={[0, 3.2, 0]} castShadow>
            <boxGeometry args={[8, 6.4, 0.9]} />
            <meshStandardMaterial color="#e8d8b8" />
          </mesh>
          {/* shelves */}
          {shelves.map((y) => (
            <mesh key={y} position={[0, y, 0.25]}>
              <boxGeometry args={[7.6, 0.12, 0.7]} />
              <meshStandardMaterial color="#d8c5a4" />
            </mesh>
          ))}
          {/* dividers */}
          {[-2.6, 0, 2.6].map((x) => (
            <mesh key={x} position={[x, 3.2, 0.25]}>
              <boxGeometry args={[0.12, 6.0, 0.7]} />
              <meshStandardMaterial color="#d8c5a4" />
            </mesh>
          ))}
        </group>
      )}
      <WindowOnBack H={H} />
    </RoomShell>
  );
}

// ── LIGHTING ────────────────────────────────────────────────────
function LightingRoom({ answers, H }: { answers: QuizAnswers; H: number }) {
  const D = ROOM_D;
  return (
    <RoomShell H={H} floor={floorColor(ans(answers, "firstFloorFlooring"))}>
      {/* recessed cans */}
      {[-4, 0, 4].map((x) =>
        [-3, 1].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, H - 0.08, z]}>
            <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
            <meshStandardMaterial color="#fff6d8" emissive="#f4d27a" emissiveIntensity={0.8} />
          </mesh>
        ))
      )}
      {/* central chandelier */}
      <group position={[0, H - 1.6, 0]}>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.6, 8]} />
          <meshStandardMaterial color="#6b5a3a" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#c79b3a" emissive="#f4d27a" emissiveIntensity={0.6} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.9, 0.1, Math.sin(a) * 0.9]}>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial color="#fff3c8" emissive="#f4d27a" emissiveIntensity={1} />
            </mesh>
          );
        })}
      </group>
      {/* wall sconces */}
      {[-3, 3].map((y) => (
        <mesh key={y} position={[-ROOM_W / 2 + 0.4, 5, y]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color="#fff3c8" emissive="#f4d27a" emissiveIntensity={0.9} />
        </mesh>
      ))}
      <WindowOnBack H={H} />
      <pointLight position={[0, H - 1.5, 0]} intensity={18} distance={26} color="#ffe6b0" />
    </RoomShell>
  );
}

// ── INTERIOR DOOR ───────────────────────────────────────────────
function DoorRoom({ answers, H }: { answers: QuizAnswers; H: number }) {
  const D = ROOM_D;
  const hardware = ans(answers, "doorHardware");
  const knob = metalColor(hardware);
  const panels: [number, number, number, number][] = [
    [-0.75, 5.4, 1.4, 1.1],
    [0.75, 5.4, 1.4, 1.1],
    [-0.75, 3.9, 1.4, 1.1],
    [0.75, 3.9, 1.4, 1.1],
    [-0.75, 1.9, 1.4, 2.2],
    [0.75, 1.9, 1.4, 2.2],
  ];
  return (
    <RoomShell H={H} floor={floorColor(ans(answers, "firstFloorFlooring"))}>
      <group position={[0, 0, -D / 2 + 0.28]}>
        {/* casing */}
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[4.2, 7.4, 0.16]} />
          <meshStandardMaterial color={TRIM} />
        </mesh>
        {/* slab */}
        <mesh position={[0, 3.45, 0.12]} castShadow>
          <boxGeometry args={[3.4, 6.9, 0.16]} />
          <meshStandardMaterial color="#f0ece3" />
        </mesh>
        {/* panels (recessed) */}
        {panels.map(([x, y, w, h]) => (
          <mesh key={`${x}-${y}`} position={[x, y, 0.21]}>
            <boxGeometry args={[w, h, 0.05]} />
            <meshStandardMaterial color="#e7e0d2" />
          </mesh>
        ))}
        {/* knob */}
        <mesh position={[1.4, 3.4, 0.26]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color={knob} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </RoomShell>
  );
}

// ── KITCHEN ─────────────────────────────────────────────────────
function KitchenRoom({ answers, H }: { answers: QuizAnswers; H: number }) {
  const W = ROOM_W;
  const D = ROOM_D;
  const cab = cabinetColor(ans(answers, "kitchenCabinetMaterial"));
  const counter = stoneColor(ans(answers, "kitchenCountertopMaterial"));
  const island = stoneColor(ans(answers, "islandCountertops"));
  const backsplash = ans(answers, "kitchenBacksplash");
  const builtInFridge = ans(answers, "builtInFridgeFreezer") === "Yes" || ans(answers, "fridge") === "Built-in separated";

  return (
    <RoomShell H={H} floor={floorColor(ans(answers, "firstFloorFlooring") || "Oak")}>
      {/* back-wall base cabinets + counter */}
      <group position={[0, 0, -D / 2 + 1.2]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[W - 1, 3, 2]} />
          <meshStandardMaterial color={cab} />
        </mesh>
        <mesh position={[0, 3.1, 0]} castShadow>
          <boxGeometry args={[W - 0.8, 0.2, 2.1]} />
          <meshStandardMaterial color={counter} />
        </mesh>
        {/* upper cabinets */}
        <mesh position={[-3.5, 5.7, -0.4]} castShadow>
          <boxGeometry args={[6, 2.4, 1.2]} />
          <meshStandardMaterial color={cab} />
        </mesh>
        <mesh position={[5, 5.7, -0.4]} castShadow>
          <boxGeometry args={[3.5, 2.4, 1.2]} />
          <meshStandardMaterial color={cab} />
        </mesh>
        {/* backsplash */}
        {backsplash && (
          <mesh position={[0, 4.3, -0.92]}>
            <boxGeometry args={[W - 1, 1.8, 0.08]} />
            <meshStandardMaterial color={backsplash.includes("marble") ? "#e9e4d8" : "#dfe3e4"} />
          </mesh>
        )}
        {/* range */}
        <mesh position={[0.5, 3.25, 0.2]}>
          <boxGeometry args={[2.4, 0.15, 1.9]} />
          <meshStandardMaterial color="#2c2c2c" />
        </mesh>
        {/* range hood */}
        <mesh position={[0.5, 6.2, -0.2]}>
          <boxGeometry args={[2.6, 1.2, 1.4]} />
          <meshStandardMaterial color={cab} />
        </mesh>
      </group>

      {/* left-wall cabinets / fridge */}
      <group position={[-W / 2 + 1.2, 0, 1.5]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[2, 3, 6]} />
          <meshStandardMaterial color={cab} />
        </mesh>
        <mesh position={[0, 3.1, 0]} castShadow>
          <boxGeometry args={[2.1, 0.2, 6.2]} />
          <meshStandardMaterial color={counter} />
        </mesh>
        {/* fridge */}
        <mesh position={[0, 3.5, -3.6]} castShadow>
          <boxGeometry args={[2, 7, 2.4]} />
          <meshStandardMaterial color={builtInFridge ? cab : "#cfd3d2"} metalness={builtInFridge ? 0 : 0.4} roughness={0.5} />
        </mesh>
      </group>

      {/* island */}
      <group position={[1.5, 0, 2.5]}>
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[5, 3.2, 2.8]} />
          <meshStandardMaterial color={cab} />
        </mesh>
        <mesh position={[0, 3.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.4, 0.22, 3.2]} />
          <meshStandardMaterial color={island} />
        </mesh>
      </group>
      <WindowOnBack H={H} />
    </RoomShell>
  );
}

// ── BATH ────────────────────────────────────────────────────────
function BathRoom({ answers, H }: { answers: QuizAnswers; H: number }) {
  const W = ROOM_W;
  const D = ROOM_D;
  const counter = stoneColor(ans(answers, "primaryBathCountertopMaterial") || "marble");
  const floor = floorColor(ans(answers, "primaryBathFlooring") || "Checkered marble");
  return (
    <RoomShell H={H} floor={floor}>
      {/* vanity on the left wall */}
      <group position={[-W / 2 + 1.1, 0, 2]}>
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[1.8, 2.8, 5]} />
          <meshStandardMaterial color="#e8e2d2" />
        </mesh>
        <mesh position={[0, 2.95, 0]}>
          <boxGeometry args={[1.9, 0.18, 5.2]} />
          <meshStandardMaterial color={counter} />
        </mesh>
        {/* sinks */}
        {[-1.2, 1.2].map((z) => (
          <mesh key={z} position={[0.1, 3.06, z]}>
            <cylinderGeometry args={[0.5, 0.4, 0.16, 18]} />
            <meshStandardMaterial color="#fbfaf6" />
          </mesh>
        ))}
        {/* mirror */}
        <mesh position={[-0.85, 5.2, 0]}>
          <boxGeometry args={[0.08, 3, 4.4]} />
          <meshStandardMaterial color="#cdd6da" metalness={0.5} roughness={0.2} />
        </mesh>
      </group>

      {/* tub on the back wall */}
      <mesh position={[3, 1.1, -D / 2 + 1.6]} castShadow>
        <boxGeometry args={[6, 2, 2.6]} />
        <meshStandardMaterial color="#f3f1ea" />
      </mesh>
      <mesh position={[3, 1.5, -D / 2 + 1.6]}>
        <boxGeometry args={[5.4, 1.2, 2.0]} />
        <meshStandardMaterial color="#e6eef0" />
      </mesh>

      {/* glass shower in the far corner */}
      <group position={[6, 0, 3]}>
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[3, 7, 3]} />
          <meshStandardMaterial color={GLASS} transparent opacity={0.28} />
        </mesh>
        <mesh position={[0, 6.6, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
          <meshStandardMaterial color="#cdd6da" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* toilet */}
      <group position={[-2, 0, -D / 2 + 1.4]}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[1.4, 1.4, 2]} />
          <meshStandardMaterial color="#fbfaf6" />
        </mesh>
        <mesh position={[0, 1.9, -0.7]}>
          <boxGeometry args={[1.4, 1.6, 0.5]} />
          <meshStandardMaterial color="#fbfaf6" />
        </mesh>
      </group>
      <WindowOnBack H={H} />
    </RoomShell>
  );
}

// ── STAIRCASE ───────────────────────────────────────────────────
function StaircaseRoom({ answers, H }: { answers: QuizAnswers; H: number }) {
  const D = ROOM_D;
  const baluster = ans(answers, "balusters");
  const rounded = ans(answers, "roundedStartingStep") === "Yes";
  const tread = ans(answers, "firstFloorStaircaseFlooring");
  const treadColor = tread.includes("Carpet") ? "#b6a48c" : tread.includes("runner") ? "#9a6f5a" : "#c8a878";
  const rail = "#7a3f28";
  const n = 11;
  const rise = 0.66;
  const run = 0.92;
  const width = 4;
  const x0 = -2;
  const z0 = D / 2 - 2;

  const steps = [];
  for (let i = 0; i < n; i++) {
    const y = (i + 1) * rise;
    const z = z0 - i * run;
    steps.push(
      <group key={i}>
        {/* tread */}
        <mesh position={[x0, y - 0.06, z]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.12, run + 0.1]} />
          <meshStandardMaterial color={treadColor} />
        </mesh>
        {/* riser */}
        <mesh position={[x0, y - rise / 2, z + run / 2]}>
          <boxGeometry args={[width, rise, 0.08]} />
          <meshStandardMaterial color="#efe9dd" />
        </mesh>
        {/* baluster on the open (−x) side */}
        <mesh position={[x0 - width / 2 + 0.15, y + 1.2, z]} castShadow>
          <boxGeometry args={[0.12, 2.4, baluster.includes("Vase") ? 0.16 : 0.12]} />
          <meshStandardMaterial color="#efe9dd" />
        </mesh>
        {baluster.includes("Vase") && (
          <mesh position={[x0 - width / 2 + 0.15, y + 0.8, z]}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial color="#efe9dd" />
          </mesh>
        )}
      </group>
    );
  }

  // handrail following the baluster tops (rotation about x, box length along z)
  const railLen = Math.hypot(n * run, n * rise);
  const railAngle = Math.atan2(-(n * rise), -(n * run));
  return (
    <RoomShell H={Math.max(H, n * rise + 2)} floor={floorColor(ans(answers, "firstFloorFlooring"))}>
      {steps}
      {/* rounded starting step */}
      {rounded && (
        <mesh position={[x0, rise / 2, z0 + 0.5]} castShadow>
          <cylinderGeometry args={[1.4, 1.4, rise, 24, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={treadColor} />
        </mesh>
      )}
      {/* newel post */}
      <mesh position={[x0 - width / 2 + 0.15, 1.6, z0 + 0.4]} castShadow>
        <boxGeometry args={[0.3, 3.2, 0.3]} />
        <meshStandardMaterial color={rail} />
      </mesh>
      {/* handrail */}
      <mesh
        position={[x0 - width / 2 + 0.15, (n * rise) / 2 + 2.5, z0 - (n * run) / 2]}
        rotation={[railAngle, 0, 0]}
      >
        <boxGeometry args={[0.16, 0.22, railLen]} />
        <meshStandardMaterial color={rail} />
      </mesh>
    </RoomShell>
  );
}

// ── scene router + viewer ───────────────────────────────────────
function RoomScene({ sketchKey, answers, H }: { sketchKey: string; answers: QuizAnswers; H: number }) {
  switch (sketchKey) {
    case "kitchen":
      return <KitchenRoom answers={answers} H={H} />;
    case "bath":
      return <BathRoom answers={answers} H={H} />;
    case "staircase":
      return <StaircaseRoom answers={answers} H={H} />;
    case "interior-door":
      return <DoorRoom answers={answers} H={H} />;
    case "trim":
    case "trim-by-room":
      return <TrimRoom answers={answers} H={H} />;
    case "built-ins":
      return <BuiltInsRoom answers={answers} H={H} />;
    case "lighting":
      return <LightingRoom answers={answers} H={H} />;
    case "second-floor":
      return <FloorRoom answers={answers} H={H} floor="second" />;
    default:
      return <FloorRoom answers={answers} H={H} floor="first" />;
  }
}

const ROOM_CAM: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
  "interior-door": { pos: [0.5, 4, 11], target: [0, 3.6, -3] },
  staircase: { pos: [11, 8, 12], target: [-1, 4.5, 0] },
  default: { pos: [12, 8.5, 12.5], target: [-0.5, 3.2, -0.5] },
};

export default function RoomViewer({ sketchKey, answers }: { sketchKey: string; answers: QuizAnswers }) {
  const H = ceilingFt(ans(answers, "firstFloorCeilingHeight"));
  const cam = ROOM_CAM[sketchKey] ?? ROOM_CAM.default;
  return (
    <Canvas key={sketchKey} shadows dpr={[1, 2]} camera={{ position: cam.pos, fov: 38 }}>
      <color attach="background" args={["#eceee8"]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#f0efe8", "#cfc8b6", 0.55]} />
      <directionalLight
        position={[10, 14, 8]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <RoomScene sketchKey={sketchKey} answers={answers} H={H} />
      <OrbitControls
        target={cam.target}
        enableDamping
        minDistance={6}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2 - 0.02}
      />
    </Canvas>
  );
}
