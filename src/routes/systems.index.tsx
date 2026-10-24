import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SystemCard } from "@/components/systems/SystemCard";
import { SYSTEMS, type Domain } from "@/data/systems";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/systems/")({
  head: () => ({
    meta: [
      { title: "Explore Systems · SystemX" },
      { name: "description", content: "Browse electromechanical, fluid, robotic, mobility and aerospace systems." },
      { property: "og:title", content: "Explore Systems · SystemX" },
      { property: "og:description", content: "Browse electromechanical, fluid, robotic, mobility and aerospace systems." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SystemsPage,
});

const DOMAINS: ("All" | Domain)[] = ["All", "Electromechanical", "Fluid", "Robotics", "Mobility", "Aerospace"];

function SystemsPage() {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<(typeof DOMAINS)[number]>("All");
  const [live, setLive] = useState(false);

  const list = useMemo(
    () =>
      SYSTEMS.filter(
        (s) =>
          (domain === "All" || s.domain === domain) &&
          (!live || s.interactive) &&
          `${s.name} ${s.description} ${s.tagline}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, domain, live],
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        eyebrow="Explore"
        title="Systems library"
        description="Every system is broken down into subsystems, assemblies and parts — with the physics that connects them."
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 focus-within:border-hairline">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter systems…"
            className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Filter systems"
          />
        </div>
        <button
          onClick={() => setLive((v) => !v)}
          aria-pressed={live}
          className={cn(
            "h-10 rounded-xl border px-3 text-sm transition-colors",
            live ? "border-hairline bg-primary/15 text-cyan" : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Live 3D only
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => setDomain(d)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-all",
              domain === d
                ? "border-hairline bg-accent text-foreground"
                : "border-border text-muted-foreground hover:border-hairline hover:text-foreground",
            )}
          >
            {d}
          </button>
        ))}
      </div>
      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <SystemCard key={s.id} system={s} />
          ))}
        </div>
      ) : (
        <div className="panel grid place-items-center p-12 text-sm text-muted-foreground">No systems match those filters.</div>
      )}
    </div>
  );
}
