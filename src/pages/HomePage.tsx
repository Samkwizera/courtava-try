import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourts } from "@/hooks/useCourts";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useAuth } from "@/hooks/useAuth";
import { useGames } from "@/hooks/useGames";
import { useUserLocation } from "@/hooks/useUserLocation";
import { CourtMap } from "@/components/map/CourtMap";
import { getCourtHeat } from "@/lib/courtHeat";
import { Reveal } from "@/components/Reveal";
import { useTilt } from "@/hooks/useTilt";

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

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function formatGameTime(date: string, time: string) {
  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;
  return `${isToday ? "Today" : date} · ${time ? formatTime(time) : ""}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { dbCourts } = useCourts();
  const { checkIns } = useCheckIns();
  const { games } = useGames();
  const { user } = useAuth();
  const { userLocation, isLocating, locationEnabled, requestLocation } = useUserLocation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const tiltRef = useTilt<HTMLDivElement>();

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Player";
  const initials = displayName.slice(0, 2).toUpperCase();

  const courtsWithActivity = dbCourts.map((court) => {
    const liveCount = checkIns.filter((c) => c.court_id === court.id).length;
    return { ...court, liveCount, heat: getCourtHeat(liveCount) };
  });
  const activeCourts = courtsWithActivity.filter((c) => c.liveCount > 0).length;
  const featuredCourt = [...courtsWithActivity].sort((a, b) => b.liveCount - a.liveCount)[0];
  const hasFeaturedCourt = featuredCourt && featuredCourt.liveCount > 0;

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const displayedCourts = courtsWithActivity.filter((c) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "hot") return c.heat === "high";
    if (activeFilter === "casual") return c.heat === "low" || c.heat === "medium";
    if (activeFilter === "competitive") return c.heat === "high" || c.heat === "medium";
    return true;
  }).filter((court) => {
    if (!normalizedSearch) return true;

    return (
      court.name.toLowerCase().includes(normalizedSearch) ||
      court.address.toLowerCase().includes(normalizedSearch) ||
      court.surface.toLowerCase().includes(normalizedSearch)
    );
  });

  const mapCourts = useMemo(
    () =>
      displayedCourts.map((court) => ({
        id: court.id,
        name: court.name,
        address: court.address,
        lat: court.lat,
        lng: court.lng,
        playersNow: court.liveCount,
      })),
    [displayedCourts]
  );

  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const todayStr = now.toISOString().split("T")[0];
  const upcomingGames = games
    .filter((g) => g.date >= todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: C.bg, fontFamily: '"Inter", system-ui, sans-serif', color: C.ink, overflowY: "auto", paddingBottom: 120 }}>

      {/* Header */}
      <div style={{ position: "relative", padding: "70px 22px 14px", overflow: "hidden" }}>
        <div className="ambient-glow" aria-hidden />
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <img src="/courtava-icon.png" alt="" width={16} height={16} style={{ borderRadius: 4 }} />
              <span className="font-wordmark" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", color: C.green, textTransform: "uppercase" }}>
                Courtava
              </span>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", color: C.green,
            }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 99, background: C.green, boxShadow: `0 0 8px 2px ${C.green}88` }} />
              {activeCourts > 0 ? `${activeCourts} court${activeCourts > 1 ? "s" : ""} live right now` : `${day} · ${time}`}
            </div>
            <div className="font-athletic" style={{ fontSize: 40, marginTop: 8 }}>
              {activeCourts > 0 ? (
                <>WHO'S<br /><span className="text-glow-primary">HOOPING?</span></>
              ) : (
                <>COURTS<br /><span className="text-glow-primary">NEAR YOU</span></>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/profile")}
            style={{
              width: 40, height: 40, borderRadius: 99, border: "none",
              background: C.greenSoft, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13, color: C.greenInk, flexShrink: 0,
            }}
          >
            {initials}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: "8px 14px 0" }}>
        <div style={{
          background: C.surface, borderRadius: 14, height: 42,
          display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
          border: `1px solid ${C.hair}`,
        }}>
          <SearchIcon />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && displayedCourts.length === 1) {
                navigate(`/courts/${displayedCourts[0].id}`);
              }
            }}
            placeholder="Search courts near you"
            aria-label="Search courts near you"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              color: C.ink,
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />
          <div style={{ width: 1, height: 18, background: C.hair }} />
          <button
            type="button"
            onClick={() => navigate("/courts")}
            aria-label="Open court filters"
            style={{
              width: 26,
              height: 26,
              border: "none",
              background: "transparent",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <FilterIcon />
          </button>
        </div>
      </div>

      {/* Map card */}
      <div style={{ padding: "8px 14px 0" }}>
        <div
          style={{
            position: "relative", height: 340, borderRadius: 20, overflow: "hidden",
            border: `1px solid ${C.hair}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <CourtMap
            courts={mapCourts}
            center={[-1.9403, 30.0588]}
            zoom={13}
            checkIns={checkIns}
            onCourtSelect={(court) => navigate(`/courts/${court.id}`)}
            userLocation={userLocation}
            isLocating={isLocating}
            onRequestLocation={requestLocation}
            locationEnabled={locationEnabled}
          />

          {/* Heat legend */}
          <div style={{
            position: "absolute", bottom: 46, left: 14, zIndex: 10,
            background: C.surface, borderRadius: 12, padding: "8px 12px",
            display: "flex", gap: 12, alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: 11, color: C.ink2, fontWeight: 500,
            pointerEvents: "none",
          }}>
            {(["high", "medium", "low"] as const).map((k) => (
              <div key={k} style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: HEAT_META[k].color }} />
                {HEAT_META[k].label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured court spotlight */}
      {hasFeaturedCourt && (
        <div className="tilt-stage" style={{ padding: "18px 22px 0" }}>
          <div
            ref={tiltRef}
            className="tilt-card ios-card-tap"
            onClick={() => navigate(`/courts/${featuredCourt.id}`)}
            style={{
              position: "relative", height: 176, borderRadius: 22, overflow: "hidden", cursor: "pointer",
              background: "linear-gradient(155deg, #4CBE6C 0%, #2E8B4F 55%, #1F6B3C 100%)",
            }}
          >
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 16px)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(circle at 78% 15%, rgba(255,255,255,0.35), transparent 45%)",
            }} />
            <div style={{
              position: "absolute", top: 14, left: 14,
              background: "rgba(255,255,255,0.92)", padding: "5px 10px", borderRadius: 99,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", color: "#1F6B3C",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2E8B4F" }} className="pulse-dot" />
              LIVE · {featuredCourt.liveCount} PLAYING
            </div>
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 16 }}>
              <div className="font-athletic" style={{ fontSize: 22, color: "#fff" }}>{featuredCourt.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2, textTransform: "capitalize" }}>
                {featuredCourt.surface} {featuredCourt.address ? `· ${featuredCourt.address}` : ""}
              </div>
            </div>
          </div>
        </div>
      )}

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
              background: activeFilter === chip.k ? C.green : "#fff",
              color: activeFilter === chip.k ? "#fff" : C.ink2,
              border: `1px solid ${activeFilter === chip.k ? C.green : C.hair}`,
              fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {chip.label}
          </div>
        ))}
      </div>

      {/* Upcoming games */}
      {upcomingGames.length > 0 && (
        <div style={{ padding: "12px 14px 0" }}>
          <div style={{ padding: "8px 8px 10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Upcoming games</div>
            <div style={{ fontSize: 12, color: C.ink3 }}>
              {upcomingGames.length} {upcomingGames.length === 1 ? "game" : "games"}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingGames.slice(0, 3).map((game, i) => {
              const spots = game.max_players - game.current_players;
              const isFull = spots <= 0;
              const rowKey = `game-${game.id}`;
              const isHovered = hoveredRowId === rowKey;
              return (
                <Reveal key={game.id} index={i}>
                <div
                  onClick={() => navigate(game.court_id ? `/games?court=${game.court_id}` : "/games")}
                  onMouseEnter={() => setHoveredRowId(rowKey)}
                  onMouseLeave={() => setHoveredRowId(null)}
                  style={{
                    background: isHovered ? C.green : C.surface, borderRadius: 16, padding: 14,
                    border: `1px solid ${isHovered ? C.green : C.hair}`, display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", transition: "background-color 0.15s, border-color 0.15s",
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: isHovered ? "rgba(255,255,255,0.2)" : C.greenSoft,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                    transition: "background-color 0.15s",
                  }}>🏀</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: isHovered ? "#fff" : C.ink }}>{game.title}</div>
                    <div style={{ fontSize: 12, color: isHovered ? "rgba(255,255,255,0.85)" : C.ink3, marginTop: 3, display: "flex", gap: 8 }}>
                      <span>{game.court_name}</span>
                      <span>·</span>
                      <span>{formatGameTime(game.date, game.time)}</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, padding: "3px 8px", borderRadius: 99,
                    background: isHovered ? "rgba(255,255,255,0.9)" : isFull ? C.hair2 : C.greenSoft,
                    color: isHovered ? C.greenInk : isFull ? C.ink3 : C.greenInk,
                    fontWeight: 600, flexShrink: 0,
                  }}>{isFull ? "Full" : `${spots} spot${spots > 1 ? "s" : ""} left`}</span>
                  {isHovered ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                  ) : (
                    <ChevIcon />
                  )}
                </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      )}

      {/* Courts near you */}
      <div style={{ padding: "12px 14px 0" }}>
        <div style={{ padding: "8px 8px 10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>
            {normalizedSearch ? "Search results" : "Courts near you"}
          </div>
          <div style={{ fontSize: 12, color: C.ink3 }}>
            {displayedCourts.length} {displayedCourts.length === 1 ? "court" : "courts"}
          </div>
        </div>

        {displayedCourts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 14, color: C.ink3, marginBottom: 12 }}>
              {normalizedSearch ? "No courts match your search." : "No courts are available yet."}
            </div>
            <button
              onClick={() => normalizedSearch ? setSearchQuery("") : navigate("/courts")}
              style={{
                background: C.green, color: "#fff", border: "none", borderRadius: 99,
                padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              {normalizedSearch ? "Clear search" : "Explore courts"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayedCourts.map((court, i) => {
              const meta = HEAT_META[court.heat];
              const rowKey = `court-${court.id}`;
              const isHovered = hoveredRowId === rowKey;
              return (
                <Reveal key={court.id} index={i}>
                <div
                  onClick={() => navigate(`/courts/${court.id}`)}
                  onMouseEnter={() => setHoveredRowId(rowKey)}
                  onMouseLeave={() => setHoveredRowId(null)}
                  style={{
                    background: isHovered ? C.green : C.surface, borderRadius: 16, padding: 14,
                    border: `1px solid ${isHovered ? C.green : C.hair}`, display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", transition: "background-color 0.15s, border-color 0.15s",
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: isHovered ? "rgba(255,255,255,0.2)" : C.hair2,
                    display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                    transition: "background-color 0.15s",
                  }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: 99, background: isHovered ? "#fff" : meta.color,
                      boxShadow: isHovered ? "none" : `0 0 0 4px ${meta.ring}`,
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: isHovered ? "#fff" : C.ink }}>{court.name}</div>
                      {court.heat === "high" && (
                        <span style={{
                          fontSize: 10, padding: "2px 6px", borderRadius: 99,
                          background: isHovered ? "rgba(255,255,255,0.9)" : C.greenSoft,
                          color: C.greenInk, fontWeight: 600,
                        }}>Heating up</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: isHovered ? "rgba(255,255,255,0.85)" : C.ink3, marginTop: 3, display: "flex", gap: 8 }}>
                      {court.liveCount > 0 && <span>{court.liveCount} playing</span>}
                      {court.liveCount > 0 && <span>·</span>}
                      <span style={{ textTransform: "capitalize" }}>{court.surface}</span>
                      {court.address && <><span>·</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{court.address}</span></>}
                    </div>
                  </div>
                  {isHovered ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                  ) : (
                    <ChevIcon />
                  )}
                </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
