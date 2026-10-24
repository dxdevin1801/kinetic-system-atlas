import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Box, Layers } from "lucide-react";
import type { SystemDef } from "@/data/systems";
import { cn } from "@/lib/utils";

export function SystemCard({ system, priority = false }: { system: SystemDef; priority?: boolean }) {
  return (
    <Link
      to="/systems/$systemId"
      params={{ systemId: system.id }}
      className="panel edge-glow lift group relative block overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[inherit]">
        <img
          src={system.image}
          alt={system.name}
          width={1024}
          height={768}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="glass rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {system.domain}
          </span>
        </div>
        {system.interactive && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            <Box className="size-3" /> Live 3D
          </span>
        )}
      </div>
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold tracking-tight">{system.name}</h3>
            <p className="text-xs text-cyan">{system.tagline}</p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan" />
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{system.description}</p>
        <div className="mt-3 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="size-3" /> {system.components} parts
          </span>
          <span className="h-3 w-px bg-border" />
          <span
            className={cn(
              system.complexity === "Foundational" && "text-success",
              system.complexity === "Intermediate" && "text-gold",
              system.complexity === "Advanced" && "text-violet",
            )}
          >
            {system.complexity}
          </span>
        </div>
      </div>
    </Link>
  );
}
