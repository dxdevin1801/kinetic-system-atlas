import type { PartId } from "./fan";

export interface FailureMode {
  id: string;
  part: PartId;
  component: string;
  mode: string;
  effect: string;
  cause: string;
  severity: number;
  occurrence: number;
  detection: number;
  symptoms: string[];
  mitigation: string[];
}

export const FAILURES: FailureMode[] = [
  {
    id: "F-01",
    part: "bearing-front",
    component: "Front bearing",
    mode: "Grease degradation",
    effect: "Rising friction, noise, eventual seizure",
    cause: "Sustained operation above 60 °C oxidises the grease base oil",
    severity: 8,
    occurrence: 6,
    detection: 5,
    symptoms: ["Whining tone rising over weeks", "Current draw +8–15 %", "Housing temperature creep"],
    mitigation: ["High-temperature polyurea grease", "Keep bearing below 50 °C", "Vibration trending"],
  },
  {
    id: "F-02",
    part: "blades",
    component: "Blades",
    mode: "Rotor imbalance",
    effect: "1× rpm vibration, accelerated bearing wear",
    cause: "Dust build-up, erosion or a chipped blade shifts the centre of mass",
    severity: 6,
    occurrence: 5,
    detection: 3,
    symptoms: ["Vibration peak at running speed", "Audible hum", "Visible deposits"],
    mitigation: ["Dynamic balancing to G6.3", "Inlet filtration", "Periodic cleaning"],
  },
  {
    id: "F-03",
    part: "stator",
    component: "Stator windings",
    mode: "Insulation breakdown",
    effect: "Phase short, motor stops",
    cause: "Thermal ageing from overload or blocked airflow",
    severity: 9,
    occurrence: 3,
    detection: 6,
    symptoms: ["Burnt odour", "Erratic current", "Controller over-current trips"],
    mitigation: ["Class H insulation", "Thermal cut-out", "Ensure housing sits in airflow"],
  },
  {
    id: "F-04",
    part: "pcb",
    component: "Controller PCB",
    mode: "Capacitor dry-out",
    effect: "Ripple increases, speed hunting, failure to start",
    cause: "Electrolyte evaporation accelerated by heat",
    severity: 7,
    occurrence: 5,
    detection: 6,
    symptoms: ["Speed oscillation", "Start-up hesitation", "Bulging capacitor"],
    mitigation: ["105 °C long-life capacitors", "Polymer capacitors", "Thermal derating"],
  },
  {
    id: "F-05",
    part: "blades",
    component: "Blades",
    mode: "Aerodynamic stall",
    effect: "Flow collapse, pressure surge, loud noise",
    cause: "System resistance too high — operating left of peak pressure",
    severity: 5,
    occurrence: 4,
    detection: 4,
    symptoms: ["Pulsing airflow", "Low-frequency rumble", "Flow drop at constant speed"],
    mitigation: ["Size fan with margin from stall", "Reduce duct losses", "Variable pitch"],
  },
  {
    id: "F-06",
    part: "magnet",
    component: "Magnet ring",
    mode: "Partial demagnetisation",
    effect: "Torque constant drops, higher current for same speed",
    cause: "Exposure above 120 °C or reverse field during fault",
    severity: 7,
    occurrence: 2,
    detection: 7,
    symptoms: ["Reduced top speed", "Lower back-EMF", "Higher current"],
    mitigation: ["Higher-grade magnets (SH)", "Current limiting", "Thermal monitoring"],
  },
  {
    id: "F-07",
    part: "struts",
    component: "Support struts",
    mode: "Fatigue crack",
    effect: "Motor misalignment, tip rub",
    cause: "Resonance excited by blade-pass frequency",
    severity: 8,
    occurrence: 2,
    detection: 5,
    symptoms: ["Changing vibration signature", "Rubbing noise"],
    mitigation: ["Detune strut natural frequency", "Fillet radii at root"],
  },
  {
    id: "F-08",
    part: "hall",
    component: "Hall sensor",
    mode: "Signal loss",
    effect: "Rough commutation or no start",
    cause: "Solder joint crack from thermal cycling",
    severity: 6,
    occurrence: 3,
    detection: 4,
    symptoms: ["Jerky start", "Intermittent stops"],
    mitigation: ["Underfill / conformal coat", "Sensorless fallback mode"],
  },
];

export const rpn = (f: FailureMode) => f.severity * f.occurrence * f.detection;

/** Bathtub hazard curve (Weibull sum) over operating hours. */
export const bathtub = Array.from({ length: 31 }, (_, i) => {
  const t = i * 2000; // hours
  const tt = Math.max(t, 50);
  const infant = 0.9 * (0.6 / 3000) * (tt / 3000) ** (0.6 - 1);
  const random = 0.00006;
  const wear = (3.5 / 52000) * (tt / 52000) ** (3.5 - 1);
  return { hours: t, rate: +((infant + random + wear) * 1000).toFixed(3) };
});
