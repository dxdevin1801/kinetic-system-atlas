export type LibraryCategory =
  | "Fundamentals"
  | "Fluid dynamics"
  | "Electromagnetics"
  | "Reliability"
  | "Design";

export interface Article {
  id: string;
  title: string;
  category: LibraryCategory;
  minutes: number;
  summary: string;
  body: { heading: string; text: string; equation?: string }[];
}

export const ARTICLES: Article[] = [
  {
    id: "fan-affinity-laws",
    title: "The Fan Affinity Laws",
    category: "Fluid dynamics",
    minutes: 6,
    summary: "Why doubling fan speed costs eight times the power — and how to use that to save energy.",
    body: [
      {
        heading: "The three laws",
        text: "For a geometrically similar fan moving air of constant density, flow scales with speed, pressure with speed squared, and power with speed cubed.",
        equation: "Q₂/Q₁ = N₂/N₁   ·   ΔP₂/ΔP₁ = (N₂/N₁)²   ·   P₂/P₁ = (N₂/N₁)³",
      },
      {
        heading: "Why it matters",
        text: "Running a fan at 80 % speed delivers 80 % of the airflow for only about 51 % of the power. Variable-speed control is often the single largest efficiency gain in an air system.",
      },
      {
        heading: "Limits",
        text: "The laws assume the system curve passes through the origin (pure friction). Systems with fixed static pressure — like a filter with a minimum pressure drop — deviate at low speed.",
      },
    ],
  },
  {
    id: "operating-point",
    title: "Fan Curves and the Operating Point",
    category: "Fluid dynamics",
    minutes: 5,
    summary: "A fan does not choose its airflow — the system does. Learn to read the intersection.",
    body: [
      {
        heading: "Two curves",
        text: "The fan curve falls from shut-off pressure to free delivery. The system curve rises with the square of flow because duct friction scales with velocity squared.",
        equation: "ΔP_system = K · Q²",
      },
      {
        heading: "Intersection",
        text: "Where the curves cross is where the fan will operate. Adding resistance (a clogged filter) steepens the system curve, pushing the point left toward lower flow and potentially into stall.",
      },
    ],
  },
  {
    id: "bldc-commutation",
    title: "How Brushless DC Motors Commutate",
    category: "Electromagnetics",
    minutes: 7,
    summary: "Electronic switching replaces brushes. Hall sensors tell the controller when.",
    body: [
      {
        heading: "Six-step switching",
        text: "Three phases are energised two at a time in six steps per electrical revolution. Each step pulls the magnet ring 60 electrical degrees forward.",
      },
      {
        heading: "Torque",
        text: "Torque is proportional to current, and back-EMF is proportional to speed. Their product is the mechanical power converted.",
        equation: "τ = k_t · I     ·     E = k_e · ω",
      },
    ],
  },
  {
    id: "bernoulli",
    title: "Bernoulli and Momentum Theory",
    category: "Fundamentals",
    minutes: 8,
    summary: "The two lenses through which every propeller, fan and turbine can be understood.",
    body: [
      {
        heading: "Energy along a streamline",
        text: "In steady, incompressible, frictionless flow, static pressure plus dynamic pressure is constant along a streamline.",
        equation: "p + ½ρv² = constant",
      },
      {
        heading: "Actuator disk",
        text: "Treating the rotor as a thin disk that adds a pressure jump lets us connect thrust to the velocity it imparts to the air.",
        equation: "T = ṁ · Δv = ρ A v · Δv",
      },
    ],
  },
  {
    id: "bearing-life",
    title: "Predicting Bearing Life",
    category: "Reliability",
    minutes: 6,
    summary: "L10 life, grease life and the temperature rules that dominate fan reliability.",
    body: [
      {
        heading: "L10 rating",
        text: "The L10 life is the number of revolutions 90 % of a population will survive. It falls with the cube of load for ball bearings.",
        equation: "L₁₀ = (C / P)³ × 10⁶ revolutions",
      },
      {
        heading: "Grease is the real limit",
        text: "In small fans, grease oxidation usually ends life before metal fatigue. A common rule: grease life halves for every 15 °C rise.",
      },
    ],
  },
  {
    id: "fmea",
    title: "FMEA in Practice",
    category: "Reliability",
    minutes: 5,
    summary: "Ranking failure risks with severity, occurrence and detection.",
    body: [
      {
        heading: "Risk priority number",
        text: "Each failure mode is scored 1–10 on severity, likelihood and how hard it is to detect. The product ranks where engineering effort should go first.",
        equation: "RPN = S × O × D",
      },
    ],
  },
  {
    id: "noise",
    title: "Where Fan Noise Comes From",
    category: "Design",
    minutes: 6,
    summary: "Tonal blade-pass noise, broadband turbulence and the tricks that quiet them.",
    body: [
      {
        heading: "Blade-pass frequency",
        text: "Each blade passing a strut creates a pressure pulse. The tone sits at blades × rpm / 60.",
        equation: "f_BPF = B · N / 60",
      },
      {
        heading: "Mitigation",
        text: "Co-prime blade and strut counts, forward sweep and generous rotor–strut spacing all reduce tonal noise.",
      },
    ],
  },
  {
    id: "dimensional-analysis",
    title: "Thinking in Dimensionless Numbers",
    category: "Fundamentals",
    minutes: 7,
    summary: "Reynolds, flow coefficient and pressure coefficient — scaling physics across sizes.",
    body: [
      {
        heading: "Reynolds number",
        text: "Compares inertial to viscous forces. Fan blades usually operate between 50,000 and 500,000, where transition effects matter.",
        equation: "Re = ρ U c / μ",
      },
      {
        heading: "Fan coefficients",
        text: "Flow and pressure coefficients collapse the performance of similar fans onto one curve regardless of size or speed.",
        equation: "φ = Q / (A·U)     ψ = ΔP / (ρU²)",
      },
    ],
  },
];
