import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourts } from "@/hooks/useCourts";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useAuth } from "@/hooks/useAuth";

const C = {
  bg: "hsl(var(--background))",
  surface: "hsl(var(--card))",
  ink: "hsl(var(--foreground))",
  ink2: "hsl(var(--muted-foreground))",
  ink3: "hsl(var(--muted-foreground))",
  hair: "hsl(var(--border))",
  hair2: "hsl(var(--muted))",
  green: "oklch(0.68 0.14 150)",
  greenSoft: "hsl(var(--secondary))",
  greenInk: "hsl(var(--secondary-foreground))",
  amber: "oklch(0.78 0.12 75)",
};

const HEAT_META: Record<string, { color: string; label: string; ring: string }> = {
  high:   { color: C.green,  label: "Hot",   ring: "rgba(46,160,100,0.22)" },
  medium: { color: C.amber,  label: "Warm",  ring: "rgba(220,170,70,0.22)" },
  low:    { color: C.ink3,   label: "Quiet", ring: "rgba(138,138,136,0.2)" },
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke={C.ink3} strokeWidth="1.8"/>
    <path d="m20 20-3.5-3.5" stroke={C.ink3} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M3 5h18M6 12h12M10 19h4" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const NavIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={C.ink}>
    <path d="M3 11l18-8-8 18-2-8-8-2z"/>
  </svg>
);

const ChevIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke={C.ink3} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FlameIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={C.green}>
    <path d="M12 2s1 3 3 5 3 3 3 6a6 6 0 1 1-12 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-6 2-10z"/>
  </svg>
);

function getCourtHeat(playerCount: number): "high" | "medium" | "low" {
  if (playerCount >= 6) return "high";
  if (playerCount >= 2) return "medium";
  return "low";
}

function deterministicPos(id: string, index: number, total: number): { cx: number; cy: number } {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const col = index % 3;
  const row = Math.floor(index / 3);
  const cols = 3;
  const rows = Math.ceil(total / 3);
  return {
    cx: (col + 0.5) / cols * 0.7 + 0.12 + ((hash % 17) / 17) * 0.1,
    cy: (row + 0.5) / Math.max(rows, 2) * 0.6 + 0.12 + ((hash % 13) / 13) * 0.1,
  };
}

export default function HomePage() {
  const navigate = useNavigate();
  const { dbCourts } = useCourts();
  const { checkIns } = useCheckIns();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Player";
  const initials = displayName.slice(0, 2).toUpperCase();

  const courtsWithActivity = dbCourts.map((court) => {
    const liveCount = checkIns.filter((c) => c.court_id === court.id).length;
    return { ...court, liveCount, heat: getCourtHeat(liveCount) };
  });
  const activeCourts = courtsWithActivity.filter((c) => c.liveCount > 0).length;

  const displayedCourts = courtsWithActivity.filter((c) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "hot") return c.heat === "high";
    if (activeFilter === "casual") return c.heat === "low" || c.heat === "medium";
    if (activeFilter === "competitive") return c.heat === "high" || c.heat === "medium";
    return true;
  });

  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: C.bg, fontFamily: '"Inter", system-ui, sans-serif', color: C.ink, overflowY: "auto", paddingBottom: 120 }}>

      {/* Header */}
      <div style={{ padding: "70px 22px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: C.ink3, fontWeight: 500, letterSpacing: 0.2 }}>
              {day} · {time}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, marginTop: 4 }}>
              {activeCourts > 0 ? (
                <>{activeCourts} courts active<span style={{ color: C.ink3 }}> nearby</span></>
              ) : (
                <>Courts<span style={{ color: C.ink3 }}> near you</span></>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/profile")}
            style={{
              width: 40, height: 40, borderRadius: 99, border: `1px solid ${C.hair}`,
              background: C.surface, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 600, fontSize: 13, color: C.ink2,
            }}
          >
            {initials}
          </button>
        </div>
      </div>

      {/* Map card */}
      <div style={{ padding: "8px 14px 0" }}>
        <div
          style={{
            position: "relative", height: 340, borderRadius: 20, overflow: "hidden",
            background: "#EEF1EB", border: `1px solid ${C.hair}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          {/* Faux map SVG */}
          <svg width="100%" height="100%" viewBox="0 0 400 340" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0H0V32" fill="none" stroke="#E2E6DC" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="400" height="340" fill="#F1F4EB"/>
            <rect width="400" height="340" fill="url(#grid)"/>
            <path d="M-20 80 Q 100 90 200 60 T 420 100" stroke="#fff" strokeWidth="14" fill="none" opacity="0.9"/>
            <path d="M-20 80 Q 100 90 200 60 T 420 100" stroke="#E8ECE1" strokeWidth="12" fill="none"/>
            <path d="M60 -20 Q 80 120 140 200 T 180 360" stroke="#fff" strokeWidth="10" fill="none" opacity="0.9"/>
            <path d="M60 -20 Q 80 120 140 200 T 180 360" stroke="#E8ECE1" strokeWidth="8" fill="none"/>
            <path d="M420 240 Q 300 230 220 260 T -20 290" stroke="#fff" strokeWidth="9" fill="none" opacity="0.9"/>
            <path d="M420 240 Q 300 230 220 260 T -20 290" stroke="#E8ECE1" strokeWidth="7" fill="none"/>
            <path d="M260 150 Q 310 130 340 160 Q 370 200 330 230 Q 280 240 260 200 Z" fill="#DDE6CE" opacity="0.7"/>
            <path d="M-20 300 Q 80 280 180 310 Q 280 340 420 320 L 420 360 L -20 360 Z" fill="#D6E3EA" opacity="0.6"/>
          </svg>

          {/* Court dots */}
          {courtsWithActivity.slice(0, 8).map((court, i) => {
            const { cx, cy } = deterministicPos(court.id, i, Math.min(courtsWithActivity.length, 8));
            const meta = HEAT_META[court.heat];
            return (
              <button
                key={court.id}
                onClick={() => navigate(`/courts/${court.id}`)}
                style={{
                  position: "absolute",
                  left: `calc(${cx * 100}% - 14px)`,
                  top: `calc(${cy * 100}% - 14px)`,
                  width: 28, height: 28, borderRadius: 99,
                  background: meta.color, border: "3px solid #fff", cursor: "pointer",
                  boxShadow: `0 0 0 8px ${meta.ring}, 0 4px 10px rgba(0,0,0,0.12)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0,
                }}
                className={court.heat === "high" ? "pulse" : ""}
              >
                <div style={{ width: 8, height: 8, borderRadius: 99, background: C.surface }} />
              </button>
            );
          })}

          {/* You-are-here dot */}
          <div style={{
            position: "absolute", left: "45%", top: "45%",
            width: 16, height: 16, borderRadius: 99, background: "#2B7CFF",
            border: "3px solid #fff", boxShadow: "0 0 0 6px rgba(43,124,255,0.18), 0 2px 6px rgba(0,0,0,0.2)",
          }} />

          {/* Floating search bar */}
          <div style={{
            position: "absolute", top: 14, left: 14, right: 14,
            background: C.surface, borderRadius: 14, height: 42,
            display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          }}>
            <SearchIcon />
            <div style={{ color: C.ink3, fontSize: 14, flex: 1 }}>Search courts near you</div>
            <div style={{ width: 1, height: 18, background: C.hair }} />
            <FilterIcon />
          </div>

          {/* Heat legend */}
          <div style={{
            position: "absolute", bottom: 14, left: 14,
            background: C.surface, borderRadius: 12, padding: "8px 12px",
            display: "flex", gap: 12, alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: 11, color: C.ink2, fontWeight: 500,
          }}>
            {(["high", "medium", "low"] as const).map((k) => (
              <div key={k} style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: HEAT_META[k].color }} />
                {HEAT_META[k].label}
              </div>
            ))}
          </div>

          {/* Recenter button */}
          <div style={{
            position: "absolute", bottom: 14, right: 14,
            width: 42, height: 42, borderRadius: 14, background: C.surface,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }} onClick={() => navigate("/courts")}>
            <div style={{ transform: "rotate(-20deg)" }}><NavIcon /></div>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, padding: "18px 22px 6px", overflowX: "auto" }}>
        {[
          { k: "all",         label: "All" },
          { k: "hot",         label: "🔥 Hot now" },
          { k: "casual",      label: "Casual" },
          { k: "competitive", label: "Competitive" },
        ].map((chip) => (
          <div
            key={chip.k}
            onClick={() => setActiveFilter(chip.k)}
            style={{
              padding: "8px 14px", borderRadius: 99,
              background: activeFilter === chip.k ? C.ink : "#fff",
              color: activeFilter === chip.k ? "#fff" : C.ink2,
              border: `1px solid ${activeFilter === chip.k ? C.ink : C.hair}`,
              fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {chip.label}
          </div>
        ))}
      </div>

      {/* Courts near you */}
      <div style={{ padding: "12px 14px 0" }}>
        <div style={{ padding: "8px 8px 10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Courts near you</div>
          <div style={{ fontSize: 12, color: C.ink3 }}>Sorted by activity</div>
        </div>

        {displayedCourts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 14, color: C.ink3, marginBottom: 12 }}>No courts yet. Be the first to add one!</div>
            <button
              onClick={() => navigate("/courts")}
              style={{
                background: C.green, color: "#fff", border: "none", borderRadius: 99,
                padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              Explore courts
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayedCourts.map((court) => {
              const meta = HEAT_META[court.heat];
              return (
                <div
                  key={court.id}
                  onClick={() => navigate(`/courts/${court.id}`)}
                  style={{
                    background: C.surface, borderRadius: 16, padding: 14,
                    border: `1px solid ${C.hair}`, display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: C.hair2,
                    display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                  }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: 99, background: meta.color,
                      boxShadow: `0 0 0 4px ${meta.ring}`,
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{court.name}</div>
                      {court.heat === "high" && (
                        <span style={{
                          fontSize: 10, padding: "2px 6px", borderRadius: 99,
                          background: C.greenSoft, color: C.greenInk, fontWeight: 600,
                        }}>Heating up</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: C.ink3, marginTop: 3, display: "flex", gap: 8 }}>
                      {court.liveCount > 0 && <span>{court.liveCount} playing</span>}
                      {court.liveCount > 0 && <span>·</span>}
                      <span style={{ textTransform: "capitalize" }}>{court.surface}</span>
                      {court.address && <><span>·</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{court.address}</span></>}
                    </div>
                  </div>
                  <ChevIcon />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
