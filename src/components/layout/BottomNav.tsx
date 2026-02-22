import { Home, MapPin, Plus, Users, User } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const leftNavItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/courts", icon: MapPin, label: "Courts" },
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
          "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div
          className={cn(
            "p-1.5 rounded-lg transition-all duration-200",
            isActive && "bg-secondary"
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5 transition-transform duration-200",
              isActive && "scale-110"
            )}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </div>
        <span className={cn(
          "text-[10px] font-medium transition-colors",
          isActive && "font-semibold"
        )}>
          {item.label}
        </span>
      </NavLink>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass shadow-nav safe-bottom border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {leftNavItems.map(renderNavItem)}

        {/* Center + button */}
        <button
          onClick={() => navigate("/create-game")}
          className="flex items-center justify-center -mt-5 w-14 h-14 rounded-full bg-foreground text-background shadow-lg hover:opacity-90 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>

        {rightNavItems.map(renderNavItem)}
      </div>
    </nav>
  );
}
