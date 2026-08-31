import { Link, useLocation } from "react-router-dom";
import courtavaLogo from "@/assets/courtava-logo.png";
import { cn } from "@/lib/utils";
import { getActiveNavId, PRIMARY_NAV_ITEMS, UTILITY_NAV_ITEMS, type AppNavItem } from "./navigation";

function SidebarLink({ item, active }: { item: AppNavItem; active: boolean }) {
  const Icon = item.icon;

  if (item.create) {
    return (
      <Link
        to={item.to}
        aria-current={active ? "page" : undefined}
        className="ios-tap mt-2 flex h-12 w-[216px] items-center gap-3 rounded-2xl bg-primary px-3 font-semibold text-primary-foreground shadow-button outline-none transition-transform hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
          <Icon size={19} strokeWidth={2.3} />
        </span>
        <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
          {item.label} a game
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "ios-tap flex h-11 w-[216px] items-center gap-3 rounded-xl px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center">
        <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
      </span>
      <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
        {item.label}
      </span>
    </Link>
  );
}

export function DesktopSidebar() {
  const location = useLocation();
  const activeId = getActiveNavId(location.pathname);

  return (
    <aside className="group fixed bottom-4 left-4 top-4 z-40 hidden w-20 flex-col overflow-hidden rounded-3xl border border-sidebar-border bg-sidebar px-3 py-5 text-sidebar-foreground shadow-float transition-[width] duration-300 ease-out hover:w-60 focus-within:w-60 motion-reduce:transition-none lg:flex">
      <Link
        to="/"
        aria-label="Courtava home"
        className="mb-8 flex h-10 w-[216px] items-center gap-3 rounded-xl px-2 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <span className="flex h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-sidebar-border bg-white">
          <img src={courtavaLogo} alt="" className="h-full w-full object-cover" />
        </span>
        <span className="whitespace-nowrap text-xl font-extrabold tracking-[-0.03em] text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
          Courtava
        </span>
      </Link>

      <nav aria-label="Primary navigation" className="space-y-1">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <SidebarLink key={item.id} item={item} active={activeId === item.id} />
        ))}
      </nav>

      <nav aria-label="Account and support" className="mt-auto space-y-1 border-t border-sidebar-border pt-4">
        {UTILITY_NAV_ITEMS.map((item) => (
          <SidebarLink key={item.id} item={item} active={activeId === item.id} />
        ))}
      </nav>
    </aside>
  );
}
