import { PARTS, type PartId } from "@/data/fan";
import { FAILURES, rpn } from "@/data/failures";
import { computeFan, DEFAULT_FAN_INPUTS } from "@/lib/physics/fan";

/**
 * SystemX Copilot — provider interface.
 * `localProvider` answers from the built-in engineering knowledge base.
 * A future AI-backed provider only needs to implement `CopilotProvider`.
 */
export interface CopilotContext {
  route: string;
  selectedPart?: PartId;
  depth: "simple" | "technical";
}

export interface CopilotReply {
  text: string;
  equation?: string;
  sources: string[];
  followups: string[];
}

export interface CopilotProvider {
  respond(question: string, ctx: CopilotContext): Promise<CopilotReply>;
}

interface Entry {
  id: string;
  keywords: string[];
  simple: string;
  technical: string;
  equation?: string;
  source: string;
  followups: string[];
}

const op = computeFan(DEFAULT_FAN_INPUTS);
const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d });

const TOPICS: Entry[] = [
  {
    id: "affinity",
    keywords: ["affinity", "speed", "rpm", "faster", "double", "cube", "laws", "slow"],
    simple:
      "Fan speed has an outsized effect on energy. Spin twice as fast and you get twice the airflow, four times the pressure — but eight times the power draw. That's why slowing a fan slightly saves a lot of energy.",
    technical:
      "For a geometrically similar fan at constant density, Q ∝ N, ΔP ∝ N² and P ∝ N³. These follow from the flow coefficient φ = Q/(AU) and pressure coefficient ψ = ΔP/(ρU²) staying constant, with U = πDN/60. A 20 % speed reduction yields 0.8³ ≈ 51 % of the power.",
    equation: "Q ∝ N   ·   ΔP ∝ N²   ·   P ∝ N³",
    source: "Library · The Fan Affinity Laws",
    followups: ["What sets the operating point?", "How does tip speed affect noise?"],
  },
  {
    id: "operating",
    keywords: ["operating", "point", "system", "curve", "resistance", "duct", "filter", "intersection"],
    simple:
      "A fan doesn't decide how much air it moves — the system it's connected to does. The fan curve and the duct's resistance curve cross at one point, and that's where it runs.",
    technical: `The fan curve ΔP_f = A(1 − (Q/Q_max)²) intersects the system curve ΔP_s = K·Q². At the default 3,000 rpm and K = 3,200 Pa·s²/m⁶ that gives Q ≈ ${fmt(op.flow * 1000)} L/s at ${fmt(op.pressure)} Pa, about ${fmt(op.flowFraction * 100)} % of free delivery — right near the best-efficiency point.`,
    equation: "A(1 − (Q/Q_max)²) = K·Q²",
    source: "Physics · Operating point",
    followups: ["What happens if the filter clogs?", "What is stall?"],
  },
  {
    id: "stall",
    keywords: ["stall", "surge", "pulsing", "rumble", "clog", "clogged", "blocked"],
    simple:
      "Stall is when the air can't follow the blade surface anymore — usually because the system is too restrictive. Flow becomes unsteady, noise jumps and efficiency collapses.",
    technical:
      "As system resistance rises the operating point moves left on the fan curve. Blade angle of attack increases until the suction-side boundary layer separates. In axial fans this appears as a dip in the pressure curve and rotating stall cells, exciting low-frequency vibration. Design with ≥15 % margin from peak pressure.",
    source: "Failure Analysis · F-05",
    followups: ["How do I avoid stall?", "What sets the operating point?"],
  },
  {
    id: "tip",
    keywords: ["tip", "tip speed", "velocity", "blade speed", "noise", "loud", "sound", "db"],
    simple: `The blade tips travel much faster than the hub — about ${fmt(op.tipSpeed, 1)} m/s at 3,000 rpm. Tip speed drives both the pressure a fan can make and how loud it is.`,
    technical: `U = πDN/60 = ${fmt(op.tipSpeed, 1)} m/s. Pressure capability scales with ρU², while broadband sound power scales roughly with U⁵–U⁶. Estimated sound power at the operating point: ${fmt(op.soundPower, 1)} dB(W). Tonal noise sits at the blade-pass frequency f = B·N/60 = ${fmt((7 * 3000) / 60)} Hz.`,
    equation: "U = π · D · N / 60",
    source: "Library · Where Fan Noise Comes From",
    followups: ["Why seven blades and four struts?", "Explain the affinity laws"],
  },
  {
    id: "blade-count",
    keywords: ["seven", "7", "four", "co-prime", "blade count", "number of blades", "struts", "why"],
    simple:
      "Seven blades and four struts don't share a common factor, so their pressure pulses don't line up. That spreads the tonal noise instead of stacking it into one loud hum.",
    technical:
      "When blade count B and vane count V share factors, multiple blades interact with vanes simultaneously, reinforcing blade-pass harmonics. Co-prime counts (7, 4) cause the interaction to rotate around the annulus. Odd blade counts also reduce the risk of exciting structural modes.",
    source: "Design note · Support struts",
    followups: ["How does tip speed affect noise?", "What does the shroud do?"],
  },
  {
    id: "efficiency",
    keywords: ["efficiency", "efficient", "power", "energy", "watts", "loss", "losses"],
    simple: `Of the ${fmt(op.electricalPower)} W the fan draws, only about ${fmt(op.airPower)} W ends up as useful air power. The rest is lost in the motor and in turbulence around the blades.`,
    technical: `Electrical → shaft (motor η ≈ 85 %) → air (fan η ≈ ${fmt(op.fanEfficiency * 100)} %). Total η ≈ ${fmt(op.fanEfficiency * 85)} %. Aerodynamic losses include tip leakage, profile drag, exit swirl and diffusion losses. Peak fan efficiency occurs near 55 % of free delivery in this model.`,
    equation: "η = Q·ΔP / P_shaft",
    source: "Physics · Power chain",
    followups: ["How can I improve efficiency?", "Explain the affinity laws"],
  },
  {
    id: "torque",
    keywords: ["torque", "motor", "bldc", "brushless", "commutation", "hall", "current"],
    simple:
      "The brushless motor uses electronics instead of brushes to switch its coils on and off in sequence, pulling the magnet ring around. More current means more torque.",
    technical: `Six-step commutation energises two of three phases at a time, guided by Hall sensors. Torque τ = k_t·I and back-EMF E = k_e·ω. At the operating point the shaft needs τ = P/ω ≈ ${fmt(op.torque, 3)} N·m.`,
    equation: "τ = k_t · I     ·     τ = P / ω",
    source: "Library · How BLDC Motors Commutate",
    followups: ["Why do bearings fail?", "What limits motor temperature?"],
  },
  {
    id: "reynolds",
    keywords: ["reynolds", "re", "laminar", "turbulent", "viscous", "dimensionless"],
    simple: "The Reynolds number tells you whether air flows smoothly or turbulently over a blade. Our blades are in the transitional range where small details matter.",
    technical: `Re = ρUc/μ ≈ ${fmt(op.reynolds)} for the 40 mm chord at the tip. That sits in the 10⁴–10⁵ band where laminar separation bubbles form, which is why small fans have lower efficiency than large industrial ones.`,
    equation: "Re = ρ U c / μ",
    source: "Library · Thinking in Dimensionless Numbers",
    followups: ["What is stall?", "How does tip speed affect noise?"],
  },
  {
    id: "exploded",
    keywords: ["exploded", "explode", "view", "assemble", "assembly", "how to use", "lab"],
    simple:
      "In the 3D Lab, drag the Exploded slider to pull the fan apart along its axis. Click any part — or pick it in the tree on the left — to highlight it and see its details on the right.",
    technical:
      "Each part translates along the rotor axis by an offset proportional to the explode factor, preserving radial positions so the assembly order stays readable. Orbit with left-drag, pan with right-drag, zoom with scroll.",
    source: "SystemX · 3D Lab",
    followups: ["What does the hub do?", "Explain the blades"],
  },
  {
    id: "temperature",
    keywords: ["temperature", "heat", "hot", "thermal", "overheat", "cooling"],
    simple:
      "Heat is the main enemy of a fan's life. Hotter bearings lose grease faster and hotter windings age their insulation — so the motor sits in its own airflow to stay cool.",
    technical:
      "Winding temperature rise ΔT = P_loss·R_th (≈2.2 K/W here). Grease life roughly halves per +15 °C and insulation life halves per +10 °C above class rating (Arrhenius). Locked-rotor or blocked-airflow conditions are the most common route to thermal failure.",
    equation: "ΔT = P_loss · R_th",
    source: "Simulations · Thermal model",
    followups: ["Why do bearings fail?", "What is the riskiest failure mode?"],
  },
  {
    id: "risk",
    keywords: ["risk", "riskiest", "rpn", "fmea", "worst", "highest", "priority"],
    simple: (() => {
      const top = [...FAILURES].sort((a, b) => rpn(b) - rpn(a))[0];
      return `The highest risk is ${top.component.toLowerCase()} — ${top.mode.toLowerCase()} (RPN ${rpn(top)}). It's likely, serious, and hard to spot early.`;
    })(),
    technical: (() => {
      const sorted = [...FAILURES].sort((a, b) => rpn(b) - rpn(a)).slice(0, 3);
      return `Top risks by RPN = S×O×D: ${sorted
        .map((f) => `${f.component} / ${f.mode} (${f.severity}×${f.occurrence}×${f.detection} = ${rpn(f)})`)
        .join("; ")}. Prioritise detection improvements (vibration and temperature trending) for the bearing.`;
    })(),
    equation: "RPN = S × O × D",
    source: "Failure Analysis · FMEA",
    followups: ["Why do bearings fail?", "How do I detect imbalance?"],
  },
];

const partEntries: Entry[] = Object.values(PARTS).map((p) => ({
  id: `part-${p.id}`,
  keywords: [p.name.toLowerCase(), p.id.replace("-", " "), ...p.name.toLowerCase().split(/[\s×]+/)],
  simple: `${p.name}: ${p.role.toLowerCase()}. ${p.description}`,
  technical: `${p.name} (${p.material}, ${p.mass}). ${p.description} Key specs — ${p.specs
    .map((s) => `${s.label.toLowerCase()} ${s.value}`)
    .join("; ")}. Design note: ${p.designNote} Watch for: ${p.failureModes.join(", ").toLowerCase()}.`,
  equation: p.equation?.tex,
  source: `Component · ${p.name}`,
  followups: [`Why does the ${p.name.toLowerCase().replace(" ×7", "")} fail?`, "What is the riskiest failure mode?"],
}));

const failureEntries: Entry[] = FAILURES.map((f) => ({
  id: `fail-${f.id}`,
  keywords: [
    ...f.mode.toLowerCase().split(" "),
    ...f.component.toLowerCase().split(" "),
    "fail",
    "failure",
    "fails",
    "break",
    "detect",
  ],
  simple: `${f.component} — ${f.mode}. ${f.cause}. The result: ${f.effect.toLowerCase()}. Early signs: ${f.symptoms
    .slice(0, 2)
    .join(", ")
    .toLowerCase()}.`,
  technical: `${f.id} · ${f.component} / ${f.mode}. Cause: ${f.cause}. Effect: ${f.effect}. Scores S${f.severity} O${f.occurrence} D${f.detection} → RPN ${rpn(f)}. Symptoms: ${f.symptoms.join("; ")}. Mitigation: ${f.mitigation.join("; ")}.`,
  source: `Failure Analysis · ${f.id}`,
  followups: ["What is the riskiest failure mode?", "How does temperature affect life?"],
}));

const KB = [...TOPICS, ...partEntries, ...failureEntries];

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9×\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function findAnswer(question: string, ctx: CopilotContext): Entry | undefined {
  const q = question.toLowerCase();
  const tokens = new Set(tokenize(question));
  let best: { e: Entry; score: number } | undefined;
  for (const e of KB) {
    let score = 0;
    for (const k of e.keywords) {
      if (k.includes(" ") ? q.includes(k) : tokens.has(k)) score += k.length > 4 ? 2 : 1;
    }
    if (e.id.startsWith("fail-") && !/(fail|break|wear|why|detect|cause|degrad|imbalance|stall|crack|short)/.test(q))
      score -= 2;
    if (ctx.selectedPart && e.id === `part-${ctx.selectedPart}`) score += 0.5;
    if (!best || score > best.score) best = { e, score };
  }
  if (best && best.score >= 2) return best.e;
  if (ctx.selectedPart && /(this|selected|it|part|component|explain)/.test(q))
    return KB.find((e) => e.id === `part-${ctx.selectedPart}`);
  return undefined;
}

export const localProvider: CopilotProvider = {
  async respond(question, ctx) {
    await new Promise((r) => setTimeout(r, 350));
    const e = findAnswer(question, ctx);
    if (!e) {
      return {
        text: "I can explain components, physics, design decisions and failure causes for the axial fan system. Try asking about a part, an equation or why something fails.",
        sources: [],
        followups: ["Explain the affinity laws", "What does the shroud do?", "What is the riskiest failure mode?"],
      };
    }
    return {
      text: ctx.depth === "technical" ? e.technical : e.simple,
      equation: e.equation,
      sources: [e.source],
      followups: e.followups,
    };
  },
};
