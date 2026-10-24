import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { BackgroundParticles } from "./BackgroundParticles";
import { CopilotPanel } from "@/components/copilot/CopilotPanel";
import { Toaster } from "@/components/ui/sonner";
import { useApp } from "@/store/app";

function useSettingsEffects() {
  const theme = useApp((s) => s.theme);
  const reduceMotion = useApp((s) => s.reduceMotion);
  useEffect(() => {
    void useApp.persist.rehydrate();
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);
}

export function AppShell({ children }: { children: ReactNode }) {
  useSettingsEffects();
  const particles = useApp((s) => s.particles);
  const reduceMotion = useApp((s) => s.reduceMotion);
  const theme = useApp((s) => s.theme);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-hero">
        {mounted && particles && !reduceMotion && <BackgroundParticles />}
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-transparent">
          <TopBar />
          <main key={path} className="min-w-0 flex-1 animate-fade-up">
            {children}
          </main>
        </SidebarInset>
        <CopilotPanel />
        <Toaster theme={theme} position="bottom-left" />
      </div>
    </SidebarProvider>
  );
}
