"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BuildStage, HouseParams } from "../../lib/houseParams";
import HouseModel from "./HouseModel";
import { SiteModel, FoundationModel, FramingModel } from "./ConstructionStages";

interface Props {
  params: HouseParams;
  /** Which construction stage to render. Defaults to the finished house. */
  stage?: BuildStage;
  /** Foundation build step (0–4); only used when stage === "foundation". */
  buildStep?: number;
  className?: string;
}

const CAMERA: Record<BuildStage, { position: [number, number, number]; target: [number, number, number]; fog: [number, number] }> = {
  site: { position: [105, 80, 125], target: [0, 0, 0], fog: [320, 700] },
  foundation: { position: [44, 28, 54], target: [0, 0, 0], fog: [200, 420] },
  framing: { position: [56, 34, 68], target: [0, 12, 0], fog: [200, 420] },
  complete: { position: [62, 34, 74], target: [0, 11, 0], fog: [180, 380] },
};

/**
 * Interactive 3D viewer for the parametric colonial. Drag to orbit,
 * scroll to zoom. Rebuilds in real time as quiz answers change, and can
 * render the site, foundation build, and framing stages.
 */
export default function HouseViewer({ params, stage = "complete", buildStep = 4, className }: Props) {
  const cam = CAMERA[stage];
  return (
    <div className={className ?? "w-full h-full"}>
      <Canvas key={stage} shadows dpr={[1, 2]} camera={{ position: cam.position, fov: 33 }}>
        <color attach="background" args={["#e9ece3"]} />
        <fog attach="fog" args={["#e9ece3", cam.fog[0], cam.fog[1]]} />
        <ambientLight intensity={0.45} />
        <hemisphereLight args={["#dfe8f2", "#b8b09a", 0.5]} />
        <directionalLight
          position={[70, 90, 50]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-90}
          shadow-camera-right={90}
          shadow-camera-top={90}
          shadow-camera-bottom={-90}
          shadow-camera-far={300}
          shadow-bias={-0.0004}
        />
        {stage === "site" && <SiteModel p={params} />}
        {stage === "foundation" && <FoundationModel p={params} step={buildStep} />}
        {stage === "framing" && <FramingModel p={params} />}
        {stage === "complete" && <HouseModel params={params} />}
        <OrbitControls
          target={cam.target}
          enableDamping
          maxPolarAngle={Math.PI / 2 - 0.03}
          minDistance={stage === "site" ? 50 : 24}
          maxDistance={stage === "site" ? 420 : 240}
        />
      </Canvas>
    </div>
  );
}
