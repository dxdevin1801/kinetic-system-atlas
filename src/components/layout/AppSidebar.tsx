import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SystemXLogo, SystemXMark } from "@/components/brand/SystemXLogo";
import { NAV_FOOTER, NAV_MAIN, type NavItem } from "./nav";
import { cn } from "@/lib/utils";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.title}
        className={cn(
          "group/nav h-10 rounded-lg transition-all duration-300",
          "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_2px_0_0_var(--cyan)]",
        )}
      >
        <Link to={item.to} onClick={() => setOpenMobile(false)}>
          <item.icon
            className={cn(
              "transition-transform duration-300 group-hover/nav:scale-110",
              active ? "text-cyan" : "text-muted-foreground group-hover/nav:text-foreground",
            )}
          />
          <span className="font-medium">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border backdrop-blur-xl">
      <SidebarHeader className="h-16 justify-center px-3">
        <Link to="/" className="flex items-center" aria-label="SystemX home">
          {state === "collapsed" ? <SystemXMark className="size-8" /> : <SystemXLogo />}
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-1.5">
        <SidebarGroup>
          <SidebarGroupLabel className="eyebrow">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_MAIN.map((item) => (
                <NavLink key={item.to} item={item} active={isActive(item.to)} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-1.5 pb-3">
        <SidebarMenu>
          {NAV_FOOTER.map((item) => (
            <NavLink key={item.to} item={item} active={isActive(item.to)} />
          ))}
        </SidebarMenu>
        {state !== "collapsed" && (
          <div className="mx-1 mt-2 rounded-xl border border-border bg-surface-2/50 p-3">
            <div className="flex items-center gap-2">
              <span className="size-1.5 animate-pulse-soft rounded-full bg-success" />
              <span className="font-mono text-[11px] text-muted-foreground">Engine v0.9 · all systems nominal</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
