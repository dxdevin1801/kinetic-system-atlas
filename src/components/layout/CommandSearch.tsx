import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Box, Cpu, FileText, Sparkles } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV_FOOTER, NAV_MAIN } from "./nav";
import { SYSTEMS } from "@/data/systems";
import { PARTS } from "@/data/fan";
import { ARTICLES } from "@/data/library";
import { useLab } from "@/store/lab";
import { useCopilot } from "@/store/copilot";

export function CommandSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, systems, components, articles…" />
      <CommandList className="scrollbar-thin">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {[...NAV_MAIN, ...NAV_FOOTER].map((n) => (
            <CommandItem key={n.to} value={`page ${n.title} ${n.description}`} onSelect={() => go(() => navigate({ to: n.to }))}>
              <n.icon className="text-cyan" />
              <span>{n.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{n.description}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Systems">
          {SYSTEMS.map((s) => (
            <CommandItem
              key={s.id}
              value={`system ${s.name} ${s.domain}`}
              onSelect={() => go(() => navigate({ to: "/systems/$systemId", params: { systemId: s.id } }))}
            >
              <Cpu className="text-violet" />
              <span>{s.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{s.domain}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Fan components">
          {Object.values(PARTS).map((p) => (
            <CommandItem
              key={p.id}
              value={`component ${p.name} ${p.subsystem} ${p.material}`}
              onSelect={() =>
                go(() => {
                  useLab.getState().select(p.id);
                  navigate({ to: "/lab" });
                })
              }
            >
              <Box className="text-gold" />
              <span>{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{p.subsystem}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Library">
          {ARTICLES.map((a) => (
            <CommandItem
              key={a.id}
              value={`article ${a.title} ${a.category}`}
              onSelect={() => go(() => navigate({ to: "/library", search: { article: a.id } }))}
            >
              <FileText />
              <span>{a.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{a.minutes} min</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Copilot">
          <CommandItem value="ask copilot assistant help" onSelect={() => go(() => useCopilot.getState().setOpen(true))}>
            <Sparkles className="text-cyan" />
            <span>Ask SystemX Copilot</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
