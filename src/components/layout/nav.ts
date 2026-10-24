import {
  LayoutDashboard,
  Compass,
  Box,
  Sigma,
  Network,
  Activity,
  ShieldAlert,
  BookOpen,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  to:
    | "/"
    | "/systems"
    | "/lab"
    | "/physics"
    | "/architecture"
    | "/simulations"
    | "/failure-analysis"
    | "/library"
    | "/settings";
  icon: LucideIcon;
  description: string;
}

export const NAV_MAIN: NavItem[] = [
  { title: "Dashboard", to: "/", icon: LayoutDashboard, description: "Overview and systems" },
  { title: "Explore Systems", to: "/systems", icon: Compass, description: "Browse engineered systems" },
  { title: "3D Lab", to: "/lab", icon: Box, description: "Interactive fan workspace" },
  { title: "Physics", to: "/physics", icon: Sigma, description: "Equations and live calculations" },
  { title: "Architecture", to: "/architecture", icon: Network, description: "Dependency graph" },
  { title: "Simulations", to: "/simulations", icon: Activity, description: "Transient spin-up model" },
  { title: "Failure Analysis", to: "/failure-analysis", icon: ShieldAlert, description: "FMEA and reliability" },
  { title: "Library", to: "/library", icon: BookOpen, description: "Articles and references" },
];

export const NAV_FOOTER: NavItem[] = [
  { title: "Settings", to: "/settings", icon: Settings, description: "Theme and preferences" },
];
