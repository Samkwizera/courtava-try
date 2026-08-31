import { motion, useReducedMotion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { haptic } from "@/lib/haptics";
import { C } from "@/lib/tokens";
import { getActiveNavId, PRIMARY_NAV_ITEMS, type AppNavItem } from "./navigation";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const activeId = getActiveNavId(location.pathname);

  const go = (tab: AppNavItem) => {
    haptic(tab.create ? "success" : "selection");
    navigate(tab.to);
  };

  return (
    <nav aria-label="Primary navigation" style={{
      position: "fixed", bottom: "max(16px, env(safe-area-inset-bottom))", left: "50%",
      transform: "translateX(-50%)", zIndex: 50, width: "calc(100% - 2rem)", maxWidth: 420,
    }}>
      <div className="glass-nav" style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)", borderRadius: 24,
        height: 64, alignItems: "center",
      }}>
        {PRIMARY_NAV_ITEMS.map((tab) => {
          const Icon = tab.icon;
          if (tab.create) return (
            <motion.button key={tab.id} type="button" aria-label="Host a game" onClick={() => go(tab)}
              whileTap={reducedMotion ? undefined : { scale: 0.88, rotate: -4 }}
              whileHover={reducedMotion ? undefined : { y: -2 }}
              transition={{ type: "spring", stiffness: 520, damping: 24 }}
              className="flex h-full items-center justify-center border-0 bg-transparent">
              <motion.span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
                style={{ boxShadow: `0 7px 18px -6px ${C.green}` }}
                animate={reducedMotion ? undefined : { y: [0, -1, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.5 }}>
                <Icon size={22} strokeWidth={2.5} />
              </motion.span>
            </motion.button>
          );

          const isActive = activeId === tab.id;
          return (
            <motion.button key={tab.id} type="button" aria-label={tab.label}
              aria-current={isActive ? "page" : undefined} onClick={() => go(tab)}
              whileTap={reducedMotion ? undefined : { scale: 0.9 }}
              className="relative flex h-full flex-col items-center justify-center gap-0.5 border-0 bg-transparent"
              style={{ color: isActive ? C.ink : C.ink3 }}>
              <motion.span animate={{ y: isActive && !reducedMotion ? -1 : 0, scale: isActive ? 1.06 : 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}>
                <Icon size={21} strokeWidth={isActive ? 2.15 : 1.75} />
              </motion.span>
              <span className="text-[11px] font-semibold">{tab.label}</span>
              {isActive && <motion.span layoutId="bottom-nav-active"
                className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
