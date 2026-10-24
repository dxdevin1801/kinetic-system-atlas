import { useState } from "react";
import { Box, Boxes, ChevronRight, Cpu, Layers } from "lucide-react";
import { FAN_TREE, type NodeType, type PartId, type TreeNode } from "@/data/fan";
import { useLab } from "@/store/lab";
import { cn } from "@/lib/utils";

const ICONS: Record<NodeType, typeof Box> = {
  system: Cpu,
  subsystem: Layers,
  assembly: Boxes,
  component: Box,
};

function Node({ node, depth }: { node: TreeNode; depth: number }) {
  const selected = useLab((s) => s.selectedNode);
  const hovered = useLab((s) => s.hovered);
  const select = useLab((s) => s.select);
  const hover = useLab((s) => s.hover);
  const [open, setOpen] = useState(true);
  const Icon = ICONS[node.type];
  const hasChildren = !!node.children?.length;
  const isSel = selected === node.id;
  const isHover = node.type === "component" && hovered === node.id;

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-lg pr-2 transition-colors",
          isSel ? "bg-accent text-foreground shadow-[inset_2px_0_0_var(--cyan)]" : "hover:bg-accent/50",
          isHover && !isSel && "bg-accent/40",
        )}
        style={{ paddingLeft: depth * 12 + 4 }}
        onMouseEnter={() => node.type === "component" && hover(node.id as PartId)}
        onMouseLeave={() => node.type === "component" && hover(null)}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn("grid size-5 place-items-center text-muted-foreground", !hasChildren && "invisible")}
          aria-label={open ? `Collapse ${node.label}` : `Expand ${node.label}`}
          aria-expanded={open}
        >
          <ChevronRight className={cn("size-3.5 transition-transform duration-200", open && "rotate-90")} />
        </button>
        <button
          type="button"
          onClick={() => select(node.id)}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-[13px]"
        >
          <Icon
            className={cn(
              "size-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110",
              node.type === "system" && "text-gold",
              node.type === "subsystem" && "text-violet",
              node.type === "assembly" && "text-cyan",
              node.type === "component" && (isSel ? "text-cyan" : "text-muted-foreground"),
            )}
          />
          <span className={cn("truncate", node.type !== "component" && "font-medium")}>{node.label}</span>
          {hasChildren && (
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{node.children!.length}</span>
          )}
        </button>
      </div>
      {hasChildren && open && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children!.map((c) => (
            <Node key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ComponentTree() {
  return (
    <ul className="space-y-0.5">
      <Node node={FAN_TREE} depth={0} />
    </ul>
  );
}
