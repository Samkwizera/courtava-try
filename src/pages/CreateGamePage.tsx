import { type ReactNode, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGames, GameInsert } from "@/hooks/useGames";
import { useCourts } from "@/hooks/useCourts";
import { useCheckIns } from "@/hooks/useCheckIns";
import { IosDateTimePicker } from "@/components/ui/IosDrumPicker";
import { C, RING } from "@/lib/tokens";
import { OptionCard } from "@/components/ui/OptionCard";
import {
  Bell,
  Check,
  ChevronLeft,
  Clock3,
  Flame,
  MapPin,
  Megaphone,
  Minus,
  Radio,
  Search,
  Trophy,
  Users,
  X,
} from "lucide-react";


const font = `"Inter", -apple-system, system-ui, sans-serif`;

const HEAT_META: Record<string, { color: string; ring: string }> = {
  high:   { color: C.green,  ring: RING.green },
  medium: { color: C.amber, ring: RING.amber },
  low:    { color: C.ink3,   ring: RING.neutral },
};

function getHeat(count: number): "high" | "medium" | "low" {
  if (count >= 6) return "high";
  if (count >= 2) return "medium";
  return "low";
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

  // Step 1
  const [mode, setMode] = useState<"checkin" | "host">(navState?.mode ?? "checkin");
  const [courtId, setCourtId] = useState(navState?.courtId ?? "");
  const [courtSearch, setCourtSearch] = useState("");

  // Step 2
  const [vibe, setVibe] = useState<"casual" | "pickup" | "compete">("casual");
  const [when, setWhen] = useState<"now" | "30" | "later">("now");
  const [size, setSize] = useState(10);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState("");
  const [pickedTime, setPickedTime] = useState("");

  // Step 3
  const [notifyFriends, setNotifyFriends] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const selectedCourt = dbCourts.find((c) => c.id === courtId);

  const courtsWithActivity = useMemo(
    () =>
      dbCourts.map((court) => {
        const liveCount = checkIns.filter((ci) => ci.court_id === court.id).length;
        return { ...court, liveCount, heat: getHeat(liveCount) };
      }),
    [dbCourts, checkIns]
  );

  const courtsForDisplay = useMemo(() => {
    const query = courtSearch.trim().toLowerCase();
    return courtsWithActivity
      .filter((court) => {
        if (!query) return true;
        return (
          court.name.toLowerCase().includes(query) ||
          court.address.toLowerCase().includes(query) ||
          court.surface.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.liveCount - a.liveCount || a.name.localeCompare(b.name))
      .slice(0, 8);
  }, [courtsWithActivity, courtSearch]);

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
      try {
        setIsCheckingIn(true);
        const result = await doCheckIn(courtId);
        if (result) setShowSuccess(true);
      } finally {
        setIsCheckingIn(false);
      }
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
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            margin: "0 auto 18px",
            background: C.greenSoft,
            color: C.greenInk,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {successMode === "checkin" ? <Radio size={30} strokeWidth={1.9} /> : <Megaphone size={30} strokeWidth={1.9} />}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            {successMode === "checkin" ? "Checked in!" : "Game posted!"}
          </div>
          <div style={{ fontSize: 15, color: C.ink3, marginBottom: 32 }}>
            {successMode === "checkin"
              ? `You're now checked in at ${selectedCourt?.name}. Let the neighborhood know you're hooping!`
              : `Your game at ${selectedCourt?.name} is live. Others can now see and join it.`}
          </div>
          <button onClick={() => navigate("/")} style={{
            width: "100%", height: 54, borderRadius: 16,
            background: C.green, color: C.onGreen, border: "none",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            boxShadow: `0 8px 24px -8px ${C.green}`, fontFamily: font,
            marginBottom: 10,
          }}>Back to home</button>
          <button onClick={() => navigate("/games")} style={{
            width: "100%", height: 54, borderRadius: 16,
            background: C.surface, color: C.ink, border: `1px solid ${C.hair}`,
            fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: font,
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
            <ChevronLeft size={18} color={C.ink} strokeWidth={2} />
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

        {/* STEP 0: Mode + Court */}
        {step === 0 && (
          <>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6 }}>What are you up to?</div>
            <div style={{ fontSize: 15, color: C.ink3, marginTop: 6 }}>Let the neighborhood know you're hooping.</div>

            {/* Mode cards */}
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
              <ModeCard
                active={mode === "checkin"}
                onClick={() => setMode("checkin")}
                title="Check in"
                sub="I'm at a court, shooting around"
                icon={<Radio size={21} strokeWidth={1.9} />}
              />
              <ModeCard
                active={mode === "host"}
                onClick={() => setMode("host")}
                title="Host a game"
                sub="Open a spot, invite players"
                icon={<Megaphone size={21} strokeWidth={1.9} />}
              />
            </div>

            {/* Court picker */}
            <div style={{ marginTop: 24, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink2 }}>Which court?</div>
              <div style={{ fontSize: 12, color: C.ink3 }}>{dbCourts.length} available</div>
            </div>
            <div style={{ position: "relative", marginTop: 10 }}>
              <Search size={15} color={C.ink3} strokeWidth={1.9} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                value={courtSearch}
                onChange={(event) => setCourtSearch(event.target.value)}
                placeholder="Search by court, area, or surface"
                style={{
                  width: "100%",
                  height: 42,
                  borderRadius: 14,
                  border: `1px solid ${C.hair}`,
                  background: C.surface,
                  color: C.ink,
                  outline: "none",
                  padding: "0 38px",
                  fontSize: 14,
                  fontFamily: font,
                }}
              />
              {courtSearch && (
                <button
                  type="button"
                  aria-label="Clear court search"
                  onClick={() => setCourtSearch("")}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 22,
                    height: 22,
                    borderRadius: 99,
                    border: "none",
                    background: C.hair2,
                    color: C.ink3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {courtsForDisplay.map((c) => {
                const meta = HEAT_META[c.heat];
                return (
                  <label key={c.id} onClick={() => setCourtId(c.id)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: C.surface, border: `1px solid ${courtId === c.id ? C.ink : C.hair}`,
                    borderRadius: 16, padding: 12, cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 99, flexShrink: 0,
                      border: `2px solid ${courtId === c.id ? C.ink : C.hair}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {courtId === c.id && (
                        <div style={{ width: 10, height: 10, borderRadius: 99, background: C.ink }} />
                      )}
                    </div>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: C.hair2,
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.green,
                    }}>
                      {c.photo_url ? (
                        <img src={c.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <MapPin size={18} strokeWidth={1.9} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: C.ink3 }}>
                        {c.address}
                        {c.liveCount > 0 && ` / ${c.liveCount} here`}
                      </div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: 99, background: meta.color, flexShrink: 0 }} />
                  </label>
                );
              })}

              {courtsForDisplay.length === 0 && dbCourts.length > 0 && (
                <div style={{
                  textAlign: "center",
                  padding: "24px 16px",
                  color: C.ink3,
                  fontSize: 13,
                  background: C.surface,
                  border: `1px solid ${C.hair}`,
                  borderRadius: 16,
                }}>
                  No courts match that search.
                </div>
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

        {/* STEP 1: Vibe + When + Players */}
        {step === 1 && (
          <>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6 }}>Set the vibe</div>
            <div style={{ fontSize: 15, color: C.ink3, marginTop: 6 }}>Help others know what to expect.</div>

            {/* Vibe */}
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 12, color: C.ink3, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>Vibe</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
                {([
                  { k: "casual", label: "Casual", sub: "Shooting", leading: <Users size={17} strokeWidth={1.9} /> },
                  { k: "pickup", label: "Pickup", sub: "5v5", leading: <Flame size={17} strokeWidth={1.9} /> },
                  { k: "compete", label: "Compete", sub: "Serious", leading: <Trophy size={17} strokeWidth={1.9} /> },
                ] as const).map((v) => (
                  <OptionCard
                    key={v.k}
                    label={v.label}
                    sub={v.sub}
                    leading={v.leading}
                    selected={vibe === v.k}
                    onClick={() => setVibe(v.k)}
                  />
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
                  <div key={w.k} style={{ flex: 1 }}>
                    <OptionCard
                      label={w.label}
                      tone="green"
                      leading={<Clock3 size={17} strokeWidth={1.9} />}
                      sub={
                        w.k === "later" && pickedDate && pickedTime
                          ? `${pickedDate} ${formatTime(pickedTime)}`
                          : w.sub
                      }
                      selected={when === w.k}
                      onClick={() => {
                        setWhen(w.k);
                        if (w.k === "later") setPickerOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Players (only for host) */}
            {mode === "host" && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontSize: 12, color: C.ink3, fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>
                  Players / {size} max
                </div>
                <div style={{
                  marginTop: 12, background: C.surface, border: `1px solid ${C.hair}`,
                  borderRadius: 16, padding: 14, display: "flex", alignItems: "center", gap: 14,
                }}>
                  <button onClick={() => setSize(Math.max(2, size - 2))} style={{
                    width: 36, height: 36, borderRadius: 12, background: C.hair2, border: "none",
                    cursor: "pointer", color: C.ink,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }} aria-label="Reduce max players">
                    <Minus size={16} strokeWidth={2.2} />
                  </button>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{size}</div>
                    <div style={{ fontSize: 11, color: C.ink3 }}>players</div>
                  </div>
                  <button onClick={() => setSize(Math.min(20, size + 2))} style={{
                    width: 36, height: 36, borderRadius: 12, background: C.hair2, border: "none",
                    fontSize: 17, fontWeight: 600, cursor: "pointer",
                  }} aria-label="Increase max players">+</button>
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

        {/* STEP 2: Preview */}
        {step === 2 && (
          <>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6 }}>Looking good</div>
            <div style={{ fontSize: 15, color: C.ink3, marginTop: 6 }}>
              {mode === "host" ? "Here's what we'll post to the feed." : "Here's your check-in."}
            </div>

            {/* Preview card */}
            <div style={{
              marginTop: 22, background: C.surface, borderRadius: 16,
              border: `1px solid ${C.hair}`, overflow: "hidden",
            }}>
              <div style={{
                height: 90,
                background: C.hair2,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                {selectedCourt?.photo_url ? (
                  <img src={selectedCourt.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <MapPin size={30} color={C.green} strokeWidth={1.9} />
                )}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.02), rgba(0,0,0,0.22))" }} />
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 11, color: C.greenInk, fontWeight: 700, letterSpacing: 0.3 }}>
                  {mode === "host" ? "OPEN GAME" : "CHECKED IN"}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3 }}>
                  {selectedCourt?.name || "Unknown court"}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                  <MetaItem icon={<Clock3 size={14} color={C.ink2} strokeWidth={1.8} />} label={
                    when === "now" ? "Now" : when === "30" ? "In 30 min" : `${pickedDate} ${pickedTime ? formatTime(pickedTime) : ""}`
                  } />
                  {mode === "host" && (
                    <MetaItem icon={<Users size={14} color={C.ink2} strokeWidth={1.8} />} label={`1 of ${size}`} />
                  )}
                  <MetaItem icon={<Flame size={13} color={C.green} fill={C.green} strokeWidth={0} />} label={
                    vibe === "casual" ? "Casual" : vibe === "pickup" ? "Pickup" : "Competitive"
                  } />
                </div>
              </div>
            </div>

            {/* Notify friends toggle */}
            <button type="button" onClick={() => setNotifyFriends((v) => !v)} style={{
              width: "100%",
              textAlign: "left",
              marginTop: 14, background: C.surface, border: `1px solid ${C.hair}`,
              borderRadius: 16, padding: 14, display: "flex", gap: 12, alignItems: "center",
              cursor: "pointer", fontFamily: font, color: C.ink,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 8,
                background: notifyFriends ? C.green : C.hair,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background 0.15s",
              }}>
                {notifyFriends && <Check size={14} color={C.onGreen} strokeWidth={2.4} />}
              </div>
              <div style={{ flex: 1, fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                  <Bell size={14} strokeWidth={1.9} />
                  Notify others nearby
                </div>
                <div style={{ color: C.ink3, fontSize: 12, marginTop: 2 }}>
                  Show this in the activity feed for players around the court.
                </div>
              </div>
            </button>
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
          disabled={!canProceed() || isAdding || isCheckingIn}
          onClick={() => {
            if (step < 2) setStep(step + 1);
            else handleConfirm();
          }}
          style={{
            width: "100%", height: 54, borderRadius: 16,
            background: canProceed() ? C.green : C.hair,
            color: canProceed() ? C.onGreen : C.ink3,
            border: "none", fontSize: 15, fontWeight: 600, cursor: canProceed() ? "pointer" : "default",
            boxShadow: canProceed() ? `0 8px 24px -8px ${C.green}` : "none",
            fontFamily: font, transition: "background 0.2s",
          }}
        >
          {step < 2
            ? "Continue"
            : isAdding || isCheckingIn
            ? mode === "host" ? "Posting..." : "Checking in..."
            : mode === "host"
            ? "Post game"
            : "Check in"}
        </button>
      </div>
    </div>
  );
}

function ModeCard({ active, onClick, title, sub, icon }: {
  active: boolean; onClick: () => void; title: string; sub: string; icon: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} style={{
      width: "100%",
      textAlign: "left",
      background: active ? C.ink : C.surface,
      color: active ? C.onInk : C.ink,
      border: `1px solid ${active ? C.ink : C.hair}`,
      borderRadius: 16, padding: 16, cursor: "pointer",
      display: "flex", gap: 14, alignItems: "center",
      transition: "background 0.15s, color 0.15s",
      fontFamily: font,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: active ? "rgba(255,255,255,0.12)" : C.hair2,
        color: active ? C.onInk : C.ink2,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, opacity: active ? 0.7 : 0.6, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: 99, flexShrink: 0,
        border: `2px solid ${active ? C.onInk : C.hair}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {active && <div style={{ width: 10, height: 10, borderRadius: 99, background: C.surface }} />}
      </div>
    </button>
  );
}

function MetaItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 12, color: C.ink2 }}>
      {icon}<span>{label}</span>
    </div>
  );
}
