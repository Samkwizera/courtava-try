import {
  Bell,
  CircleHelp,
  Home,
  Map,
  Plus,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type AppNavItem = {
  id: string;
  to: string;
  label: string;
  icon: LucideIcon;
  create?: boolean;
};

export const PRIMARY_NAV_ITEMS: AppNavItem[] = [
  { id: "home", to: "/", label: "Home", icon: Home },
  { id: "courts", to: "/courts", label: "Map", icon: Map },
  { id: "create", to: "/create-game", label: "Host", icon: Plus, create: true },
  { id: "games", to: "/games", label: "Feed", icon: Bell },
  { id: "profile", to: "/profile", label: "You", icon: UserRound },
];

export const UTILITY_NAV_ITEMS: AppNavItem[] = [
  { id: "settings", to: "/settings", label: "Settings", icon: Settings },
  { id: "support", to: "/support", label: "Help and support", icon: CircleHelp },
];

export function getActiveNavId(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/courts")) return "courts";
  if (pathname.startsWith("/create-game")) return "create";
  if (pathname.startsWith("/games")) return "games";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/support") || pathname.startsWith("/report-issue")) return "support";
  if (pathname.startsWith("/profile")) return "profile";
  return "";
}
