import { cn } from "@/lib/utils";

export function SystemXMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("text-cyan", className)} aria-hidden="true">
      <defs>
        <linearGradient id="sx-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--cyan)" />
          <stop offset="1" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="none" stroke="url(#sx-g)" strokeOpacity="0.55" />
      <g
        style={animated ? { transformOrigin: "20px 20px", animation: "logo-orbit 2.4s linear infinite" } : undefined}
      >
        <path d="M12 12 L28 28 M28 12 L12 28" stroke="url(#sx-g)" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      <circle cx="20" cy="20" r="3" fill="var(--gold)" />
    </svg>
  );
}

export function SystemXLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <SystemXMark className="size-8 shrink-0" />
      <span className="font-display text-[1.05rem] font-semibold tracking-tight text-foreground">
        System<span className="text-cyan">X</span>
      </span>
    </span>
  );
}
