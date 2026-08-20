import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGames, GameInsert } from "@/hooks/useGames";
import { useCourts } from "@/hooks/useCourts";
import { useCheckIns } from "@/hooks/useCheckIns";
import { IosDateTimePicker } from "@/components/ui/IosDrumPicker";

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
};

const font = `"Inter", -apple-system, system-ui, sans-serif`;

const HEAT_META: Record<string, { color: string; ring: string }> = {
  high:   { color: C.green,  ring: "rgba(46,160,100,0.22)" },
  medium: { color: "oklch(0.78 0.12 75)", ring: "rgba(220,170,70,0.22)" },
  low:    { color: C.ink3,   ring: "rgba(138,138,136,0.2)" },
};

function getHeat(count: number): "high" | "medium" | "low" {
  if (count >= 6) return "high";
  if (count >= 2) return "medium";
  return "low";
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M15 18L9 12L15 6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={C.ink2} strokeWidth="1.7"/>
      <path d="M12 7v5l3 2" stroke={C.ink2} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="9" r="3.5" stroke={C.ink2} strokeWidth="1.6"/>
      <path d="M2 20c1-3.5 3.5-5 7-5s6 1.5 7 5" stroke={C.ink2} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M15 7a3 3 0 1 1 0 6 M17 15c2 .5 4 1.5 5 4" stroke={C.ink2} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={C.green}>
      <path d="M12 2s1 3 3 5 3 3 3 6a6 6 0 1 1-12 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-6 2-10z"/>
    </svg>
  );
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function getNowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function getThirtyMinTime() {
  const now = new Date(Date.now() + 30 * 60 * 1000);
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function CreateGamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { courtId?: string; mode?: "checkin" | "host" } | null;
  const { user } = useAuth();
  const { addGame, isAdding } = useGames();
  const { dbCourts } = useCourts();
  const { checkIns, checkIn: doCheckIn } = useCheckIns();

  const [step, setStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMode, setSuccessMode] = useState<"checkin" | "host">("checkin");
  const [hoveredCourtId, setHoveredCourtId] = useState<string | null>(null);

  // Step 1
  const [mode, setMode] = useState<"checkin" | "host">(navState?.mode ?? "checkin");
  const [courtId, setCourtId] = useState(navState?.courtId ?? "");

  // Step 2
  const [vibe, setVibe] = useState<"casual" | "pickup" | "compete">("casual");
  const [when, setWhen] = useState<"now" | "30" | "later">("now");
  const [size, setSize] = useState(10);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState("");
  const [pickedTime, setPickedTime] = useState("");

  // Step 3
  const [notifyFriends, setNotifyFriends] = useState(true);

  const selectedCourt = dbCourts.find((c) => c.id === courtId);
  const courtCheckInCount = checkIns.filter((ci) => ci.court_id === courtId).length;
  const courtHeat = courtId ? getHeat(courtCheckInCount) : "low";

  const courtsForDisplay = dbCourts.slice(0, 5).map((c) => ({
    ...c,
    liveCount: checkIns.filter((ci) => ci.court_id === c.id).length,
    heat: getHeat(checkIns.filter((ci) => ci.court_id === c.id).length),
  }));

  const canProceed = () => {
    if (step === 0) return !!courtId;
    if (step === 1) return when !== "later" || (!!pickedDate && !!pickedTime);
    return true;
  };

  const getEffectiveDateTime = () => {
    if (when === "now") return { date: getTodayDate(), time: getNowTime() };
    if (when === "30") return { date: getTodayDate(), time: getThirtyMinTime() };
    return { date: pickedDate, time: pickedTime };
  };

  const handleConfirm = async () => {
    if (!user || !courtId) return;

    const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Player";
    setSuccessMode(mode);

    if (mode === "checkin") {
      const result = await doCheckIn(courtId);
      if (result) setShowSuccess(true);
    } else {
      const { date, time } = getEffectiveDateTime();
      const vibeMap = { casual: "Casual", pickup: "Pickup", compete: "Competitive" };
      const skillMap = { casual: "Beginner", pickup: "Intermediate", compete: "Advanced" };
      const formatMap = { casual: "Individual", pickup: "5v5", compete: "5v5" };

      const game: GameInsert = {
        title: `${displayName}'s ${vibeMap[vibe]} game at ${selectedCourt?.name || "TBD"}`,
        court_id: courtId || null,
        court_name: selectedCourt?.name || "TBD",
        date,
        time,
        format: formatMap[vibe],
        skill_level: skillMap[vibe],
        max_players: size,
        host_id: user.id,
        host_name: displayName,
      };

      try {
        await addGame(game);
        setShowSuccess(true);
      } catch {
        // error handled in hook
      }
    }
  };

  if (showSuccess) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{successMode === "checkin" ? "✅" : "🎉"}</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            {successMode === "checkin" ? "Checked in!" : "Game posted!"}
          </div>
          <div style={{ fontSize: 14, color: C.ink3, marginBottom: 32 }}>
            {successMode === "checkin"
              ? `You're now checked in at ${selectedCourt?.name}. Let the neighborhood know you're hooping!`
              : `Your game at ${selectedCourt?.name} is live. Others can now see and join it.`}
          </div>
          <button onClick={() => navigate("/")} style={{
            width: "100%", height: 54, borderRadius: 16,
            background: C.green, color: "#fff", border: "none",
            fontSize: 16, fontWeight: 600, cursor: "pointer",
            boxShadow: `0 8px 24px -8px ${C.green}`, fontFamily: font,
            marginBottom: 10,
          }}>Back to home</button>
          <button onClick={() => navigate("/games")} style={{
            width: "100%", height: 54, borderRadius: 16,
            background: C.surface, color: C.ink, border: `1px solid ${C.hair}`,
            fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>View feed</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, color: C.ink, display: "flex", flexDirection: "column" }}>

      {/* Top bar with progress */}
      <div style={{ padding: "60px 18px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
            style={{
              width: 36, height: 36, borderRadius: 99, border: `1px solid ${C.hair}`,
              background: C.surface, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <BackIcon />
          </button>
          <div style={{ flex: 1, height: 4, background: C.hair, borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              width: `${((step + 1) / 3) * 100}%`, height: "100%",
              background: C.green, transition: "width 0.3s",
              borderRadius: 99,
            }} />
          </div>
          <div style={{ fontSize: 12, color: C.ink3, fontWeight: 500, flexShrink: 0 }}>{step + 1}/3</div>
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, padding: "24px 22px 0", overflowY: "auto", paddingBottom: 220 }}>

        {/* ── STEP 0: Mode + Court ── */}
        {step === 0 && (
          <>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>What are you up to?</div>
            <div style={{ fontSize: 14, color: C.ink3, marginTop: 6 }}>Let the neighborhood know you're hooping.</div>

            {/* Mode cards */}
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
              <ModeCard
                active={mode === "checkin"}
                onClick={() => setMode("checkin")}
                title="Check in"
                sub="I'm at a court, shooting around"
                emoji="🏀"
              />
              <ModeCard
                active={mode === "host"}
                onClick={() => setMode("host")}
                title="Host a game"
                sub="Open a spot, invite players"
                emoji="📣"
              />
            </div>

            {/* Court picker */}
            <div style={{ marginTop: 24, fontSize: 13, fontWeight: 600, color: C.ink2 }}>Which court?</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {courtsForDisplay.map((c) => {
                const meta = HEAT_META[c.heat];
                const isSelected = courtId === c.id;
                const isHighlighted = isSelected || hoveredCourtId === c.id;
                return (
                  <label
                    key={c.id}
                    onClick={() => setCourtId(c.id)}
                    onMouseEnter={() => setHoveredCourtId(c.id)}
                    onMouseLeave={() => setHoveredCourtId(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: isHighlighted ? C.green : C.surface,
                      border: `1px solid ${isHighlighted ? C.green : C.hair}`,
                      borderRadius: 14, padding: 12, cursor: "pointer",
                      transition: "background-color 0.15s, border-color 0.15s",
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 99, flexShrink: 0,
                      border: `2px solid ${isHighlighted ? "#fff" : C.hair}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && (
                        <div style={{ width: 10, height: 10, borderRadius: 99, background: "#fff" }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: isHighlighted ? "#fff" : C.ink }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: isHighlighted ? "rgba(255,255,255,0.85)" : C.ink3 }}>
                        {c.address}
                        {c.liveCount > 0 && ` · ${c.liveCount} here`}
                      </div>
                    </div>
                    <div style={{
                      width: 8, height: 8, borderRadius: 99, flexShrink: 0,
                      background: isHighlighted ? "#fff" : meta.color,
                    }} />
                  </label>
                );
              })}

              {dbCourts.length > 5 && (
                <button
                  onClick={() => navigate("/courts", { state: { view: "list" } })}
                  onMouseEnter={() => setHoveredCourtId("__see_all__")}
                  onMouseLeave={() => setHoveredCourtId(null)}
                  style={{
                    padding: "10px 14px", borderRadius: 14,
                    border: `1px solid ${hoveredCourtId === "__see_all__" ? C.green : C.hair}`,
                    background: hoveredCourtId === "__see_all__" ? C.green : C.surface,
                    fontSize: 13, fontWeight: 500,
                    color: hoveredCourtId === "__see_all__" ? "#fff" : C.ink3,
                    cursor: "pointer", fontFamily: font, textAlign: "left",
                    transition: "background-color 0.15s, border-color 0.15s, color 0.15s",
                  }}
                >
                  See all courts →
                </button>
              )}

              {dbCourts.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: C.ink3, fontSize: 13 }}>
                  No courts are available yet.{" "}
                  <button onClick={() => navigate("/courts")} style={{
                    background: "none", border: "none", color: C.green,
                    fontWeight: 600, cursor: "pointer", fontFamily: font, fontSize: 13,
                  }}>Browse courts</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── STEP 1: Vibe + When + Players ── */}
        {step === 1 && (
          <>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>Set the vibe</div>
            <div style={{ fontSize: 14, color: C.ink3, marginTop: 6 }}>Help others know what to expect.</div>

            {/* Vibe */}
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 12, color: C.ink3, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>Vibe</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
                {([
                  { k: "casual", label: "Casual", sub: "Just shooting" },
                  { k: "pickup", label: "Pickup", sub: "5v5 for fun" },
                  { k: "compete", label: "Compete", sub: "Bring it" },
                ] as const).map((v) => (
                  <div key={v.k} onClick={() => setVibe(v.k)} style={{
                    background: vibe === v.k ? C.green : "#fff",
                    color: vibe === v.k ? "#fff" : C.ink,
                    border: `1px solid ${vibe === v.k ? C.green : C.hair}`,
                    borderRadius: 14, padding: 12, cursor: "pointer", textAlign: "center",
                    transition: "background 0.15s, color 0.15s",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{v.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{v.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* When */}
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 12, color: C.ink3, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>When</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {([
                  { k: "now", label: "Right now", sub: "Start immediately" },
                  { k: "30", label: "In 30 min", sub: "Time to gather" },
                  { k: "later", label: "Pick time", sub: "Schedule ahead" },
                ] as const).map((w) => (
                  <div key={w.k} onClick={() => { setWhen(w.k); if (w.k === "later") setPickerOpen(true); }} style={{
                    flex: 1,
                    background: when === w.k ? C.greenSoft : "#fff",
                    border: `1px solid ${when === w.k ? C.green : C.hair}`,
                    borderRadius: 14, padding: 12, cursor: "pointer", textAlign: "center",
                    transition: "background 0.15s",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: when === w.k ? C.greenInk : C.ink }}>{w.label}</div>
                    <div style={{ fontSize: 10, color: C.ink3, marginTop: 2 }}>
                      {w.k === "later" && pickedDate && pickedTime
                        ? `${pickedDate} ${formatTime(pickedTime)}`
                        : w.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Players (only for host) */}
            {mode === "host" && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontSize: 12, color: C.ink3, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>
                  Players · {size} max
                </div>
                <div style={{
                  marginTop: 12, background: C.surface, border: `1px solid ${C.hair}`,
                  borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14,
                }}>
                  <button onClick={() => setSize(Math.max(2, size - 2))} style={{
                    width: 36, height: 36, borderRadius: 10, background: C.hair2, border: "none",
                    fontSize: 18, fontWeight: 600, cursor: "pointer",
                  }}>−</button>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{size}</div>
                    <div style={{ fontSize: 10, color: C.ink3 }}>players</div>
                  </div>
                  <button onClick={() => setSize(Math.min(20, size + 2))} style={{
                    width: 36, height: 36, borderRadius: 10, background: C.hair2, border: "none",
                    fontSize: 18, fontWeight: 600, cursor: "pointer",
                  }}>+</button>
                </div>
              </div>
            )}

            {/* Date/time picker */}
            <IosDateTimePicker
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onConfirm={(d, t) => { setPickedDate(d); setPickedTime(t); }}
              initialDate={pickedDate}
              initialTime={pickedTime}
            />
          </>
        )}

        {/* ── STEP 2: Preview ── */}
        {step === 2 && (
          <>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>Looking good</div>
            <div style={{ fontSize: 14, color: C.ink3, marginTop: 6 }}>
              {mode === "host" ? "Here's what we'll post to the feed." : "Here's your check-in."}
            </div>

            {/* Preview card */}
            <div style={{
              marginTop: 22, background: C.surface, borderRadius: 18,
              border: `1px solid ${C.hair}`, overflow: "hidden",
            }}>
              <div style={{
                height: 90,
                background: `linear-gradient(135deg, ${C.greenSoft}, #EDE8D3)`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42,
              }}>🏀</div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 11, color: C.greenInk, fontWeight: 700, letterSpacing: 0.3 }}>
                  {mode === "host" ? "OPEN GAME" : "CHECKED IN"}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>
                  {selectedCourt?.name || "Unknown court"}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                  <MetaItem icon={<ClockIcon />} label={
                    when === "now" ? "Now" : when === "30" ? "In 30 min" : `${pickedDate} ${pickedTime ? formatTime(pickedTime) : ""}`
                  } />
                  {mode === "host" && (
                    <MetaItem icon={<UsersIcon />} label={`1 of ${size}`} />
                  )}
                  <MetaItem icon={<FlameIcon />} label={
                    vibe === "casual" ? "Casual" : vibe === "pickup" ? "Pickup" : "Competitive"
                  } />
                </div>
              </div>
            </div>

            {/* Notify friends toggle */}
            <div onClick={() => setNotifyFriends((v) => !v)} style={{
              marginTop: 14, background: C.surface, border: `1px solid ${C.hair}`,
              borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center",
              cursor: "pointer",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: notifyFriends ? C.green : C.hair,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background 0.15s",
              }}>
                {notifyFriends && <CheckIcon />}
              </div>
              <div style={{ flex: 1, fontSize: 13 }}>Notify others nearby</div>
            </div>
          </>
        )}
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 92, zIndex: 30,
        padding: "14px 16px 14px",
        background: `linear-gradient(to top, ${C.bg} 55%, transparent)`,
      }}>
        <button
          disabled={!canProceed() || isAdding}
          onClick={() => {
            if (step < 2) setStep(step + 1);
            else handleConfirm();
          }}
          style={{
            width: "100%", height: 54, borderRadius: 16,
            background: canProceed() ? C.green : C.hair,
            color: canProceed() ? "#fff" : C.ink3,
            border: "none", fontSize: 16, fontWeight: 600, cursor: canProceed() ? "pointer" : "default",
            boxShadow: canProceed() ? `0 8px 24px -8px ${C.green}` : "none",
            fontFamily: font, transition: "background 0.2s",
          }}
        >
          {step < 2
            ? "Continue"
            : isAdding
            ? "Posting..."
            : mode === "host"
            ? "Post game"
            : "Check in"}
        </button>
      </div>
    </div>
  );
}

function ModeCard({ active, onClick, title, sub, emoji }: {
  active: boolean; onClick: () => void; title: string; sub: string; emoji: string;
}) {
  return (
    <div onClick={onClick} style={{
      background: active ? C.green : "#fff",
      color: active ? "#fff" : C.ink,
      border: `1px solid ${active ? C.green : C.hair}`,
      borderRadius: 16, padding: 16, cursor: "pointer",
      display: "flex", gap: 14, alignItems: "center",
      transition: "background 0.15s, color 0.15s",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: active ? "rgba(255,255,255,0.12)" : C.hair2,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        flexShrink: 0,
      }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, opacity: active ? 0.7 : 0.6, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: 99, flexShrink: 0,
        border: `2px solid ${active ? "#fff" : C.hair}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {active && <div style={{ width: 10, height: 10, borderRadius: 99, background: C.surface }} />}
      </div>
    </div>
  );
}

function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 12, color: C.ink2 }}>
      {icon}<span>{label}</span>
    </div>
  );
}
