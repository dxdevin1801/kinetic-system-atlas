/**
 * Axial fan physics model (steady state).
 *
 * Fan curve:     ΔP_f(Q) = A · (1 − (Q / Q_max)²)
 * System curve:  ΔP_s(Q) = K · Q²
 * Shut-off pressure A = ψ₀ · ρ · U²   and free delivery Q_max = φ₀ · A_ann · U
 * where U = π · D · N / 60 is the blade tip speed.
 *
 * Because A ∝ N² and Q_max ∝ N, the operating point obeys the fan affinity
 * laws: Q ∝ N, ΔP ∝ N², P ∝ N³.
 */

export interface FanInputs {
  /** Rotational speed, rpm */
  rpm: number;
  /** Rotor tip diameter, m */
  diameter: number;
  /** Hub diameter, m */
  hubDiameter: number;
  /** Air density, kg/m³ */
  density: number;
  /** System resistance coefficient, Pa·s²/m⁶ */
  systemK: number;
  /** Motor efficiency, 0..1 */
  motorEfficiency: number;
}

export interface FanOutputs {
  tipSpeed: number; // m/s
  omega: number; // rad/s
  annulusArea: number; // m²
  shutoffPressure: number; // Pa
  freeDelivery: number; // m³/s
  flow: number; // m³/s
  pressure: number; // Pa
  axialVelocity: number; // m/s
  airPower: number; // W
  fanEfficiency: number; // 0..1
  shaftPower: number; // W
  electricalPower: number; // W
  torque: number; // N·m
  reynolds: number; // –
  soundPower: number; // dB
  flowFraction: number; // Q / Q_max
}

export const FAN_CONSTANTS = {
  psi0: 0.18, // shut-off pressure coefficient
  phi0: 0.45, // free-delivery flow coefficient
  etaPeak: 0.62, // peak aerodynamic efficiency
  bepFraction: 0.55, // Q/Qmax at best efficiency point
  chord: 0.04, // blade chord, m
  mu: 1.81e-5, // dynamic viscosity of air, Pa·s
  kw: 40, // specific sound power level, dB
} as const;

export const DEFAULT_FAN_INPUTS: FanInputs = {
  rpm: 3000,
  diameter: 0.2,
  hubDiameter: 0.07,
  density: 1.2,
  systemK: 3200,
  motorEfficiency: 0.85,
};

export function fanEfficiencyAt(flowFraction: number): number {
  const { etaPeak, bepFraction } = FAN_CONSTANTS;
  const x = (flowFraction - bepFraction) / bepFraction;
  return Math.max(0.05, etaPeak * (1 - x * x));
}

export function fanCurvePressure(q: number, shutoff: number, qMax: number): number {
  if (qMax <= 0) return 0;
  return Math.max(0, shutoff * (1 - (q / qMax) ** 2));
}

export function computeFan(input: FanInputs): FanOutputs {
  const { rpm, diameter, hubDiameter, density, systemK, motorEfficiency } = input;
  const { psi0, phi0, chord, mu, kw } = FAN_CONSTANTS;

  const omega = (2 * Math.PI * rpm) / 60;
  const tipSpeed = (Math.PI * diameter * rpm) / 60;
  const annulusArea = (Math.PI / 4) * (diameter ** 2 - hubDiameter ** 2);
  const shutoffPressure = psi0 * density * tipSpeed ** 2;
  const freeDelivery = phi0 * annulusArea * tipSpeed;

  const denom = systemK + (freeDelivery > 0 ? shutoffPressure / freeDelivery ** 2 : 0);
  const flow = rpm > 0 && denom > 0 ? Math.sqrt(shutoffPressure / denom) : 0;
  const pressure = systemK * flow ** 2;
  const flowFraction = freeDelivery > 0 ? flow / freeDelivery : 0;

  const airPower = flow * pressure;
  const fanEfficiency = rpm > 0 ? fanEfficiencyAt(flowFraction) : 0;
  const shaftPower = fanEfficiency > 0 ? airPower / fanEfficiency : 0;
  const electricalPower = motorEfficiency > 0 ? shaftPower / motorEfficiency : 0;
  const torque = omega > 0 ? shaftPower / omega : 0;
  const reynolds = (density * tipSpeed * chord) / mu;
  const soundPower =
    flow > 0 && pressure > 0 ? kw + 10 * Math.log10(flow) + 20 * Math.log10(pressure) : 0;

  return {
    tipSpeed,
    omega,
    annulusArea,
    shutoffPressure,
    freeDelivery,
    flow,
    pressure,
    axialVelocity: annulusArea > 0 ? flow / annulusArea : 0,
    airPower,
    fanEfficiency,
    shaftPower,
    electricalPower,
    torque,
    reynolds,
    soundPower,
    flowFraction,
  };
}

/** Sampled fan + system curves for plotting. */
export function curveSeries(input: FanInputs, points = 40) {
  const out = computeFan(input);
  const qEnd = out.freeDelivery * 1.02;
  return Array.from({ length: points + 1 }, (_, i) => {
    const q = (qEnd * i) / points;
    const fanP = fanCurvePressure(q, out.shutoffPressure, out.freeDelivery);
    const eff = fanEfficiencyAt(out.freeDelivery > 0 ? q / out.freeDelivery : 0);
    return {
      q: +(q * 1000).toFixed(1), // L/s for readability
      fan: +fanP.toFixed(1),
      system: +(input.systemK * q * q).toFixed(1),
      efficiency: +(eff * 100).toFixed(1),
    };
  });
}

/** Affinity-law sweep across speed. */
export function speedSweep(input: FanInputs, maxRpm = 6000, steps = 24) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const rpm = (maxRpm * i) / steps;
    const o = computeFan({ ...input, rpm });
    return {
      rpm: Math.round(rpm),
      flow: +(o.flow * 1000).toFixed(1),
      pressure: +o.pressure.toFixed(1),
      power: +o.electricalPower.toFixed(1),
    };
  });
}

export const m3sToCfm = (q: number) => q * 2118.88;
