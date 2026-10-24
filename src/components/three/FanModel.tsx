import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { PartId } from "@/data/fan";

/* ------------------------------------------------------------------ */
/* Context + materials                                                 */
/* ------------------------------------------------------------------ */

interface FanCtxValue {
  selected: Set<PartId> | null;
  hovered: PartId | null;
  highlight: string;
  interactive: boolean;
  onHover?: (id: PartId | null) => void;
  onSelect?: (id: PartId) => void;
}

const FanCtx = createContext<FanCtxValue>({
  selected: null,
  hovered: null,
  highlight: "#56D8F5",
  interactive: false,
});

interface MatSpec {
  color: string;
  metalness?: number;
  roughness?: number;
  side?: THREE.Side;
  emissive?: string;
  emissiveIntensity?: number;
}

function usePartMaterial(id: PartId, spec: MatSpec) {
  const ctx = useContext(FanCtx);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: spec.color,
        metalness: spec.metalness ?? 0.5,
        roughness: spec.roughness ?? 0.4,
        side: spec.side ?? THREE.FrontSide,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const isSel = ctx.selected?.has(id) ?? false;
    const isHov = ctx.hovered === id;
    const dim = !!ctx.selected && !isSel;
    if (isSel || isHov) {
      mat.emissive.set(ctx.highlight);
      mat.emissiveIntensity = isSel ? 0.5 : 0.28;
    } else if (spec.emissive) {
      mat.emissive.set(spec.emissive);
      mat.emissiveIntensity = spec.emissiveIntensity ?? 0.2;
    } else {
      mat.emissive.set("#000000");
      mat.emissiveIntensity = 0;
    }
    mat.transparent = dim;
    mat.opacity = dim ? 0.22 : 1;
    mat.depthWrite = !dim;
    mat.needsUpdate = true;
  }, [ctx.selected, ctx.hovered, ctx.highlight, id, mat, spec.emissive, spec.emissiveIntensity]);

  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

/* ------------------------------------------------------------------ */
/* Geometry builders                                                   */
/* ------------------------------------------------------------------ */

function bladeGeometry() {
  const nr = 16;
  const nc = 10;
  const r0 = 0.37;
  const r1 = 1.0;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= nr; i++) {
    const t = i / nr;
    const r = r0 + (r1 - r0) * t;
    const tipRound = t > 0.85 ? Math.sqrt(1 - ((t - 0.85) / 0.15) ** 2 * 0.7) : 1;
    const chord = (0.34 + 0.2 * t) * tipRound;
    const pitch = THREE.MathUtils.degToRad(50 - 22 * t);
    const sweep = 0.38 * t * t;
    for (let j = 0; j <= nc; j++) {
      const u = j / nc;
      const s = (u - 0.5) * chord;
      const camber = 0.035 * (1 - (2 * u - 1) ** 2) * (chord / 0.4);
      const tang = s * Math.cos(pitch) - camber * Math.sin(pitch);
      const ax = s * Math.sin(pitch) + camber * Math.cos(pitch);
      const theta = sweep + tang / r;
      pos.push(r * Math.cos(theta), r * Math.sin(theta), ax);
    }
  }
  for (let i = 0; i < nr; i++) {
    for (let j = 0; j < nc; j++) {
      const a = i * (nc + 1) + j;
      const b = a + nc + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function ringGeometry(rIn: number, rOut: number, depth: number, segments = 64) {
  const pts = [
    new THREE.Vector2(rIn, -depth / 2),
    new THREE.Vector2(rOut, -depth / 2),
    new THREE.Vector2(rOut, depth / 2),
    new THREE.Vector2(rIn, depth / 2),
    new THREE.Vector2(rIn, -depth / 2),
  ];
  const g = new THREE.LatheGeometry(pts, segments);
  g.rotateX(Math.PI / 2);
  return g;
}

function shroudGeometry() {
  const pts = [
    [1.045, -0.3],
    [1.045, 0.05],
    [1.06, 0.14],
    [1.1, 0.2],
    [1.18, 0.235],
    [1.26, 0.24],
    [1.26, 0.2],
    [1.18, 0.17],
    [1.14, 0.1],
    [1.14, -0.3],
    [1.12, -0.33],
    [1.06, -0.33],
    [1.045, -0.3],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 96);
  g.rotateX(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/* Part wrapper                                                        */
/* ------------------------------------------------------------------ */

function PartGroup({
  id,
  children,
  groupRef,
}: {
  id: PartId;
  children: ReactNode;
  groupRef: (g: THREE.Group | null) => void;
}) {
  const ctx = useContext(FanCtx);
  const handlers = ctx.interactive
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          ctx.onHover?.(id);
          document.body.style.cursor = "pointer";
        },
        onPointerOut: () => {
          ctx.onHover?.(null);
          document.body.style.cursor = "";
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          ctx.onSelect?.(id);
        },
      }
    : {};
  return (
    <group ref={groupRef} {...handlers}>
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Individual parts                                                    */
/* ------------------------------------------------------------------ */

const AXIS_ROT: [number, number, number] = [Math.PI / 2, 0, 0];

function Shroud() {
  const mat = usePartMaterial("shroud", { color: "#2c3646", metalness: 0.75, roughness: 0.32 });
  const geo = useMemo(shroudGeometry, []);
  return (
    <>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {[0, 1, 2, 3].map((i) => {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        return (
          <mesh
            key={i}
            material={mat}
            position={[Math.cos(a) * 1.2, Math.sin(a) * 1.2, -0.27]}
            rotation={[0, 0, a]}
            castShadow
          >
            <boxGeometry args={[0.24, 0.22, 0.07]} />
          </mesh>
        );
      })}
    </>
  );
}

function Struts() {
  const mat = usePartMaterial("struts", { color: "#323d4f", metalness: 0.7, roughness: 0.38 });
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        return (
          <mesh
            key={i}
            material={mat}
            position={[Math.cos(a) * 0.69, Math.sin(a) * 0.69, -0.3]}
            rotation={[0, 0, a]}
            castShadow
          >
            <boxGeometry args={[0.76, 0.05, 0.16]} />
          </mesh>
        );
      })}
    </>
  );
}

function Blades() {
  const mat = usePartMaterial("blades", {
    color: "#9aa6b8",
    metalness: 0.65,
    roughness: 0.28,
    side: THREE.DoubleSide,
  });
  const geo = useMemo(bladeGeometry, []);
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          geometry={geo}
          material={mat}
          rotation={[0, 0, (i * 2 * Math.PI) / 7]}
          position={[0, 0, 0.04]}
          castShadow
        />
      ))}
    </>
  );
}

function Hub() {
  const body = usePartMaterial("hub", { color: "#1c2433", metalness: 0.55, roughness: 0.35 });
  const trim = usePartMaterial("hub", { color: "#D6B878", metalness: 0.9, roughness: 0.22 });
  return (
    <>
      <mesh material={body} rotation={AXIS_ROT} position={[0, 0, 0.03]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.42, 64]} />
      </mesh>
      <mesh material={body} rotation={AXIS_ROT} position={[0, 0, 0.27]} castShadow>
        <cylinderGeometry args={[0.27, 0.36, 0.06, 64]} />
      </mesh>
      <mesh material={trim} position={[0, 0, 0.3]}>
        <torusGeometry args={[0.27, 0.012, 12, 64]} />
      </mesh>
      <mesh material={trim} rotation={AXIS_ROT} position={[0, 0, 0.305]}>
        <cylinderGeometry args={[0.07, 0.07, 0.01, 32]} />
      </mesh>
    </>
  );
}

function Magnet() {
  const cup = usePartMaterial("magnet", { color: "#454e5e", metalness: 0.85, roughness: 0.3 });
  const pole = usePartMaterial("magnet", { color: "#6b5aa8", metalness: 0.4, roughness: 0.5 });
  const geo = useMemo(() => ringGeometry(0.27, 0.32, 0.3), []);
  return (
    <>
      <mesh geometry={geo} material={cup} castShadow />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 14;
        return (
          <mesh key={i} material={pole} position={[Math.cos(a) * 0.255, Math.sin(a) * 0.255, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.025, 0.1, 0.28]} />
          </mesh>
        );
      })}
    </>
  );
}

function Stator() {
  const core = usePartMaterial("stator", { color: "#5a6170", metalness: 0.8, roughness: 0.35 });
  const copper = usePartMaterial("stator", { color: "#c07a45", metalness: 0.9, roughness: 0.28 });
  return (
    <>
      <mesh material={core} rotation={AXIS_ROT} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.26, 48]} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 12;
        return (
          <mesh key={i} material={copper} position={[Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0]} rotation={[0, 0, a]} castShadow>
            <boxGeometry args={[0.07, 0.075, 0.24]} />
          </mesh>
        );
      })}
    </>
  );
}

function Shaft() {
  const mat = usePartMaterial("shaft", { color: "#d9dee7", metalness: 1, roughness: 0.14 });
  return (
    <mesh material={mat} rotation={AXIS_ROT} position={[0, 0, -0.05]} castShadow>
      <cylinderGeometry args={[0.04, 0.04, 1.0, 24]} />
    </mesh>
  );
}

function Bearing({ id, z }: { id: PartId; z: number }) {
  const outer = usePartMaterial(id, { color: "#b4bcc8", metalness: 0.95, roughness: 0.2 });
  const geo = useMemo(() => ringGeometry(0.045, 0.1, 0.07, 48), []);
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={geo} material={outer} castShadow />
      <mesh material={outer}>
        <torusGeometry args={[0.072, 0.018, 10, 32]} />
      </mesh>
    </group>
  );
}

function Housing() {
  const mat = usePartMaterial("housing", { color: "#38435a", metalness: 0.7, roughness: 0.36 });
  return (
    <>
      <mesh material={mat} rotation={AXIS_ROT} position={[0, 0, -0.42]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 48]} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 12;
        return (
          <mesh key={i} material={mat} position={[Math.cos(a) * 0.32, Math.sin(a) * 0.32, -0.42]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.06, 0.015, 0.18]} />
          </mesh>
        );
      })}
    </>
  );
}

function Pcb() {
  const board = usePartMaterial("pcb", { color: "#12343a", metalness: 0.2, roughness: 0.6 });
  const gold = usePartMaterial("pcb", { color: "#D6B878", metalness: 0.9, roughness: 0.25 });
  const chip = usePartMaterial("pcb", { color: "#0d1119", metalness: 0.3, roughness: 0.5 });
  return (
    <group position={[0, 0, -0.58]}>
      <mesh material={board} rotation={AXIS_ROT} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.025, 48]} />
      </mesh>
      <mesh material={gold} position={[0, 0, -0.014]}>
        <torusGeometry args={[0.22, 0.006, 8, 48]} />
      </mesh>
      {[
        [-0.08, 0.06, 0.1, 0.1],
        [0.09, 0.05, 0.06, 0.08],
        [0, -0.1, 0.14, 0.05],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} material={chip} position={[x, y, -0.025]}>
          <boxGeometry args={[w, h, 0.025]} />
        </mesh>
      ))}
    </group>
  );
}

function Hall() {
  const mat = usePartMaterial("hall", {
    color: "#1a2030",
    metalness: 0.3,
    roughness: 0.4,
    emissive: "#9B8CFF",
    emissiveIntensity: 0.35,
  });
  return (
    <group position={[0, 0, -0.555]}>
      {[0, 1, 2].map((i) => {
        const a = (i * 2 * Math.PI) / 3 + Math.PI / 2;
        return (
          <mesh key={i} material={mat} position={[Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0]}>
            <boxGeometry args={[0.04, 0.03, 0.025]} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Airflow particles                                                   */
/* ------------------------------------------------------------------ */

function Airflow({
  speedRef,
  explodeRef,
  count,
  color,
  additive,
  visible,
}: {
  speedRef: React.MutableRefObject<number>;
  explodeRef: React.MutableRefObject<number>;
  count: number;
  color: string;
  additive: boolean;
  visible: boolean;
}) {
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const fadeRef = useRef(visible ? 1 : 0);
  const base = useMemo(() => new THREE.Color(color), [color]);
  const data = useMemo(() => {
    const r = new Float32Array(count);
    const th = new Float32Array(count);
    const z = new Float32Array(count);
    const sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      r[i] = 0.4 + Math.sqrt(Math.random()) * 0.58;
      th[i] = Math.random() * Math.PI * 2;
      z[i] = -3.2 + Math.random() * 5.8;
      sp[i] = 0.8 + Math.random() * 0.4;
    }
    return { r, th, z, sp, pos: new Float32Array(count * 3), col: new Float32Array(count * 3) };
  }, [count]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const g = geoRef.current;
    if (!g) return;
    const target = visible ? 1 : 0;
    fadeRef.current += (target - fadeRef.current) * (1 - Math.exp(-4 * dt));
    const speed = speedRef.current; // normalised, 1 = 3000 rpm
    const fadeAll = fadeRef.current * Math.max(0, 1 - explodeRef.current * 1.6);
    const { r, th, z, sp, pos, col } = data;
    for (let i = 0; i < count; i++) {
      z[i] -= (0.25 + 2.1 * speed) * sp[i] * dt;
      if (z[i] < -0.05) th[i] += speed * 1.4 * dt * (1 - Math.min(1, (-z[i]) / 4));
      if (z[i] < -3.2) {
        z[i] = 2.6 + Math.random() * 0.3;
        r[i] = 0.4 + Math.sqrt(Math.random()) * 0.58;
        th[i] = Math.random() * Math.PI * 2;
      }
      const inlet = z[i] > 0.25 ? Math.min(1, (z[i] - 0.25) / 2.2) : 0;
      const outlet = z[i] < -0.4 ? Math.min(1, (-z[i] - 0.4) / 2.8) : 0;
      const rr = r[i] * (1 + 0.45 * inlet * inlet + 0.18 * outlet);
      pos[i * 3] = Math.cos(th[i]) * rr;
      pos[i * 3 + 1] = Math.sin(th[i]) * rr;
      pos[i * 3 + 2] = z[i];
      const a =
        Math.min(1, (2.9 - z[i]) / 0.9) * Math.min(1, (z[i] + 3.2) / 1.0) * fadeAll * Math.min(1, 0.25 + speed);
      col[i * 3] = base.r * a;
      col[i * 3 + 1] = base.g * a;
      col[i * 3 + 2] = base.b * a;
    }
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
  });

  return (
    <points frustumCulled={false} raycast={() => null}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.col, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={additive ? 0.9 : 0.75}
        depthWrite={false}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Assembly                                                            */
/* ------------------------------------------------------------------ */

/** Axial offset of each part at full explode (fan axis = z, inlet at +z). */
const EXPLODE: Record<PartId, number> = {
  blades: 1.9,
  hub: 1.3,
  magnet: 0.85,
  "bearing-front": 0.5,
  shaft: 0.2,
  stator: 0,
  "bearing-rear": -0.45,
  shroud: -0.75,
  struts: -1.05,
  housing: -1.4,
  hall: -1.75,
  pcb: -1.95,
};
const ROTATING: PartId[] = ["blades", "hub", "magnet", "shaft"];

export interface FanModelProps {
  exploded: number;
  rpm: number;
  spinning: boolean;
  airflow: boolean;
  selected: Set<PartId> | null;
  hovered: PartId | null;
  highlight: string;
  airColor: string;
  additiveAir: boolean;
  particleCount: number;
  interactive?: boolean;
  onHover?: (id: PartId | null) => void;
  onSelect?: (id: PartId) => void;
}

export function FanModel(props: FanModelProps) {
  const groups = useRef<Partial<Record<PartId, THREE.Group | null>>>({});
  const spinners = useRef<Partial<Record<PartId, THREE.Group | null>>>({});
  const explodeRef = useRef(props.exploded);
  const angle = useRef(0);
  const speed = useRef(props.spinning ? props.rpm / 3000 : 0);

  const ctx = useMemo<FanCtxValue>(
    () => ({
      selected: props.selected,
      hovered: props.hovered,
      highlight: props.highlight,
      interactive: !!props.interactive,
      onHover: props.onHover,
      onSelect: props.onSelect,
    }),
    [props.selected, props.hovered, props.highlight, props.interactive, props.onHover, props.onSelect],
  );

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    explodeRef.current += (props.exploded - explodeRef.current) * (1 - Math.exp(-6 * dt));
    const targetSpeed = props.spinning ? props.rpm / 3000 : 0;
    speed.current += (targetSpeed - speed.current) * (1 - Math.exp(-2.2 * dt));
    angle.current += speed.current * Math.PI * 2 * 1.15 * dt;
    for (const id of Object.keys(EXPLODE) as PartId[]) {
      const g = groups.current[id];
      if (g) g.position.z = EXPLODE[id] * explodeRef.current;
    }
    for (const id of ROTATING) {
      const s = spinners.current[id];
      if (s) s.rotation.z = angle.current;
    }
  });

  const reg = (id: PartId) => (g: THREE.Group | null) => {
    groups.current[id] = g;
  };
  const spin = (id: PartId) => (g: THREE.Group | null) => {
    spinners.current[id] = g;
  };

  return (
    <FanCtx.Provider value={ctx}>
      <group>
        <PartGroup id="shroud" groupRef={reg("shroud")}>
          <Shroud />
        </PartGroup>
        <PartGroup id="struts" groupRef={reg("struts")}>
          <Struts />
        </PartGroup>
        <PartGroup id="blades" groupRef={reg("blades")}>
          <group ref={spin("blades")}>
            <Blades />
          </group>
        </PartGroup>
        <PartGroup id="hub" groupRef={reg("hub")}>
          <group ref={spin("hub")}>
            <Hub />
          </group>
        </PartGroup>
        <PartGroup id="magnet" groupRef={reg("magnet")}>
          <group ref={spin("magnet")}>
            <Magnet />
          </group>
        </PartGroup>
        <PartGroup id="stator" groupRef={reg("stator")}>
          <Stator />
        </PartGroup>
        <PartGroup id="shaft" groupRef={reg("shaft")}>
          <group ref={spin("shaft")}>
            <Shaft />
          </group>
        </PartGroup>
        <PartGroup id="bearing-front" groupRef={reg("bearing-front")}>
          <Bearing id="bearing-front" z={0.18} />
        </PartGroup>
        <PartGroup id="bearing-rear" groupRef={reg("bearing-rear")}>
          <Bearing id="bearing-rear" z={-0.2} />
        </PartGroup>
        <PartGroup id="housing" groupRef={reg("housing")}>
          <Housing />
        </PartGroup>
        <PartGroup id="pcb" groupRef={reg("pcb")}>
          <Pcb />
        </PartGroup>
        <PartGroup id="hall" groupRef={reg("hall")}>
          <Hall />
        </PartGroup>
      </group>
      <Airflow
        speedRef={speed}
        explodeRef={explodeRef}
        count={props.particleCount}
        color={props.airColor}
        additive={props.additiveAir}
        visible={props.airflow}
      />
    </FanCtx.Provider>
  );
}
