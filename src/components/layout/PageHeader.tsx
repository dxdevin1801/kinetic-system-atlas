import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <div className="eyebrow mb-2 flex items-center gap-2">
          <span className="h-px w-5 bg-cyan" />
          {eyebrow}
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("panel flex flex-col", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("flex-1 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  unit,
  tone = "cyan",
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "cyan" | "violet" | "gold" | "success" | "warning";
  hint?: string;
}) {
  const toneClass = {
    cyan: "text-cyan",
    violet: "text-violet",
    gold: "text-gold",
    success: "text-success",
    warning: "text-warning",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-surface/50 px-3 py-2.5">
      <div className="eyebrow !text-[10px]">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={cn("font-mono text-lg font-semibold tabular-nums", toneClass)}>{value}</span>
        {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Equation({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface/70 px-3 py-2.5">
      <div className="font-mono text-sm text-foreground">{children}</div>
      {caption && <div className="mt-1 text-xs text-muted-foreground">{caption}</div>}
    </div>
  );
}
