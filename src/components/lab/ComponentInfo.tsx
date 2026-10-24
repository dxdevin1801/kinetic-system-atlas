import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Equation, Stat } from "@/components/layout/PageHeader";
import { findNode, PARTS, type PartId } from "@/data/fan";
import { FAILURES, rpn } from "@/data/failures";
import { computeFan, DEFAULT_FAN_INPUTS } from "@/lib/physics/fan";
import { useLab } from "@/store/lab";
import { useCopilot } from "@/store/copilot";
import { cn } from "@/lib/utils";

function rpnTone(v: number) {
  return v >= 200 ? "text-destructive" : v >= 120 ? "text-warning" : "text-success";
}

export function ComponentInfo() {
  const selected = useLab((s) => s.selectedNode);
  const rpm = useLab((s) => s.rpm);
  const ask = useCopilot((s) => s.ask);
  const node = findNode(selected);
  const part = selected in PARTS ? PARTS[selected as PartId] : undefined;
  const out = computeFan({ ...DEFAULT_FAN_INPUTS, rpm });
  const partIds = node?.partIds ?? (Object.keys(PARTS) as PartId[]);
  const failures = FAILURES.filter((f) => partIds.includes(f.part));

  const title = part?.name ?? node?.label ?? "Axial Cooling Fan";
  const kind = node?.type ?? "system";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <div className="eyebrow !text-[10px]">
          {kind}
          {part && ` · ${part.subsystem}`}
        </div>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-cyan">
          {part?.role ?? `${partIds.length} parts · select any to inspect`}
        </p>
      </div>

      <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-4 mt-3 grid grid-cols-3 bg-surface-2/60">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="physics">Physics</TabsTrigger>
          <TabsTrigger value="failure">Failure</TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
          <TabsContent value="overview" className="mt-3 space-y-4">
            {part ? (
              <>
                <p className="text-sm leading-relaxed text-muted-foreground">{part.description}</p>
                <dl className="divide-y divide-border rounded-xl border border-border text-sm">
                  {[
                    { label: "Material", value: part.material },
                    { label: "Mass", value: part.mass },
                    ...part.specs,
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between gap-3 px-3 py-2">
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd className="text-right font-mono text-[12px]">{s.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
                  <div className="eyebrow !text-[10px] !text-gold">Design decision</div>
                  <p className="mt-1 text-[13px] leading-relaxed">{part.designNote}</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {kind === "system"
                    ? "A 200 mm axial fan with an outer-rotor brushless motor. Click any part in the scene or tree to inspect it."
                    : `This ${kind} groups ${partIds.length} parts that work together. Select one to see its specifications.`}
                </p>
                <ul className="space-y-1.5">
                  {partIds.map((id) => (
                    <li key={id}>
                      <button
                        onClick={() => useLab.getState().select(id)}
                        className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-hairline hover:bg-accent/40"
                      >
                        <span>{PARTS[id].name}</span>
                        <span className="text-[11px] text-muted-foreground">{PARTS[id].material.split(",")[0]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </TabsContent>

          <TabsContent value="physics" className="mt-3 space-y-3">
            {part?.equation && <Equation caption={part.equation.caption}>{part.equation.tex}</Equation>}
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Tip speed" value={out.tipSpeed.toFixed(1)} unit="m/s" />
              <Stat label="Torque" value={(out.torque * 1000).toFixed(0)} unit="mN·m" tone="violet" />
              <Stat label="Airflow" value={(out.flow * 1000).toFixed(0)} unit="L/s" />
              <Stat label="Pressure" value={out.pressure.toFixed(0)} unit="Pa" tone="gold" />
              <Stat label="Blade-pass" value={((7 * rpm) / 60).toFixed(0)} unit="Hz" tone="violet" />
              <Stat label="Reynolds" value={(out.reynolds / 1000).toFixed(0)} unit="×10³" tone="success" />
            </div>
            <p className="text-xs text-muted-foreground">
              Values update with the speed slider. Explore every equation and graph on the Physics page.
            </p>
            <Button variant="glass" size="sm" asChild className="w-full">
              <Link to="/physics">
                Open physics panel <ArrowRight />
              </Link>
            </Button>
          </TabsContent>

          <TabsContent value="failure" className="mt-3 space-y-2">
            {failures.length === 0 && <p className="text-sm text-muted-foreground">No recorded failure modes.</p>}
            {failures.map((f) => (
              <div key={f.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{f.mode}</span>
                  <span className={cn("font-mono text-xs", rpnTone(rpn(f)))}>RPN {rpn(f)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{f.cause}</p>
              </div>
            ))}
            <Button variant="glass" size="sm" asChild className="w-full">
              <Link to="/failure-analysis">
                Full failure analysis <ArrowRight />
              </Link>
            </Button>
          </TabsContent>
        </div>
      </Tabs>

      <div className="border-t border-border p-3">
        <Button variant="glow" className="w-full" onClick={() => ask(`Explain the ${title.replace(" ×7", "").toLowerCase()}`)}>
          <Sparkles /> Ask Copilot about {title.replace(" ×7", "")}
        </Button>
      </div>
    </div>
  );
}
