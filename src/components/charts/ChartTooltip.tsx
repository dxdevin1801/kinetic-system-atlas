interface Item {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  units = {},
}: {
  active?: boolean;
  payload?: Item[];
  label?: string | number;
  labelFormatter?: (l: string | number) => string;
  units?: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      {label !== undefined && (
        <div className="mb-1 font-mono text-[10px] text-muted-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto font-mono tabular-nums text-foreground">
            {typeof p.value === "number" ? p.value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : p.value}
            {units[String(p.dataKey)] ? ` ${units[String(p.dataKey)]}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
