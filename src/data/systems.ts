import motor from "@/assets/sys-motor.jpg";
import fan from "@/assets/sys-fan.jpg";
import arm from "@/assets/sys-arm.jpg";
import ev from "@/assets/sys-ev.jpg";
import rocket from "@/assets/sys-rocket.jpg";

export type Domain = "Electromechanical" | "Fluid" | "Robotics" | "Mobility" | "Aerospace";

export interface SystemDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  domain: Domain;
  image: string;
  complexity: "Foundational" | "Intermediate" | "Advanced";
  components: number;
  interactive: boolean;
  specs: { label: string; value: string }[];
  subsystems: { name: string; parts: string[] }[];
  principles: string[];
  performance: { x: number; y: number }[];
  performanceLabel: { x: string; y: string };
}

const curve = (fn: (x: number) => number, n = 12, max = 100) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const x = (max * i) / n;
    return { x: +x.toFixed(0), y: +fn(x).toFixed(2) };
  });

export const SYSTEMS: SystemDef[] = [
  {
    id: "axial-fan",
    name: "Axial Cooling Fan",
    tagline: "Rotating aerodynamics",
    description:
      "A seven-blade axial fan driven by a brushless outer-rotor motor. Explore how blade pitch, speed and duct resistance shape airflow.",
    domain: "Fluid",
    image: fan,
    complexity: "Foundational",
    components: 12,
    interactive: true,
    specs: [
      { label: "Rotor diameter", value: "200 mm" },
      { label: "Nominal speed", value: "3,000 rpm" },
      { label: "Airflow", value: "214 L/s" },
      { label: "Static pressure", value: "148 Pa" },
      { label: "Input power", value: "61 W" },
    ],
    subsystems: [
      { name: "Rotor assembly", parts: ["Hub", "Blades ×7", "Shaft"] },
      { name: "Drive", parts: ["Stator windings", "Magnet ring", "Bearings"] },
      { name: "Structure", parts: ["Shroud", "Support struts", "Motor housing"] },
      { name: "Electronics", parts: ["Controller PCB", "Hall sensor"] },
    ],
    principles: ["Fan affinity laws", "Bernoulli & momentum theory", "BLDC commutation"],
    performance: curve((x) => 213 * (1 - (x / 100) ** 2)),
    performanceLabel: { x: "Flow (% of free delivery)", y: "Pressure (Pa)" },
  },
  {
    id: "electric-motor",
    name: "Electric Motor",
    tagline: "Electromagnetic torque",
    description:
      "A permanent-magnet synchronous motor. Trace current through stator windings to the rotating magnetic field and shaft torque.",
    domain: "Electromechanical",
    image: motor,
    complexity: "Intermediate",
    components: 18,
    interactive: false,
    specs: [
      { label: "Rated power", value: "7.5 kW" },
      { label: "Rated torque", value: "48 N·m" },
      { label: "Peak efficiency", value: "95.2 %" },
      { label: "Pole pairs", value: "4" },
      { label: "Bus voltage", value: "400 V" },
    ],
    subsystems: [
      { name: "Stator", parts: ["Laminated core", "Copper windings", "Slot liners"] },
      { name: "Rotor", parts: ["NdFeB magnets", "Rotor core", "Shaft"] },
      { name: "Housing", parts: ["Frame", "End bells", "Bearings", "Cooling fins"] },
    ],
    principles: ["Lorentz force", "Faraday's law", "Field-oriented control"],
    performance: curve((x) => 48 * Math.min(1, 1.35 - x / 100), 12, 100),
    performanceLabel: { x: "Speed (% rated)", y: "Torque (N·m)" },
  },
  {
    id: "robotic-arm",
    name: "Robotic Arm",
    tagline: "Kinematic chains",
    description:
      "A six-axis serial manipulator. Understand forward kinematics, joint torques and how harmonic drives deliver precision.",
    domain: "Robotics",
    image: arm,
    complexity: "Advanced",
    components: 34,
    interactive: false,
    specs: [
      { label: "Degrees of freedom", value: "6" },
      { label: "Reach", value: "900 mm" },
      { label: "Payload", value: "7 kg" },
      { label: "Repeatability", value: "±0.02 mm" },
      { label: "Max joint speed", value: "180 °/s" },
    ],
    subsystems: [
      { name: "Base & shoulder", parts: ["Base joint", "Shoulder actuator"] },
      { name: "Arm links", parts: ["Upper arm", "Elbow actuator", "Forearm"] },
      { name: "Wrist", parts: ["Wrist 1–3", "Tool flange"] },
    ],
    principles: ["Denavit–Hartenberg", "Jacobian", "Harmonic drive reduction"],
    performance: curve((x) => 7 * (1 - 0.6 * (x / 100) ** 1.5)),
    performanceLabel: { x: "Reach (% max)", y: "Payload (kg)" },
  },
  {
    id: "electric-vehicle",
    name: "Electric Vehicle",
    tagline: "Energy to motion",
    description:
      "A dual-motor skateboard platform. Follow energy from battery cells through inverters, motors and gearing to the road.",
    domain: "Mobility",
    image: ev,
    complexity: "Advanced",
    components: 46,
    interactive: false,
    specs: [
      { label: "Battery", value: "82 kWh" },
      { label: "Peak power", value: "340 kW" },
      { label: "Range (WLTP)", value: "520 km" },
      { label: "0–100 km/h", value: "4.4 s" },
      { label: "Pack voltage", value: "800 V" },
    ],
    subsystems: [
      { name: "Energy storage", parts: ["Cell modules", "BMS", "Thermal plate"] },
      { name: "Powertrain", parts: ["Inverter", "Front motor", "Rear motor", "Reduction gear"] },
      { name: "Chassis", parts: ["Suspension", "Brakes", "Steering rack"] },
    ],
    principles: ["Road-load equation", "Regenerative braking", "Thermal management"],
    performance: curve((x) => 520 * (1 - 0.0045 * x - 0.00003 * x * x), 12, 160),
    performanceLabel: { x: "Speed (km/h)", y: "Range (km)" },
  },
  {
    id: "rocket-propulsion",
    name: "Rocket Propulsion",
    tagline: "Thrust from combustion",
    description:
      "A gas-generator liquid engine. See how turbopumps, combustion chamber pressure and nozzle expansion generate thrust.",
    domain: "Aerospace",
    image: rocket,
    complexity: "Advanced",
    components: 28,
    interactive: false,
    specs: [
      { label: "Vacuum thrust", value: "981 kN" },
      { label: "Isp (vac)", value: "311 s" },
      { label: "Chamber pressure", value: "9.7 MPa" },
      { label: "Expansion ratio", value: "16 : 1" },
      { label: "Propellants", value: "LOX / RP-1" },
    ],
    subsystems: [
      { name: "Feed system", parts: ["Turbopump", "Gas generator", "Valves"] },
      { name: "Thrust chamber", parts: ["Injector", "Combustion chamber", "Throat"] },
      { name: "Nozzle", parts: ["Regenerative section", "Extension"] },
    ],
    principles: ["Tsiolkovsky equation", "Isentropic expansion", "Regenerative cooling"],
    performance: curve((x) => 845 + 1.36 * x, 12, 100),
    performanceLabel: { x: "Altitude (km)", y: "Thrust (kN)" },
  },
];

export const getSystem = (id: string) => SYSTEMS.find((s) => s.id === id);
