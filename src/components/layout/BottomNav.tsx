import { Home, Map, Plus, Users, User } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const leftNavItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/courts", icon: Map, label: "Courts" },
];

const rightNavItems = [
  { to: "/players", icon: Users, label: "Players" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const renderNavItem = (item: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === item.to;
    const Icon = item.icon;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={cn(
          "flex flex-col items-center justify-center flex-1 py-2 transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-primary"
        )}
      >
        <Icon
          className="w-6 h-6"
          strokeWidth={isActive ? 2.5 : 1.5}
        />
      </NavLink>
    );
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-sm">
      <div className="flex items-center justify-around h-16 bg-card rounded-2xl shadow-xl border border-border/50">
        {leftNavItems.map(renderNavItem)}

        {/* Center create button - raised black circle */}
        <div className="flex flex-col items-center justify-center flex-1">
          <button
            onClick={() => navigate("/create-game")}
            className="-mt-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </div>

        {rightNavItems.map(renderNavItem)}
      </div>
    </nav>
  );
}
