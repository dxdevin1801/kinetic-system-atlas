import { useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Grid, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FanModel } from "./FanModel";
import { useApp } from "@/store/app";
import { useLab, type ViewPreset } from "@/store/lab";
import { findNode, type PartId } from "@/data/fan";

const VIEWS: Record<ViewPreset, [number, number, number]> = {
  iso: [3.6, 2.0, 4.6],
  front: [0, 0.2, 6],
  side: [6, 0.4, 0.2],
  rear: [-2.2, 1.4, -5.4],
};

interface OrbitLike {
  target: THREE.Vector3;
  update: () => void;
  addEventListener: (e: string, fn: () => void) => void;
  removeEventListener: (e: string, fn: () => void) => void;
}

function CameraRig({ view, nonce }: { view: ViewPreset; nonce: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null;
  const anim = useRef(false);
  const target = useRef(new THREE.Vector3(...VIEWS.iso));
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useEffect(() => {
    target.current.set(...VIEWS[view]);
    anim.current = nonce > 0;
  }, [nonce, view]);

  useEffect(() => {
    if (!controls) return;
    const stop = () => (anim.current = false);
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [controls]);

  useFrame((_, raw) => {
    if (!anim.current) return;
    const k = 1 - Math.exp(-5 * Math.min(raw, 0.05));
    camera.position.lerp(target.current, k);
    controls?.target.lerp(origin, k);
    controls?.update();
    if (camera.position.distanceTo(target.current) < 0.01) anim.current = false;
  });
  return null;
}

function Lights({ shadows }: { shadows: boolean }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={1.6}
        castShadow={shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-3, 1.5, -3]} intensity={6} color="#56D8F5" distance={10} />
      <pointLight position={[3, -1, 2]} intensity={2.5} color="#D6B878" distance={8} />
      <Environment resolution={128}>
        <Lightformer intensity={2.2} position={[0, 5, 2]} scale={[8, 3, 1]} />
        <Lightformer intensity={1.2} color="#8fdcf0" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer intensity={0.9} color="#e6d3a6" position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer intensity={0.6} color="#a99cff" position={[0, -2, -5]} scale={[10, 4, 1]} />
      </Environment>
    </>
  );
}

function themeColors(theme: "dark" | "light") {
  return theme === "light"
    ? { bg: "#e9edf4", grid: "#b7c3d4", section: "#7fa9c4", air: "#0e7f9b", additive: false, highlight: "#0E9BB8" }
    : { bg: "#0a101d", grid: "#1b2840", section: "#24506a", air: "#56D8F5", additive: true, highlight: "#56D8F5" };
}

/** Full interactive 3D Lab scene. */
export function LabScene() {
  const theme = useApp((s) => s.theme);
  const quality = useApp((s) => s.quality);
  const lab = useLab();
  const c = themeColors(theme);
  const hi = quality === "high";

  const selected = useMemo(() => {
    if (lab.selectedNode === "fan") return null;
    const node = findNode(lab.selectedNode);
    return node?.partIds ? new Set<PartId>(node.partIds) : null;
  }, [lab.selectedNode]);

  const onHover = useCallback((id: PartId | null) => useLab.getState().hover(id), []);
  const onSelect = useCallback((id: PartId) => useLab.getState().select(id), []);

  return (
    <Canvas
      shadows={hi}
      dpr={hi ? [1, 2] : 1}
      camera={{ position: VIEWS.iso, fov: 38, near: 0.1, far: 60 }}
      gl={{ antialias: true }}
      onPointerMissed={() => useLab.getState().hover(null)}
    >
      <color attach="background" args={[c.bg]} />
      <fog attach="fog" args={[c.bg, 9, 22]} />
      <Lights shadows={hi} />
      <FanModel
        exploded={lab.exploded}
        rpm={lab.rpm}
        spinning={lab.spinning}
        airflow={lab.airflow}
        selected={selected}
        hovered={lab.hovered}
        highlight={c.highlight}
        airColor={c.air}
        additiveAir={c.additive}
        particleCount={hi ? 900 : 450}
        interactive
        onHover={onHover}
        onSelect={onSelect}
      />
      <Grid
        position={[0, -1.42, 0]}
        args={[30, 30]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor={c.grid}
        sectionSize={1.5}
        sectionThickness={1}
        sectionColor={c.section}
        fadeDistance={16}
        fadeStrength={1.5}
        infiniteGrid
      />
      <ContactShadows position={[0, -1.41, 0]} opacity={theme === "light" ? 0.35 : 0.6} scale={8} blur={2.4} far={3} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={2.4}
        maxDistance={12}
        enablePan
      />
      <CameraRig view={lab.view} nonce={lab.viewNonce} />
    </Canvas>
  );
}

/** Lightweight auto-rotating preview used on the dashboard. */
export function PreviewScene() {
  const theme = useApp((s) => s.theme);
  const c = themeColors(theme);
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [3.4, 1.4, 4.4], fov: 36 }} gl={{ antialias: true, alpha: true }}>
      <Lights shadows={false} />
      <group rotation={[0, -0.3, 0]}>
        <FanModel
          exploded={0}
          rpm={2400}
          spinning
          airflow
          selected={null}
          hovered={null}
          highlight={c.highlight}
          airColor={c.air}
          additiveAir={c.additive}
          particleCount={360}
        />
      </group>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} enableDamping />
    </Canvas>
  );
}

export default function FanScene({ variant }: { variant: "lab" | "preview" }) {
  return variant === "lab" ? <LabScene /> : <PreviewScene />;
}
