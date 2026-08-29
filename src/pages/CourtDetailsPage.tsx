import { useParams, useNavigate } from "react-router-dom";
import { useCourt, useCourts } from "@/hooks/useCourts";
import { useAuth } from "@/hooks/useAuth";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useGames } from "@/hooks/useGames";
import { formatDistance, getDistanceKm, useUserLocation } from "@/hooks/useUserLocation";
import { CheckInSheet } from "@/components/courts/CheckInSheet";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { C, RING, SHADOW, FADE_UP } from "@/lib/tokens";
import { IconButton } from "@/components/ui/IconButton";
import {
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  MapPin,
  Radio,
  Share,
  Sun,
  Users,
} from "lucide-react";
import { useState } from "react";

const PinIcon = () => <MapPin size={13} color={C.ink3} strokeWidth={1.8} />;
const ChevIcon = () => <ChevronRight size={14} color={C.ink3} strokeWidth={2} />;


function getHeat(n: number): "high" | "medium" | "low" {
  if (n >= 6) return "high";
  if (n >= 2) return "medium";
  return "low";
}

const HEAT_META = {
  high:   { color: C.green, ring: RING.green, label: "Heating up" },
  medium: { color: C.amber, ring: RING.amber,  label: "Active" },
  low:    { color: C.ink3,  ring: RING.neutral,  label: "Quiet" },
};

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function formatGameDate(date: string, time: string) {
  const today = new Date().toISOString().split("T")[0];
  return `${date === today ? "Today" : date} - ${time ? formatTime(time) : ""}`;
}

function AmenityCell({
  icon: Icon,
  label,
  value,
  active = true,
}: {
  icon: typeof Sun;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 12, padding: "12px" }}>
      <div style={{
        width: 30,
        height: 30,
        borderRadius: 10,
        background: active ? C.greenSoft : C.hair2,
        color: active ? C.greenInk : C.ink3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
      }}>
        <Icon size={15} strokeWidth={1.9} />
      </div>
      <div style={{ fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 650, marginTop: 2 }}>{value}</div>
    </div>
  );
}

// Deterministic busy-hours mock data from court id
function getBusyHours(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const peak = (hash % 5) + 4; // peak at hour index 4-8 (approx 4pm-8pm)
  return [0.1, 0.15, 0.25, 0.4, 0.6, 0.75, 0.9, 0.7, 0.45, 0.2].map((v, i) => {
    const dist = Math.abs(i - peak);
    return Math.min(1, v + 0.2 * Math.max(0, 2 - dist) * ((hash % 5) / 10));
  });
}

export default function CourtDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dbCourts, isLoading: isCourtsLoading } = useCourts();
  const { checkIns } = useCheckIns();
  const { games, isLoading: isGamesLoading } = useGames();
  const { userLocation } = useUserLocation();
  const [checkInOpen, setCheckInOpen] = useState(false);

  const listCourt = dbCourts.find((c) => c.id === id);
  const { court: routeCourt, isLoading: isRouteCourtLoading } = useCourt(listCourt ? undefined : id);
  const court = listCourt ?? routeCourt;
  const isLoading = !court && (isCourtsLoading || isRouteCourtLoading);
  const courtCheckIns = checkIns.filter((c) => c.court_id === id);
  const playerCount = courtCheckIns.length;
  const heat = getHeat(playerCount);
  const meta = HEAT_META[heat];
  const busyHours = getBusyHours(id ?? "");
  const hours = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const nowHour = Math.min(new Date().getHours() - 12, 9);
  const nowIdx = Math.max(0, nowHour);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!court) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Court not found</div>
        <button onClick={() => navigate("/courts")} style={{ background: C.green, color: C.onGreen, border: "none", borderRadius: 99, padding: "10px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Back to Courts</button>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: court.name, text: `Check out ${court.name} on Courtava!`, url: window.location.href });
    }
  };

  const handleJoinGame = () => {
    if (!user) { navigate("/auth"); return; }
    navigate(`/games?court=${id}`);
  };

  const handleHostGame = () => {
    if (!user) { navigate("/auth"); return; }
    navigate("/create-game", { state: { courtId: id, mode: "host" } });
  };

  // Player avatars from check-ins
  const avatars = courtCheckIns.slice(0, 5).map((ci) => ({
    label: (ci.profile?.display_name || "U").slice(0, 2).toUpperCase(),
    bg: ["#D9C9A8", "#C4D9AE", "#AFC9D9", "#D9B8AF", "#C0B4D9"][courtCheckIns.indexOf(ci) % 5],
  }));
  const extra = Math.max(0, playerCount - 5);

  const surface = court.surface ?? "Outdoor";
  const surfaceLabel = surface.charAt(0).toUpperCase() + surface.slice(1);
  const distanceText = userLocation
    ? formatDistance(getDistanceKm(userLocation.lat, userLocation.lng, court.lat, court.lng))
    : "Enable location";
  const todayStr = new Date().toISOString().split("T")[0];
  const courtGames = games
    .filter((game) => game.court_id === id && game.date >= todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const nextGame = courtGames[0];

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: C.bg, fontFamily: '"Inter", system-ui, sans-serif', color: C.ink, paddingBottom: 200 }}>

      {/* Hero */}
      <div style={{ position: "relative", height: 280 }}>
        {court.photo_url ? (
          <img src={court.photo_url} alt={court.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #D6DEC6 0%, #B8C4A4 60%, #8FA376 100%)" }} />
            <svg viewBox="0 0 400 280" width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
              <rect x="40" y="60" width="320" height="180" fill="none" stroke="#fff" strokeWidth="2"/>
              <circle cx="200" cy="150" r="36" fill="none" stroke="#fff" strokeWidth="2"/>
              <line x1="200" y1="60" x2="200" y2="240" stroke="#fff" strokeWidth="2"/>
              <path d="M40 100 Q 120 150 40 200" fill="none" stroke="#fff" strokeWidth="2"/>
              <path d="M360 100 Q 280 150 360 200" fill="none" stroke="#fff" strokeWidth="2"/>
            </svg>
          </>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0.04) 42%, rgba(0,0,0,0.36))" }} />

        {/* Nav buttons */}
        <div style={{ position: "absolute", top: 58, left: 14, right: 14, display: "flex", justifyContent: "space-between" }}>
          <IconButton label="Go back" variant="glass" onClick={() => navigate(-1)}>
            <ChevronLeft size={18} strokeWidth={2} />
          </IconButton>
          <IconButton label="Share court" variant="glass" onClick={handleShare}>
            <Share size={16} strokeWidth={1.8} />
          </IconButton>
        </div>

        {/* Heat badge */}
        <div style={{
          position: "absolute", bottom: 16, left: 16, right: 16,
          display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12,
        }}>
        <div style={{
          background: C.overlayInk, backdropFilter: "blur(10px)",
          color: C.onOverlay, padding: "6px 12px", borderRadius: 99,
          fontSize: 12, fontWeight: 600, display: "flex", gap: 6, alignItems: "center",
        }}>
          <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: 99, background: meta.color }} />
          {playerCount > 0 ? `${playerCount} playing now` : "Court nearby"}
        </div>
        {nextGame && (
          <div style={{
            background: C.overlayInk,
            backdropFilter: "blur(10px)",
            color: C.onOverlay,
            padding: "6px 12px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}>
            <CalendarDays size={13} />
            Next game {formatTime(nextGame.time)}
          </div>
        )}
        </div>
      </div>

      {/* Main sheet */}
      <div style={{ background: C.bg, marginTop: -20, borderRadius: "24px 24px 0 0", padding: "22px 22px 10px", position: "relative" }}>

        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.12 }}>{court.name}</div>
        <div style={{ fontSize: 13, color: C.ink3, marginTop: 4, display: "flex", gap: 6, alignItems: "center" }}>
          <PinIcon />
          <span>{court.address || "Kigali"}</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", paddingBottom: 2 }}>
          <span style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 99, padding: "6px 10px", fontSize: 12, fontWeight: 600, color: C.ink2, whiteSpace: "nowrap" }}>
            {surfaceLabel}
          </span>
          <span style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 99, padding: "6px 10px", fontSize: 12, fontWeight: 600, color: C.ink2, whiteSpace: "nowrap" }}>
            {distanceText}
          </span>
          <span style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 99, padding: "6px 10px", fontSize: 12, fontWeight: 600, color: C.ink2, whiteSpace: "nowrap" }}>
            {meta.label}
          </span>
        </div>

        {/* Live player strip */}
        <ScrollReveal>
        <div style={{ marginTop: 18, background: C.surface, borderRadius: 16, border: `1px solid ${C.hair}`, padding: 14, boxShadow: SHADOW.card }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: playerCount > 0 ? C.greenSoft : C.hair2,
                color: playerCount > 0 ? C.greenInk : C.ink3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Radio size={16} strokeWidth={1.9} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {playerCount > 0 ? `${playerCount} playing right now` : "No players right now"}
              </span>
            </div>
            <button
              onClick={() => setCheckInOpen(true)}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.onGreen,
                background: C.green,
                border: "none",
                padding: "7px 12px",
                borderRadius: 99,
                cursor: "pointer",
              }}
            >
              Check in
            </button>
          </div>
          {avatars.length > 0 && (
            <div style={{ display: "flex", marginTop: 12 }}>
              {avatars.map((a, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: 99,
                  background: a.bg, border: `2px solid ${C.surface}`,
                  marginLeft: i === 0 ? 0 : -8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: C.ink,
                }}>{a.label}</div>
              ))}
              {extra > 0 && (
                <div style={{
                  width: 32, height: 32, borderRadius: 99,
                  background: C.ink, border: `2px solid ${C.surface}`,
                  marginLeft: -8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: C.onOverlay,
                }}>+{extra}</div>
              )}
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setCheckInOpen(true)}
                style={{
                fontSize: 12, fontWeight: 600, color: C.ink2,
                background: C.hair2, border: "none", padding: "6px 12px", borderRadius: 99, cursor: "pointer",
              }}>See all</button>
            </div>
          )}
        </div>
        </ScrollReveal>

        {/* Activity heatmap */}
        <ScrollReveal>
        <div style={{ marginTop: 10, background: C.surface, borderRadius: 16, border: `1px solid ${C.hair}`, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Usually busy around 6-7 PM</div>
            <div style={{ fontSize: 11, color: C.ink3 }}>Today</div>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", marginTop: 14, height: 60 }}>
            {busyHours.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: "100%", height: v * 52,
                  background: i === nowIdx ? C.green : `rgba(46,160,100,${0.15 + v * 0.35})`,
                  borderRadius: 4,
                }} />
                <div style={{ fontSize: 11, color: i === nowIdx ? C.ink : C.ink3, fontWeight: i === nowIdx ? 600 : 400 }}>
                  {hours[i]}
                </div>
              </div>
            ))}
          </div>
        </div>
        </ScrollReveal>

        {/* Stats grid */}
        <ScrollReveal>
        <StaggerGroup style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 10 }}>
          <StaggerItem><AmenityCell icon={MapPin} label="Distance" value={distanceText} active={Boolean(userLocation)} /></StaggerItem>
          <StaggerItem><AmenityCell icon={Sun} label="Lights" value={court.lights ? "Available" : "Not listed"} active={court.lights} /></StaggerItem>
          <StaggerItem><AmenityCell icon={Droplets} label="Water" value={court.water ? "Available" : "Not listed"} active={court.water} /></StaggerItem>
          <StaggerItem><AmenityCell icon={Car} label="Parking" value={court.parking ? "Available" : "Not listed"} active={court.parking} /></StaggerItem>
        </StaggerGroup>
        </ScrollReveal>

        {/* Upcoming games section */}
        <ScrollReveal>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Upcoming at this court</div>
          <div style={{ fontSize: 12, color: C.ink3 }}>
            {isGamesLoading ? "Loading" : `${courtGames.length} ${courtGames.length === 1 ? "game" : "games"}`}
          </div>
        </div>

        {isGamesLoading ? (
          <div style={{ marginTop: 8, background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 12, padding: 14, color: C.ink3, fontSize: 13 }}>
            Loading games...
          </div>
        ) : courtGames.length === 0 ? (
          <div style={{ marginTop: 8, background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 16, padding: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: C.greenSoft,
                color: C.greenInk,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <CalendarDays size={18} strokeWidth={1.9} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 650 }}>No games scheduled yet</div>
                <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>Start one and make this court active.</div>
              </div>
              <button
                onClick={handleHostGame}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.onInk,
                  background: C.ink,
                  border: "none",
                  borderRadius: 99,
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                Host
              </button>
            </div>
          </div>
        ) : (
        <StaggerGroup style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {courtGames.slice(0, 3).map((game) => (
            <StaggerItem key={game.id}>
            <div style={{
              background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 12, padding: 12,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 650, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{game.title}</div>
                <div style={{ fontSize: 11, color: C.ink3, marginTop: 3, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Clock3 size={12} />
                    {formatGameDate(game.date, game.time)}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Users size={12} />
                    {game.current_players}/{game.max_players}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/games?court=${id}`)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 99,
                  border: `1px solid ${C.hair}`,
                  background: C.surface,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-label={`View ${game.title}`}
              >
                <ChevIcon />
              </button>
            </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
        )}
        </ScrollReveal>
      </div>

      {/* Sticky CTA - sits above the bottom nav (nav: bottom 24 + height 62 = 86px) */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 92, zIndex: 30,
        padding: "14px 16px 14px",
        background: FADE_UP,
        display: "flex", gap: 10,
      }}>
        <button
          onClick={handleJoinGame}
          style={{
            flex: 1, height: 54, borderRadius: 16,
            background: C.surface, color: C.ink,
            border: `1px solid ${C.hair}`, fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: '"Inter", system-ui',
          }}
        >
          {!user ? "Sign in to join" : "Join a game"}
        </button>
        <button
          onClick={handleHostGame}
          style={{
            flex: 1, height: 54, borderRadius: 16,
            background: C.green, color: C.onGreen,
            border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer",
            boxShadow: `0 8px 24px -8px ${C.green}`,
            fontFamily: '"Inter", system-ui',
          }}
        >
          {!user ? "Sign in to host" : "Host a game"}
        </button>
      </div>

      <CheckInSheet
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        courtId={court.id}
        courtName={court.name}
        checkedInUsers={courtCheckIns}
      />
    </div>
  );
}
