import { createFileRoute } from "@tanstack/react-router";
import { Expand, Pause, Play, RotateCcw, Wind } from "lucide-react";
import { FanViewport } from "@/components/three/FanViewport";
import { ComponentTree } from "@/components/lab/ComponentTree";
import { ComponentInfo } from "@/components/lab/ComponentInfo";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLab, type ViewPreset } from "@/store/lab";
import { PARTS } from "@/data/fan";
import { computeFan, DEFAULT_FAN_INPUTS } from "@/lib/physics/fan";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "3D Lab — Axial Fan Explorer · SystemX" },
      {
        name: "description",
        content: "Orbit, explode and inspect every component of an axial cooling fan with live airflow and physics.",
      },
      { property: "og:title", content: "3D Lab — Axial Fan Explorer · SystemX" },
      {
        property: "og:description",
        content: "Orbit, explode and inspect every component of an axial cooling fan with live airflow and physics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LabPage,
});

const VIEW_LABELS: { id: ViewPreset; label: string }[] = [
  { id: "iso", label: "Iso" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "rear", label: "Rear" },
];

function ToolButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            "grid size-9 place-items-center rounded-lg border transition-all duration-300",
            active
              ? "border-hairline bg-primary/15 text-cyan shadow-glow"
              : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Toolbar() {
  const lab = useLab();
  return (
    <div className="glass absolute left-3 right-3 top-3 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-3 py-2">
      <div className="flex items-center gap-1">
        <ToolButton label={lab.spinning ? "Pause rotation" : "Start rotation"} active={lab.spinning} onClick={lab.toggleSpin}>
          {lab.spinning ? <Pause className="size-4" /> : <Play className="size-4" />}
        </ToolButton>
        <ToolButton label="Airflow particles" active={lab.airflow} onClick={lab.toggleAirflow}>
          <Wind className="size-4" />
        </ToolButton>
        <ToolButton
          label={lab.exploded > 0.5 ? "Assemble" : "Exploded view"}
          active={lab.exploded > 0.5}
          onClick={() => lab.setExploded(lab.exploded > 0.5 ? 0 : 1)}
        >
          <Expand className="size-4" />
        </ToolButton>
        <ToolButton
          label="Reset view"
          onClick={() => {
            lab.setExploded(0);
            lab.setView("iso");
            lab.select("fan");
          }}
        >
          <RotateCcw className="size-4" />
        </ToolButton>
      </div>

      <label className="flex min-w-40 flex-1 items-center gap-3">
        <span className="eyebrow !text-[10px] whitespace-nowrap">Explode</span>
        <Slider
          value={[lab.exploded * 100]}
          onValueChange={([v]) => lab.setExploded(v / 100)}
          max={100}
          step={1}
          aria-label="Exploded view amount"
        />
        <span className="w-9 text-right font-mono text-[11px] text-muted-foreground">{Math.round(lab.exploded * 100)}%</span>
      </label>

      <label className="flex min-w-48 flex-1 items-center gap-3">
        <span className="eyebrow !text-[10px] whitespace-nowrap">Speed</span>
        <Slider
          value={[lab.rpm]}
          onValueChange={([v]) => lab.setRpm(v)}
          min={0}
          max={6000}
          step={50}
          aria-label="Fan speed in rpm"
        />
        <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">{lab.rpm} rpm</span>
      </label>

      <div className="flex rounded-lg border border-border p-0.5">
        {VIEW_LABELS.map((v) => (
          <button
            key={v.id}
            onClick={() => lab.setView(v.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs transition-colors",
              lab.view === v.id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Readouts() {
  const rpm = useLab((s) => s.rpm);
  const spinning = useLab((s) => s.spinning);
  const hovered = useLab((s) => s.hovered);
  const o = computeFan({ ...DEFAULT_FAN_INPUTS, rpm: spinning ? rpm : 0 });
  const items = [
    { k: "Speed", v: spinning ? rpm.toLocaleString() : "0", u: "rpm" },
    { k: "Airflow", v: (o.flow * 1000).toFixed(0), u: "L/s" },
    { k: "Pressure", v: o.pressure.toFixed(0), u: "Pa" },
    { k: "Power", v: o.electricalPower.toFixed(1), u: "W" },
    { k: "Efficiency", v: (o.fanEfficiency * 100).toFixed(0), u: "%" },
  ];
  return (
    <>
      {hovered && (
        <div className="glass pointer-events-none absolute left-3 top-24 z-10 rounded-lg px-3 py-1.5 text-xs md:top-[4.5rem]">
          <span className="text-muted-foreground">Hover · </span>
          <span className="font-medium text-cyan">{PARTS[hovered].name}</span>
        </div>
      )}
      <div className="glass absolute bottom-3 left-3 right-3 z-10 grid grid-cols-3 gap-px overflow-hidden rounded-xl sm:grid-cols-5">
        {items.map((i) => (
          <div key={i.k} className="px-3 py-2">
            <div className="eyebrow !text-[9px]">{i.k}</div>
            <div className="font-mono text-sm tabular-nums">
              <span className="text-foreground">{i.v}</span>
              <span className="text-muted-foreground"> {i.u}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function LabPage() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-3 p-3 lg:h-[calc(100vh-4rem)] lg:flex-row">
        <aside className="panel order-2 flex max-h-[420px] flex-col lg:order-1 lg:max-h-none lg:w-64 xl:w-72">
          <div className="border-b border-border px-4 py-3">
            <div className="eyebrow !text-[10px]">Component explorer</div>
            <div className="mt-0.5 text-sm font-semibold">System hierarchy</div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            <ComponentTree />
          </div>
          <div className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
            Drag to orbit · Right-drag to pan · Scroll to zoom
          </div>
        </aside>

        <section className="relative order-1 h-[62vh] min-h-[440px] overflow-hidden rounded-xl border border-border lg:order-2 lg:h-auto lg:flex-1">
          <FanViewport variant="lab" />
          <Toolbar />
          <Readouts />
        </section>

        <aside className="panel order-3 flex min-h-[480px] flex-col overflow-hidden lg:min-h-0 lg:w-80 xl:w-[22rem]">
          <ComponentInfo />
        </aside>
      </div>
    </TooltipProvider>
  );
}
