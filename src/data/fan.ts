export type PartId =
  | "shroud"
  | "struts"
  | "hub"
  | "blades"
  | "shaft"
  | "stator"
  | "magnet"
  | "bearing-front"
  | "bearing-rear"
  | "housing"
  | "pcb"
  | "hall";

export interface PartDef {
  id: PartId;
  name: string;
  subsystem: string;
  material: string;
  mass: string;
  role: string;
  description: string;
  specs: { label: string; value: string }[];
  equation?: { tex: string; caption: string };
  failureModes: string[];
  designNote: string;
}

export const PARTS: Record<PartId, PartDef> = {
  shroud: {
    id: "shroud",
    name: "Shroud",
    subsystem: "Structure",
    material: "Die-cast aluminium A380",
    mass: "410 g",
    role: "Guides airflow and limits tip leakage",
    description:
      "The circular venturi housing that surrounds the blades. A tight tip clearance prevents high-pressure air recirculating around blade tips.",
    specs: [
      { label: "Inner diameter", value: "204 mm" },
      { label: "Tip clearance", value: "2.0 mm (1 % D)" },
      { label: "Inlet radius", value: "12 mm bellmouth" },
    ],
    equation: { tex: "ΔP_loss ∝ (δ / D) · ρU²", caption: "Tip-leakage loss grows with clearance ratio δ/D" },
    failureModes: ["Tip rub from distortion", "Cracked mounting flange"],
    designNote:
      "A bellmouth inlet smooths the entry flow; halving tip clearance can recover 3–5 % static efficiency.",
  },
  struts: {
    id: "struts",
    name: "Support struts",
    subsystem: "Structure",
    material: "Aluminium A380",
    mass: "120 g",
    role: "Holds the motor and straightens swirl",
    description:
      "Four aerofoil-section arms behind the rotor carry the motor and act as outlet guide vanes, converting swirl into static pressure.",
    specs: [
      { label: "Count", value: "4" },
      { label: "Section", value: "NACA 0012" },
      { label: "Axial gap to rotor", value: "18 mm" },
    ],
    failureModes: ["Fatigue at root from vibration", "Tonal noise from rotor–strut interaction"],
    designNote: "Using a strut count co-prime with blade count (4 vs 7) avoids reinforcing tonal noise.",
  },
  hub: {
    id: "hub",
    name: "Hub",
    subsystem: "Rotor assembly",
    material: "Glass-filled PA66",
    mass: "85 g",
    role: "Mounts blades and transmits torque",
    description:
      "The central body that clamps the blades and couples to the outer-rotor motor. Its diameter sets the hub-to-tip ratio.",
    specs: [
      { label: "Diameter", value: "70 mm" },
      { label: "Hub-to-tip ratio", value: "0.35" },
      { label: "Blade roots", value: "7 dovetails" },
    ],
    equation: { tex: "A = π/4 · (D² − d²)", caption: "Annulus flow area between hub and tip" },
    failureModes: ["Creep at blade root under heat", "Hub crack from overspeed"],
    designNote: "A larger hub raises pressure capability but shrinks flow area — a classic trade-off.",
  },
  blades: {
    id: "blades",
    name: "Blades ×7",
    subsystem: "Rotor assembly",
    material: "Glass-filled PA66",
    mass: "7 × 22 g",
    role: "Convert shaft power into air pressure",
    description:
      "Seven swept, twisted aerofoil blades. Twist keeps the angle of attack near optimum from root to tip because local blade speed rises with radius.",
    specs: [
      { label: "Tip speed @ 3,000 rpm", value: "31.4 m/s" },
      { label: "Chord", value: "40 mm" },
      { label: "Pitch at tip", value: "28°" },
      { label: "Sweep", value: "22° forward" },
    ],
    equation: { tex: "U = π · D · N / 60", caption: "Tip speed drives pressure (ΔP ∝ ρU²)" },
    failureModes: ["Imbalance from erosion or debris", "Blade fracture", "Stall at high resistance"],
    designNote: "Forward sweep spreads the leading-edge pressure pulse and lowers broadband noise by ~2 dB.",
  },
  shaft: {
    id: "shaft",
    name: "Shaft",
    subsystem: "Rotor assembly",
    material: "Stainless steel 420",
    mass: "38 g",
    role: "Carries torque and locates the rotor",
    description:
      "A hardened, ground shaft that runs in two ball bearings and connects the magnet ring to the hub.",
    specs: [
      { label: "Diameter", value: "8 mm" },
      { label: "Length", value: "62 mm" },
      { label: "Surface", value: "Ra 0.2 µm" },
    ],
    equation: { tex: "τ = P / ω", caption: "Shaft torque from power and angular speed" },
    failureModes: ["Fretting at bearing seat", "Bending from imbalance"],
    designNote: "The first bending critical speed is kept above 1.3× maximum operating speed.",
  },
  stator: {
    id: "stator",
    name: "Stator windings",
    subsystem: "Drive",
    material: "Copper on M270 laminations",
    mass: "210 g",
    role: "Creates the rotating magnetic field",
    description:
      "Twelve slots of enamelled copper coils. The controller energises phases in sequence to pull the magnet ring around.",
    specs: [
      { label: "Slots / poles", value: "12 / 14" },
      { label: "Phase resistance", value: "0.42 Ω" },
      { label: "Insulation class", value: "F (155 °C)" },
    ],
    equation: { tex: "τ = k_t · I", caption: "Motor torque is proportional to phase current" },
    failureModes: ["Insulation breakdown from overheating", "Turn-to-turn short"],
    designNote: "Each 10 °C above rating roughly halves insulation life (Arrhenius rule).",
  },
  magnet: {
    id: "magnet",
    name: "Magnet ring",
    subsystem: "Drive",
    material: "Bonded NdFeB in steel cup",
    mass: "140 g",
    role: "Outer rotor that follows the field",
    description:
      "A 14-pole permanent-magnet ring bonded inside a steel cup. In an outer-rotor design it spins around the stator and doubles as the hub mount.",
    specs: [
      { label: "Poles", value: "14" },
      { label: "Remanence", value: "0.68 T" },
      { label: "Air gap", value: "0.5 mm" },
    ],
    equation: { tex: "F = B · I · L", caption: "Lorentz force on the conductors" },
    failureModes: ["Demagnetisation above 120 °C", "Adhesive debond"],
    designNote: "Outer-rotor layouts give more torque per volume and a compact axial length.",
  },
  "bearing-front": {
    id: "bearing-front",
    name: "Front bearing",
    subsystem: "Drive",
    material: "Chrome steel 52100",
    mass: "6 g",
    role: "Supports radial and thrust load",
    description:
      "A sealed deep-groove ball bearing. It takes the axial thrust produced by the blades pushing air.",
    specs: [
      { label: "Type", value: "608-2RS" },
      { label: "L10 life", value: "60,000 h @ 40 °C" },
      { label: "Grease", value: "Polyurea, 30 % fill" },
    ],
    equation: { tex: "L₁₀ = (C / P)³", caption: "Bearing life falls with the cube of load" },
    failureModes: ["Grease degradation", "Spalling from imbalance load"],
    designNote: "Bearings are usually the life-limiting part of a fan — grease life halves every 15 °C.",
  },
  "bearing-rear": {
    id: "bearing-rear",
    name: "Rear bearing",
    subsystem: "Drive",
    material: "Chrome steel 52100",
    mass: "6 g",
    role: "Locates the shaft at the motor end",
    description: "The second ball bearing, preloaded by a wave spring to remove axial play and rattle.",
    specs: [
      { label: "Type", value: "608-2RS" },
      { label: "Preload", value: "15 N wave spring" },
    ],
    failureModes: ["Brinelling from shock", "Loss of preload → noise"],
    designNote: "Light preload eliminates ball skidding at high speed and cuts audible noise.",
  },
  housing: {
    id: "housing",
    name: "Motor housing",
    subsystem: "Structure",
    material: "Aluminium A380",
    mass: "95 g",
    role: "Encloses the drive and sheds heat",
    description: "The rear cap that seals the motor and conducts heat from the stator into the airstream.",
    specs: [
      { label: "Ingress rating", value: "IP54" },
      { label: "Thermal resistance", value: "2.2 K/W" },
    ],
    equation: { tex: "ΔT = P_loss · R_th", caption: "Temperature rise from losses" },
    failureModes: ["Seal ageing → moisture ingress"],
    designNote: "Placing the housing in the outlet airflow uses the fan to cool its own motor.",
  },
  pcb: {
    id: "pcb",
    name: "Controller PCB",
    subsystem: "Electronics",
    material: "FR-4, 2 oz copper",
    mass: "24 g",
    role: "Commutates the motor and regulates speed",
    description:
      "A three-phase MOSFET bridge with a microcontroller that switches the windings in sequence and reads a PWM speed command.",
    specs: [
      { label: "Supply", value: "24 V DC" },
      { label: "PWM input", value: "25 kHz" },
      { label: "Protection", value: "Locked-rotor, OCP" },
    ],
    failureModes: ["Electrolytic capacitor dry-out", "MOSFET failure from surge"],
    designNote: "Capacitors near the motor are often the electronic weak link — derate for temperature.",
  },
  hall: {
    id: "hall",
    name: "Hall sensor",
    subsystem: "Electronics",
    material: "Silicon IC",
    mass: "<1 g",
    role: "Detects rotor position",
    description: "Magnetic position sensors that tell the controller when to switch phases.",
    specs: [
      { label: "Count", value: "3 (120° spacing)" },
      { label: "Output", value: "Open drain" },
    ],
    failureModes: ["Misalignment → rough commutation"],
    designNote: "Sensorless back-EMF control removes these parts but complicates start-up.",
  },
};

export type NodeType = "system" | "subsystem" | "assembly" | "component";

export interface TreeNode {
  id: string;
  label: string;
  type: NodeType;
  partIds?: PartId[];
  children?: TreeNode[];
}

export const FAN_TREE: TreeNode = {
  id: "fan",
  label: "Axial Cooling Fan",
  type: "system",
  children: [
    {
      id: "rotor",
      label: "Rotor assembly",
      type: "subsystem",
      partIds: ["hub", "blades", "shaft"],
      children: [
        { id: "hub", label: "Hub", type: "component", partIds: ["hub"] },
        { id: "blades", label: "Blades ×7", type: "component", partIds: ["blades"] },
        { id: "shaft", label: "Shaft", type: "component", partIds: ["shaft"] },
      ],
    },
    {
      id: "drive",
      label: "Drive",
      type: "subsystem",
      partIds: ["stator", "magnet", "bearing-front", "bearing-rear"],
      children: [
        {
          id: "motor",
          label: "BLDC motor",
          type: "assembly",
          partIds: ["stator", "magnet"],
          children: [
            { id: "stator", label: "Stator windings", type: "component", partIds: ["stator"] },
            { id: "magnet", label: "Magnet ring", type: "component", partIds: ["magnet"] },
          ],
        },
        {
          id: "bearings",
          label: "Bearing set",
          type: "assembly",
          partIds: ["bearing-front", "bearing-rear"],
          children: [
            { id: "bearing-front", label: "Front bearing", type: "component", partIds: ["bearing-front"] },
            { id: "bearing-rear", label: "Rear bearing", type: "component", partIds: ["bearing-rear"] },
          ],
        },
      ],
    },
    {
      id: "structure",
      label: "Structure",
      type: "subsystem",
      partIds: ["shroud", "struts", "housing"],
      children: [
        { id: "shroud", label: "Shroud", type: "component", partIds: ["shroud"] },
        { id: "struts", label: "Support struts", type: "component", partIds: ["struts"] },
        { id: "housing", label: "Motor housing", type: "component", partIds: ["housing"] },
      ],
    },
    {
      id: "electronics",
      label: "Electronics",
      type: "subsystem",
      partIds: ["pcb", "hall"],
      children: [
        { id: "pcb", label: "Controller PCB", type: "component", partIds: ["pcb"] },
        { id: "hall", label: "Hall sensor", type: "component", partIds: ["hall"] },
      ],
    },
  ],
};

export function findNode(id: string, node: TreeNode = FAN_TREE): TreeNode | undefined {
  if (node.id === id) return node;
  for (const c of node.children ?? []) {
    const f = findNode(id, c);
    if (f) return f;
  }
  return undefined;
}
