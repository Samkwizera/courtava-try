import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourts } from "@/hooks/useCourts";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useAuth } from "@/hooks/useAuth";
import { useGames } from "@/hooks/useGames";
import { useUserLocation } from "@/hooks/useUserLocation";
import { CourtMap } from "@/components/map/CourtMap";
import { getCourtHeat } from "@/lib/courtHeat";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { C, RING, SHADOW } from "@/lib/tokens";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/layout/PageHeader";
import { IconButton } from "@/components/ui/IconButton";
import { Search, SlidersHorizontal, ChevronRight, Flame, CalendarDays } from "lucide-react";

const SearchIcon = () => <Search size={16} color={C.ink3} strokeWidth={1.8} />;
const FilterIcon = () => <SlidersHorizontal size={14} color={C.ink} strokeWidth={1.8} />;
const ChevIcon = () => <ChevronRight size={14} color={C.ink3} strokeWidth={2} />;
const FlameIcon = () => <Flame size={14} color={C.green} fill={C.green} strokeWidth={0} />;


const HEAT_META: Record<string, { color: string; label: string; ring: string }> = {
  high:   { color: C.green,  label: "Hot",   ring: RING.green },
  medium: { color: C.amber,  label: "Warm",  ring: RING.amber },
  low:    { color: C.ink3,   label: "Quiet", ring: RING.neutral },
};

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function formatGameTime(date: string, time: string) {
  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;
  return `${isToday ? "Today" : date} - ${time ? formatTime(time) : ""}`;
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

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Player";
  const initials = displayName.slice(0, 2).toUpperCase();

  const courtsWithActivity = dbCourts.map((court) => {
    const liveCount = checkIns.filter((c) => c.court_id === court.id).length;
    return { ...court, liveCount, heat: getCourtHeat(liveCount) };
  });
  const activeCourts = courtsWithActivity.filter((c) => c.liveCount > 0).length;

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

      <PageHeader
        sticky={false}
        eyebrow={`${day} · ${time}`}
        title={
          activeCourts > 0 ? (
            <>{activeCourts} courts active<span style={{ color: C.ink3 }}> nearby</span></>
          ) : (
            <>Courts<span style={{ color: C.ink3 }}> near you</span></>
          )
        }
        actions={
          <IconButton label="Your profile" size={40} onClick={() => navigate("/profile")}>
            <span className="text-13 font-semibold">{initials}</span>
          </IconButton>
        }
      />

      {/* Search bar */}
      <div style={{ padding: "8px 14px 0" }}>
        <div style={{
          background: C.surface, borderRadius: 16, height: 42,
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
              fontSize: 15,
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
      <ScrollReveal>
      <div style={{ padding: "8px 14px 0" }}>
        <div
          style={{
            position: "relative", height: 340, borderRadius: 24, overflow: "hidden",
            border: `1px solid ${C.hair}`,
            boxShadow: SHADOW.card,
          }}
        >
          <CourtMap
            showSearch={false}
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
            position: "absolute", bottom: 14, left: 14, zIndex: 10,
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
      </ScrollReveal>

      {/* Filter chips */}
      <ScrollReveal delay={80}>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ padding: "18px 22px 6px" }}>
        {[
          { k: "all",         label: "All", icon: undefined },
          { k: "hot",         label: "Hot now", icon: <Flame size={13} fill="currentColor" strokeWidth={0} /> },
          { k: "casual",      label: "Casual", icon: undefined },
          { k: "competitive", label: "Competitive", icon: undefined },
        ].map((chip) => (
          <Chip
            key={chip.k}
            selected={activeFilter === chip.k}
            onClick={() => setActiveFilter(chip.k)}
            icon={chip.icon}
          >
            {chip.label}
          </Chip>
        ))}
      </div>
      </ScrollReveal>

      {/* Upcoming games */}
      {upcomingGames.length > 0 && (
        <ScrollReveal>
        <div style={{ padding: "12px 14px 0" }}>
          <div style={{ padding: "8px 8px 10px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Upcoming games</div>
            <div style={{ fontSize: 12, color: C.ink3 }}>
              {upcomingGames.length} {upcomingGames.length === 1 ? "game" : "games"}
            </div>
          </div>
          <StaggerGroup style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingGames.slice(0, 3).map((game) => {
              const spots = game.max_players - game.current_players;
              const isFull = spots <= 0;
              return (
                <StaggerItem key={game.id}>
                <div
                  onClick={() => navigate(game.court_id ? `/games?court=${game.court_id}` : "/games")}
                  style={{
                    background: C.surface, borderRadius: 16, padding: 14,
                    border: `1px solid ${C.hair}`, display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: C.hair2,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    <CalendarDays size={19} color={C.green} strokeWidth={1.9} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{game.title}</div>
                    <div style={{ fontSize: 12, color: C.ink3, marginTop: 3, display: "flex", gap: 8 }}>
                      <span>{game.court_name}</span>
                      <span>·</span>
                      <span>{formatGameTime(game.date, game.time)}</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: "3px 8px", borderRadius: 99,
                    background: isFull ? C.hair2 : C.greenSoft,
                    color: isFull ? C.ink3 : C.greenInk,
                    fontWeight: 600, flexShrink: 0,
                  }}>{isFull ? "Full" : `${spots} spot${spots > 1 ? "s" : ""} left`}</span>
                  <ChevIcon />
                </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
        </ScrollReveal>
      )}

      {/* Courts near you */}
      <ScrollReveal>
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
            <div style={{ fontSize: 15, color: C.ink3, marginBottom: 12 }}>
              {normalizedSearch ? "No courts match your search." : "No courts are available yet."}
            </div>
            <button
              onClick={() => normalizedSearch ? setSearchQuery("") : navigate("/courts")}
              style={{
                background: C.green, color: C.onGreen, border: "none", borderRadius: 99,
                padding: "10px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}
            >
              {normalizedSearch ? "Clear search" : "Explore courts"}
            </button>
          </div>
        ) : (
          <StaggerGroup style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayedCourts.map((court) => {
              const meta = HEAT_META[court.heat];
              return (
                <StaggerItem key={court.id}>
                <div
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
                          fontSize: 11, padding: "2px 6px", borderRadius: 99,
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
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </div>
      </ScrollReveal>
    </div>
  );
}
