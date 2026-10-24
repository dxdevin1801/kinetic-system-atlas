import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Box, Compass, Gauge, Layers, Wind, Zap, Activity } from "lucide-react";
import { Area, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart } from "recharts";
import { Button } from "@/components/ui/button";
import { FanViewport } from "@/components/three/FanViewport";
import { SystemCard } from "@/components/systems/SystemCard";
import { Panel, Stat } from "@/components/layout/PageHeader";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { SYSTEMS } from "@/data/systems";
import { computeFan, curveSeries, DEFAULT_FAN_INPUTS } from "@/lib/physics/fan";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SystemX — Understand Everything as a System" },
      {
        name: "description",
        content: "Explore motors, fans, robots, EVs and rockets as interactive 3D systems with live physics.",
      },
      { property: "og:title", content: "SystemX — Understand Everything as a System" },
      {
        property: "og:description",
        content: "Explore motors, fans, robots, EVs and rockets as interactive 3D systems with live physics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const op = computeFan(DEFAULT_FAN_INPUTS);
const TONE_TEXT = { cyan: "text-cyan", gold: "text-gold", violet: "text-violet", success: "text-success" } as const;
const curve = curveSeries(DEFAULT_FAN_INPUTS, 30);

const RECENT = [
  { id: "#128", name: "Spin-up · 75 % duty", system: "Axial Fan", result: "3,594 rpm", status: "ok" },
  { id: "#127", name: "Clogged filter sweep", system: "Axial Fan", result: "Stall @ K=9.4k", status: "warn" },
  { id: "#126", name: "Bearing wear +200 %", system: "Axial Fan", result: "+18 °C", status: "warn" },
  { id: "#125", name: "Torque–speed map", system: "Electric Motor", result: "η 95.2 %", status: "ok" },
];

const HEALTH = [
  { label: "Aerodynamic efficiency", value: 61, tone: "bg-cyan" },
  { label: "Bearing life remaining", value: 82, tone: "bg-success" },
  { label: "Winding thermal margin", value: 47, tone: "bg-gold" },
  { label: "Stall margin", value: 68, tone: "bg-violet" },
];

function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8 px-4 py-6 md:px-8 md:py-8">
      {/* Hero */}
      <section className="panel edge-glow relative overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="p-6 md:p-10">
            <div className="eyebrow mb-4 flex items-center gap-2">
              <span className="size-1.5 animate-pulse-soft rounded-full bg-cyan" />
              Engineering intelligence platform
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl xl:text-6xl">
              <span className="text-gradient">Understand Everything</span>
              <br />
              <span className="text-foreground">as a System.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
              Take machines apart in 3D, follow the physics that drives every component, and see how a single change
              ripples through the whole design.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="glow" size="lg" asChild>
                <Link to="/systems">
                  <Compass /> Explore Systems
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/lab">
                  <Box /> Open 3D Lab
                </Link>
              </Button>
            </div>
            <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-5">
              {[
                ["5", "Systems"],
                ["138", "Components"],
                ["24", "Equations"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="eyebrow !text-[10px]">{l}</dt>
                  <dd className="mt-1 font-mono text-xl font-semibold text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative h-[340px] md:h-[440px]">
            <FanViewport variant="preview" />
            <div className="glass absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 md:left-auto md:w-72">
              <div>
                <div className="eyebrow !text-[10px]">Live · Axial Cooling Fan</div>
                <div className="mt-0.5 font-mono text-sm">
                  <span className="text-cyan">{Math.round(op.flow * 1000)}</span>
                  <span className="text-muted-foreground"> L/s · </span>
                  <span className="text-gold">{Math.round(op.pressure)}</span>
                  <span className="text-muted-foreground"> Pa</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild aria-label="Open fan in 3D Lab">
                <Link to="/lab">
                  <ArrowRight className="text-cyan" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Wind, label: "Airflow", value: Math.round(op.flow * 1000).toString(), unit: "L/s", tone: "cyan" as const },
          { icon: Gauge, label: "Static pressure", value: Math.round(op.pressure).toString(), unit: "Pa", tone: "gold" as const },
          { icon: Zap, label: "Input power", value: op.electricalPower.toFixed(1), unit: "W", tone: "violet" as const },
          { icon: Activity, label: "Fan efficiency", value: (op.fanEfficiency * 100).toFixed(0), unit: "%", tone: "success" as const },
        ].map((k) => (
          <div key={k.label} className="panel group flex items-center gap-3 p-4 transition-colors hover:border-hairline">
            <span className="grid size-10 place-items-center rounded-xl bg-surface-2 transition-transform duration-300 group-hover:scale-105">
              <k.icon className={cn("size-5", TONE_TEXT[k.tone])} />
            </span>
            <Stat label={k.label} value={k.value} unit={k.unit} tone={k.tone} />
          </div>
        ))}
      </section>

      {/* Systems */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="eyebrow">Library of systems</div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Featured systems</h2>
          </div>
          <Link to="/systems" className="flex items-center gap-1 text-sm text-cyan hover:underline">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SYSTEMS.map((s, i) => (
            <SystemCard key={s.id} system={s} priority={i < 2} />
          ))}
        </div>
      </section>

      {/* Analytics row */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Fan performance map"
          subtitle="Pressure and efficiency versus airflow at 3,000 rpm"
          action={
            <Link to="/physics" className="text-xs text-cyan hover:underline">
              Open physics →
            </Link>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={curve} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="dash-fan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="q" tickLine={false} axisLine={false} unit=" L/s" minTickGap={30} />
                <YAxis yAxisId="p" tickLine={false} axisLine={false} />
                <YAxis yAxisId="e" orientation="right" tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip units={{ fan: "Pa", system: "Pa", efficiency: "%" }} labelFormatter={(l) => `${l} L/s`} />} />
                <Area yAxisId="p" type="monotone" dataKey="fan" name="Fan curve" stroke="var(--cyan)" strokeWidth={2} fill="url(#dash-fan)" />
                <Line yAxisId="p" type="monotone" dataKey="system" name="System" stroke="var(--gold)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line yAxisId="e" type="monotone" dataKey="efficiency" name="Efficiency" stroke="var(--violet)" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="grid gap-4">
          <Panel title="System health" subtitle="Cooling Fan Rig · SX-201">
            <ul className="space-y-3">
              {HEALTH.map((h) => (
                <li key={h.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{h.label}</span>
                    <span className="font-mono">{h.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className={cn("h-full rounded-full transition-all duration-700", h.tone)} style={{ width: `${h.value}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel
            title="Recent simulations"
            action={
              <Link to="/simulations" className="text-xs text-cyan hover:underline">
                Run new →
              </Link>
            }
            bodyClassName="p-0"
          >
            <table className="w-full text-sm">
              <tbody>
                {RECENT.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 transition-colors hover:bg-accent/30">
                    <td className="py-2.5 pl-4 font-mono text-[11px] text-muted-foreground">{r.id}</td>
                    <td className="py-2.5">
                      <div className="text-[13px]">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground">{r.system}</div>
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <span
                        className={cn(
                          "font-mono text-xs",
                          r.status === "ok" ? "text-success" : "text-warning",
                        )}
                      >
                        {r.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </section>

      <section className="panel flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <span className="grid size-11 place-items-center rounded-xl bg-surface-2">
            <Layers className="size-5 text-gold" />
          </span>
          <div>
            <div className="font-semibold">Trace a change through the whole fan</div>
            <div className="text-sm text-muted-foreground">
              Raise bearing friction and watch temperature, power and noise respond across the dependency graph.
            </div>
          </div>
        </div>
        <Button variant="glass" asChild>
          <Link to="/architecture">
            Open architecture <ArrowRight />
          </Link>
        </Button>
      </section>
    </div>
  );
}

