"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HouseParams } from "../../lib/houseParams";
import HouseModel from "./HouseModel";

interface Props {
  params: HouseParams;
  className?: string;
}

/**
 * Interactive 3D viewer for the parametric colonial. Drag to orbit,
 * scroll to zoom. Rebuilds in real time as quiz answers change.
 */
export default function HouseViewer({ params, className }: Props) {
  return (
    <div className={className ?? "w-full h-full"}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [62, 34, 74], fov: 33 }}>
        <color attach="background" args={["#e9ece3"]} />
        <fog attach="fog" args={["#e9ece3", 180, 380]} />
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
        <HouseModel params={params} />
        <OrbitControls
          target={[0, 11, 0]}
          enableDamping
          maxPolarAngle={Math.PI / 2 - 0.03}
          minDistance={28}
          maxDistance={240}
        />
      </Canvas>
    </div>
  );
}
