import { useLocation, useNavigate } from "react-router-dom";

const GREEN = "oklch(0.68 0.14 150)";
const INK = "hsl(var(--foreground))";
const INK3 = "hsl(var(--muted-foreground))";
const HAIR = "hsl(var(--border))";

const HomeIcon = (color: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V11z"
      stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

const MapIcon = (color: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z M9 4v14 M15 6v14"
      stroke={color} strokeWidth="1.7" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const BellIcon = (color: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z M10 20a2 2 0 0 0 4 0"
      stroke={color} strokeWidth="1.7" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = (color: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.7"/>
    <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
);

const TABS = [
  { id: "home",    to: "/",            label: "Home",    icon: HomeIcon },
  { id: "courts",  to: "/courts",      label: "Map",     icon: MapIcon },
  { id: "create",  to: "/create-game", label: "",        icon: null, plus: true },
  { id: "games",   to: "/games",       label: "Feed",    icon: BellIcon },
  { id: "profile", to: "/profile",     label: "You",     icon: UserIcon },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeId = (() => {
    if (location.pathname === "/") return "home";
    if (location.pathname.startsWith("/courts")) return "courts";
    if (location.pathname.startsWith("/games") || location.pathname.startsWith("/create-game")) return "games";
    if (location.pathname.startsWith("/profile")) return "profile";
    return "";
  })();

  return (
    <nav
      style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 50, width: "calc(100% - 3rem)", maxWidth: 420,
      }}
    >
      <div
        style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
          background: "hsl(var(--card))", borderRadius: 24,
          border: `1px solid ${HAIR}`,
          boxShadow: "0 6px 24px -8px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.03)",
          height: 62, alignItems: "center",
        }}
      >
        {TABS.map((tab) => {
          if (tab.plus) {
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.to)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "none", background: "transparent", cursor: "pointer", height: "100%",
                }}
              >
                <div
                  style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: GREEN,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 6px 14px -4px ${GREEN}`,
                  }}
                >
                  <PlusIcon />
                </div>
              </button>
            );
          }
          const isActive = activeId === tab.id;
          const color = isActive ? INK : INK3;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.to)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 3,
                border: "none", background: "transparent", cursor: "pointer", height: "100%",
                color, fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              {tab.icon!(color)}
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.1 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
