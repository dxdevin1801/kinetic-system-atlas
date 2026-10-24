import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Box, Sparkles, Atom, Layers } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/layout/PageHeader";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { getSystem } from "@/data/systems";
import { useCopilot } from "@/store/copilot";

export const Route = createFileRoute("/systems/$systemId")({
  loader: ({ params }) => {
    const system = getSystem(params.systemId);
    if (!system) throw notFound();
    return { id: system.id, name: system.name, description: system.description };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} · SystemX` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.name} · SystemX` },
          { property: "og:description", content: loaderData.description },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "System unavailable · SystemX" }, { name: "robots", content: "noindex" }],
  }),
  component: SystemDetail,
});

function SystemDetail() {
  const { id } = Route.useLoaderData();
  const s = getSystem(id)!;
  const ask = useCopilot((st) => st.ask);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 md:px-8 md:py-8">
      <Link to="/systems" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All systems
      </Link>

      <section className="panel edge-glow grid overflow-hidden lg:grid-cols-2">
        <div className="relative aspect-[4/3] lg:aspect-auto">
          <img src={s.image} alt={s.name} width={1024} height={768} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60 max-lg:bg-gradient-to-t" />
        </div>
        <div className="flex flex-col justify-center gap-5 p-6 md:p-10">
          <div className="eyebrow">
            {s.domain} · {s.complexity}
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{s.name}</h1>
          <p className="leading-relaxed text-muted-foreground">{s.description}</p>
          <div className="flex flex-wrap gap-2">
            {s.interactive ? (
              <Button variant="glow" size="lg" asChild>
                <Link to="/lab">
                  <Box /> Open in 3D Lab
                </Link>
              </Button>
            ) : (
              <span className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm text-muted-foreground">
                3D model coming soon
              </span>
            )}
            <Button variant="glass" size="lg" onClick={() => ask(`How does the ${s.name.toLowerCase()} work?`)}>
              <Sparkles /> Ask Copilot
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Key specifications" bodyClassName="p-0">
          <dl className="divide-y divide-border text-sm">
            {s.specs.map((sp) => (
              <div key={sp.label} className="flex justify-between px-4 py-2.5">
                <dt className="text-muted-foreground">{sp.label}</dt>
                <dd className="font-mono text-[13px]">{sp.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="System breakdown" subtitle={`${s.components} components`}>
          <ul className="space-y-3">
            {s.subsystems.map((sub) => (
              <li key={sub.name}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Layers className="size-3.5 text-violet" /> {sub.name}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5 pl-5">
                  {sub.parts.map((p) => (
                    <span key={p} className="rounded-md border border-border bg-surface/50 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {p}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Governing principles">
          <ul className="space-y-2">
            {s.principles.map((p) => (
              <li key={p}>
                <button
                  onClick={() => ask(`Explain ${p.toLowerCase()}`)}
                  className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-hairline hover:bg-accent/40"
                >
                  <Atom className="size-3.5 text-gold" /> {p}
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Characteristic curve" subtitle={`${s.performanceLabel.y} vs ${s.performanceLabel.x}`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={s.performance} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="sys-perf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="x" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip labelFormatter={(l) => `${s.performanceLabel.x}: ${l}`} />} />
              <Area type="monotone" dataKey="y" name={s.performanceLabel.y} stroke="var(--violet)" strokeWidth={2} fill="url(#sys-perf)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
