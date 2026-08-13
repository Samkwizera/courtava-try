import { useParams, useNavigate } from "react-router-dom";
import { useCourt, useCourts } from "@/hooks/useCourts";
import { useAuth } from "@/hooks/useAuth";
import { useCheckIns } from "@/hooks/useCheckIns";

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

function getHeat(n: number): "high" | "medium" | "low" {
  if (n >= 6) return "high";
  if (n >= 2) return "medium";
  return "low";
}

const HEAT_META = {
  high:   { color: C.green, ring: "rgba(46,160,100,0.22)", label: "Heating up" },
  medium: { color: C.amber, ring: "rgba(220,170,70,0.22)",  label: "Active" },
  low:    { color: C.ink3,  ring: "rgba(138,138,136,0.2)",  label: "Quiet" },
};

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 3v13m0-13l-4 4m4-4l4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
      stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" stroke={C.ink3} strokeWidth="1.8"/>
    <circle cx="12" cy="9" r="2.5" stroke={C.ink3} strokeWidth="1.8"/>
  </svg>
);

const ChevIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke={C.ink3} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function CircleBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 38, height: 38, borderRadius: 99,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </button>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 12, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: C.ink3, fontWeight: 500, letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}

// Deterministic busy-hours mock data from court id
function getBusyHours(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const peak = (hash % 5) + 4; // peak at hour index 4–8 (approx 4pm–8pm)
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
        <div style={{ fontSize: 18, fontWeight: 700 }}>Court not found</div>
        <button onClick={() => navigate("/courts")} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 99, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Back to Courts</button>
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

        {/* Nav buttons */}
        <div style={{ position: "absolute", top: 58, left: 14, right: 14, display: "flex", justifyContent: "space-between" }}>
          <CircleBtn onClick={() => navigate(-1)}><BackIcon /></CircleBtn>
          <CircleBtn onClick={handleShare}><ShareIcon /></CircleBtn>
        </div>

        {/* Heat badge */}
        <div style={{
          position: "absolute", bottom: 16, left: 16,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
          color: "#fff", padding: "6px 12px", borderRadius: 99,
          fontSize: 12, fontWeight: 600, display: "flex", gap: 6, alignItems: "center",
        }}>
          <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: 99, background: meta.color }} />
          {playerCount > 0 ? "Court is heating up" : "Court nearby"}
        </div>
      </div>

      {/* Main sheet */}
      <div style={{ background: C.bg, marginTop: -20, borderRadius: "24px 24px 0 0", padding: "22px 22px 10px", position: "relative" }}>

        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{court.name}</div>
        <div style={{ fontSize: 13, color: C.ink3, marginTop: 4, display: "flex", gap: 6, alignItems: "center" }}>
          <PinIcon />
          {court.address || "Kigali"} · {surfaceLabel}
        </div>

        {/* Live player strip */}
        <div style={{ marginTop: 18, background: C.surface, borderRadius: 16, border: `1px solid ${C.hair}`, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {playerCount > 0 && (
                <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: 99, background: C.green }} />
              )}
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {playerCount > 0 ? `${playerCount} playing right now` : "No players right now"}
              </span>
            </div>
            <span style={{ fontSize: 12, color: C.ink3 }}>{surfaceLabel}</span>
          </div>
          {avatars.length > 0 && (
            <div style={{ display: "flex", marginTop: 12 }}>
              {avatars.map((a, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: 99,
                  background: a.bg, border: "2px solid #fff",
                  marginLeft: i === 0 ? 0 : -8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: C.ink,
                }}>{a.label}</div>
              ))}
              {extra > 0 && (
                <div style={{
                  width: 32, height: 32, borderRadius: 99,
                  background: C.ink, border: "2px solid #fff",
                  marginLeft: -8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#fff",
                }}>+{extra}</div>
              )}
              <div style={{ flex: 1 }} />
              <button style={{
                fontSize: 12, fontWeight: 600, color: C.ink2,
                background: C.hair2, border: "none", padding: "6px 12px", borderRadius: 99, cursor: "pointer",
              }}>See all</button>
            </div>
          )}
        </div>

        {/* Activity heatmap */}
        <div style={{ marginTop: 10, background: C.surface, borderRadius: 16, border: `1px solid ${C.hair}`, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Usually busy around 6–7 PM</div>
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
                <div style={{ fontSize: 9, color: i === nowIdx ? C.ink : C.ink3, fontWeight: i === nowIdx ? 600 : 400 }}>
                  {hours[i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 10 }}>
          <StatCell label="Surface" value={surfaceLabel} />
          <StatCell label="Lights" value={court.lights ? "Yes" : "No"} />
          <StatCell label="Parking" value={court.parking ? "Yes" : "No"} />
        </div>

        {/* Recent games section */}
        <div style={{ marginTop: 20, fontSize: 14, fontWeight: 600 }}>Recent games</div>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { t: "5v5 pickup · 2 hours ago",       s: "Ended · 12 players" },
            { t: "Shootaround · yesterday 7 PM",   s: "4 players" },
          ].map((r, i) => (
            <div key={i} style={{
              background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 12, padding: 12,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.t}</div>
                <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>{r.s}</div>
              </div>
              <ChevIcon />
            </div>
          ))}
        </div>
      </div>

      {/* Sticky CTA — sits above the bottom nav (nav: bottom 24 + height 62 = 86px) */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 92, zIndex: 30,
        padding: "14px 16px 14px",
        background: "linear-gradient(to top, rgba(255,255,255,0.98) 60%, rgba(255,255,255,0))",
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
            background: C.green, color: "#fff",
            border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer",
            boxShadow: `0 8px 24px -8px ${C.green}`,
            fontFamily: '"Inter", system-ui',
          }}
        >
          {!user ? "Sign in to host" : "Host a game"}
        </button>
      </div>
    </div>
  );
}
