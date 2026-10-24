/**
 * Transient electromechanical model of a fan spin-up.
 *
 *   J·dω/dt = T_motor(ω) − T_aero(ω) − b·ω
 *   T_motor = T_stall · throttle · (1 − ω / ω_nl)
 *   T_aero  = k_aero · ω²   (fan load, from P ∝ ω³)
 *   dθ/dt   = (P_loss − (θ − θ_amb)/R_th) / C_th   (winding temperature)
 */

export interface SimParams {
  throttle: number; // 0..1 supply duty
  inertia: number; // kg·m²
  bearingFriction: number; // N·m·s
  ductResistance: number; // multiplier on aerodynamic load
  ambient: number; // °C
  imbalance: number; // 0..1 blade imbalance severity
}

export interface SimState {
  t: number;
  omega: number;
  temp: number;
  energy: number;
}

export interface SimSample {
  t: number;
  rpm: number;
  current: number;
  temp: number;
  power: number;
  vibration: number;
  flow: number;
}

export const SIM_DEFAULTS: SimParams = {
  throttle: 0.75,
  inertia: 0.0009,
  bearingFriction: 0.00004,
  ductResistance: 1,
  ambient: 25,
  imbalance: 0,
};

const T_STALL = 0.9; // N·m
const OMEGA_NL = (2 * Math.PI * 6000) / 60; // no-load speed, rad/s
const K_AERO = 1.8e-6; // N·m·s²
const V_SUPPLY = 24; // V
const R_TH = 2.2; // K/W
const C_TH = 90; // J/K
const MOTOR_LOSS_FRACTION = 0.18;

export function initialState(p: SimParams): SimState {
  return { t: 0, omega: 0, temp: p.ambient, energy: 0 };
}

export function step(s: SimState, p: SimParams, dt: number): SimState {
  const tMotor = T_STALL * p.throttle * Math.max(0, 1 - s.omega / OMEGA_NL);
  const tAero = K_AERO * p.ductResistance * s.omega * s.omega;
  const tFric = p.bearingFriction * s.omega;
  const alpha = (tMotor - tAero - tFric) / p.inertia;
  const omega = Math.max(0, s.omega + alpha * dt);

  const pMech = tMotor * omega;
  const pLoss = pMech * MOTOR_LOSS_FRACTION + tFric * omega + 1.5 * p.throttle;
  const dTemp = (pLoss - (s.temp - p.ambient) / R_TH) / C_TH;

  return {
    t: s.t + dt,
    omega,
    temp: s.temp + dTemp * dt * 12, // time-compressed thermal response
    energy: s.energy + (pMech + pLoss) * dt,
  };
}

export function sample(s: SimState, p: SimParams): SimSample {
  const tMotor = T_STALL * p.throttle * Math.max(0, 1 - s.omega / OMEGA_NL);
  const pMech = tMotor * s.omega;
  const pElec = pMech / (1 - MOTOR_LOSS_FRACTION) + 1.5 * p.throttle;
  const rpm = (s.omega * 60) / (2 * Math.PI);
  const vibration = 0.4 + (p.imbalance * 6 + p.bearingFriction * 20000) * (rpm / 3000) ** 2;
  return {
    t: +s.t.toFixed(2),
    rpm: Math.round(rpm),
    current: +(pElec / V_SUPPLY).toFixed(3),
    temp: +s.temp.toFixed(2),
    power: +pElec.toFixed(2),
    vibration: +vibration.toFixed(2),
    flow: +((rpm / 3000) * 214 / Math.sqrt(p.ductResistance)).toFixed(1),
  };
}
