import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Check,
  ChevronsUpDown,
  FolderKanban,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Activity,
  ShieldAlert,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommandSearch } from "./CommandSearch";
import { PROJECTS, useApp, useNotices } from "@/store/app";
import { SystemXMark } from "@/components/brand/SystemXLogo";
import { cn } from "@/lib/utils";

const kindIcon = { sim: Activity, failure: ShieldAlert, system: Cpu } as const;

function Notifications() {
  const { items, markAll, mark } = useNotices();
  const unread = items.filter((i) => !i.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unread} unread)`}>
          <Bell className="transition-transform duration-300 hover:rotate-12" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="glass w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          <button onClick={markAll} className="text-xs text-cyan hover:underline">
            Mark all read
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto scrollbar-thin">
          {items.map((n) => {
            const Icon = kindIcon[n.kind];
            return (
              <li key={n.id}>
                <button
                  onClick={() => mark(n.id)}
                  className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-surface-2",
                      n.kind === "failure" ? "text-warning" : n.kind === "sim" ? "text-cyan" : "text-violet",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {n.title}
                      {!n.read && <span className="size-1.5 rounded-full bg-cyan" />}
                    </span>
                    <span className="block text-xs text-muted-foreground">{n.body}</span>
                    <span className="mt-1 block font-mono text-[10px] text-muted-foreground/70">{n.time}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function ProjectSelector() {
  const projectId = useApp((s) => s.projectId);
  const setProject = useApp((s) => s.setProject);
  const current = PROJECTS.find((p) => p.id === projectId) ?? PROJECTS[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="glass" size="sm" className="hidden h-9 gap-2 rounded-lg md:inline-flex">
          <FolderKanban className="text-gold" />
          <span className="max-w-36 truncate">{current.name}</span>
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="glass w-60">
        <DropdownMenuLabel className="eyebrow">Projects</DropdownMenuLabel>
        {PROJECTS.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onSelect={() => {
              setProject(p.id);
              toast.success(`Switched to ${p.name}`);
            }}
          >
            <span className="flex-1">{p.name}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{p.code}</span>
            {p.id === current.id && <Check className="text-cyan" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const theme = useApp((s) => s.theme);
  const set = useApp((s) => s.set);
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-hairline focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="size-8">
            <AvatarFallback className="bg-gold-gradient text-xs font-semibold text-primary-foreground">RS</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass w-56">
        <DropdownMenuLabel>
          <div className="text-sm font-semibold">Rohit Shahu</div>
          <div className="text-xs font-normal text-muted-foreground">Systems Engineer</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
          <User /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
          <Settings /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => set({ theme: theme === "dark" ? "light" : "dark" })}>
          {theme === "dark" ? <Sun /> : <Moon />} {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast("Sign-in isn't set up yet — this is a demo workspace.")}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/70 px-3 backdrop-blur-xl md:px-5">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Link to="/" className="md:hidden" aria-label="SystemX home">
        <SystemXMark className="size-7" />
      </Link>
      <div className="mx-1 hidden h-5 w-px bg-border md:block" />
      <ProjectSelector />
      <button
        onClick={() => setSearchOpen(true)}
        className="group ml-auto flex h-9 w-full max-w-md items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-3 text-sm text-muted-foreground transition-all hover:border-hairline md:ml-4"
      >
        <Search className="size-4 transition-colors group-hover:text-cyan" />
        <span className="truncate">Search systems, components, equations…</span>
        <kbd className="ml-auto hidden rounded border border-border bg-surface-2 px-1.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-1 md:ml-2">
        <Notifications />
        <UserMenu />
      </div>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
