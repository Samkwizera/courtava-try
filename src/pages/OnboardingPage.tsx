import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { markOnboardingDone } from "@/lib/onboarding";

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

const TOTAL_STEPS = 5;

const SKILL_LEVELS = [
  { k: "Beginner",     sub: "Just starting out" },
  { k: "Casual",       sub: "Play for fun" },
  { k: "Intermediate", sub: "Hold my own" },
  { k: "Advanced",     sub: "Competitive edge" },
  { k: "Pro",          sub: "High level game" },
];

const POSITIONS = [
  "Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center", "Any position",
];

const VIBES = [
  { k: "Casual",      sub: "Just shoot around", emoji: "😎" },
  { k: "Pickup",      sub: "5v5 for fun",       emoji: "🏀" },
  { k: "Competitive", sub: "Bring it on",        emoji: "🔥" },
];

const AVAILABILITY_OPTIONS = [
  "Weekday mornings", "Weekday evenings", "Weekend mornings", "Weekend afternoons", "Anytime",
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1
  const [skillLevel, setSkillLevel] = useState("");

  // Step 2
  const [position, setPosition] = useState("");
  const [vibes, setVibes] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);

  // Step 3 — location
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Player";

  const canContinue = () => {
    if (step === 1) return !!skillLevel;
    if (step === 2) return !!position && vibes.length > 0;
    // step 3 (availability) and step 4 (location) are always continuable
    return true;
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationGranted(false);
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => { setLocationGranted(true); setIsLocating(false); },
      () => { setLocationGranted(false); setIsLocating(false); }
    );
  };

  const handleFinish = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        skill_level: skillLevel || null,
        position: position || null,
        play_styles: vibes.length > 0 ? vibes : null,
        availability: availability.length > 0 ? availability : null,
      }).eq("id", user.id);

      if (error) {
        console.error("Profile update error:", error);
        toast.error("Could not save your profile. You can update it from the Profile tab.");
      }

      markOnboardingDone(user.id);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Onboarding finish error:", err);
      toast.error("Something went wrong. You can update your profile later.");
      markOnboardingDone(user.id);
      navigate("/", { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else handleFinish();
  };

  const handleSkip = () => {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else {
      if (user) markOnboardingDone(user.id);
      navigate("/", { replace: true });
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, fontFamily: font, color: C.ink,
      display: "flex", flexDirection: "column",
    }}>

      {/* Progress dots */}
      <div style={{ padding: "60px 24px 0", display: "flex", justifyContent: "center", gap: 6 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{
            height: 4, borderRadius: 99,
            width: i === step ? 24 : 6,
            background: i <= step ? C.green : C.hair,
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, padding: "32px 24px 0", overflowY: "auto", paddingBottom: 160 }}>

        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <div style={{ textAlign: "center", paddingTop: 32 }}>
            <div style={{ fontSize: 56, marginBottom: 24 }}>🏀</div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, marginBottom: 12 }}>
              Welcome, {displayName}!
            </div>
            <div style={{ fontSize: 16, color: C.ink2, lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
              Let's set up your player profile so you can find the right games and courts near you.
            </div>

            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14, maxWidth: 320, margin: "40px auto 0" }}>
              {[
                { emoji: "📍", label: "Find courts near you" },
                { emoji: "🎯", label: "Match with your skill level" },
                { emoji: "👥", label: "Join games & check in" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: C.surface, borderRadius: 14,
                  border: `1px solid ${C.hair}`, padding: "14px 16px",
                }}>
                  <span style={{ fontSize: 22 }}>{item.emoji}</span>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Skill level ── */}
        {step === 1 && (
          <>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>What's your level?</div>
            <div style={{ fontSize: 14, color: C.ink2, marginTop: 8, lineHeight: 1.5 }}>
              This helps us match you with the right games. You can always change it later.
            </div>

            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              {SKILL_LEVELS.map((s, i) => {
                const isSelected = skillLevel === s.k;
                return (
                  <div key={s.k} onClick={() => setSkillLevel(s.k)} style={{
                    background: isSelected ? C.ink : C.surface,
                    color: isSelected ? "#fff" : C.ink,
                    border: `1px solid ${isSelected ? C.ink : C.hair}`,
                    borderRadius: 16, padding: "14px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "background 0.15s",
                  }}>
                    {/* level bar */}
                    <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} style={{
                          width: 5, height: 18, borderRadius: 3,
                          background: j <= i
                            ? (isSelected ? "#fff" : C.green)
                            : (isSelected ? "rgba(255,255,255,0.25)" : C.hair),
                          transition: "background 0.15s",
                        }} />
                      ))}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{s.k}</div>
                      <div style={{ fontSize: 12, opacity: 0.65, marginTop: 1 }}>{s.sub}</div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: 99, flexShrink: 0,
                      border: `2px solid ${isSelected ? "#fff" : C.hair}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && <div style={{ width: 10, height: 10, borderRadius: 99, background: "#fff" }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── STEP 2: Position + Vibe ── */}
        {step === 2 && (
          <>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Your game style</div>
            <div style={{ fontSize: 14, color: C.ink2, marginTop: 8 }}>Tell others what to expect from you.</div>

            {/* Position */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 12, color: C.ink3, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 10 }}>
                Position
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {POSITIONS.map((p) => {
                  const isSelected = position === p;
                  return (
                    <div key={p} onClick={() => setPosition(p)} style={{
                      background: isSelected ? C.ink : C.surface,
                      color: isSelected ? "#fff" : C.ink,
                      border: `1px solid ${isSelected ? C.ink : C.hair}`,
                      borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                      fontSize: 13, fontWeight: 500,
                      transition: "background 0.15s",
                    }}>
                      {p}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vibe */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, color: C.ink3, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 10 }}>
                Preferred game vibe <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none" }}>(pick all that apply)</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {VIBES.map((v) => {
                  const isSelected = vibes.includes(v.k);
                  return (
                    <div key={v.k} onClick={() => setVibes((prev) =>
                      prev.includes(v.k) ? prev.filter((x) => x !== v.k) : [...prev, v.k]
                    )} style={{
                      background: isSelected ? C.greenSoft : C.surface,
                      border: `1px solid ${isSelected ? C.green : C.hair}`,
                      borderRadius: 14, padding: "12px 14px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12,
                      transition: "background 0.15s",
                    }}>
                      <span style={{ fontSize: 20 }}>{v.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: isSelected ? C.greenInk : C.ink }}>{v.k}</div>
                        <div style={{ fontSize: 12, color: C.ink3, marginTop: 1 }}>{v.sub}</div>
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: 99, flexShrink: 0,
                        border: `2px solid ${isSelected ? C.green : C.hair}`,
                        background: isSelected ? C.green : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── STEP 3: When do you usually play? ── */}
        {step === 3 && (
          <>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>When do you play?</div>
            <div style={{ fontSize: 14, color: C.ink2, marginTop: 8, lineHeight: 1.5 }}>
              Help us show you games that fit your schedule.
            </div>

            <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {AVAILABILITY_OPTIONS.map((a) => {
                const isSelected = availability.includes(a);
                return (
                  <div key={a} onClick={() => setAvailability((prev) =>
                    prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
                  )} style={{
                    padding: "12px 18px", borderRadius: 99, cursor: "pointer",
                    fontSize: 14, fontWeight: 500,
                    background: isSelected ? C.ink : C.surface,
                    color: isSelected ? "#fff" : C.ink,
                    border: `1px solid ${isSelected ? C.ink : C.hair}`,
                    transition: "background 0.15s",
                  }}>
                    {a}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 20, fontSize: 13, color: C.ink3 }}>
              Select all that apply — this is optional.
            </div>
          </>
        )}

        {/* ── STEP 4: Location ── */}
        {step === 4 && (
          <div style={{ textAlign: "center", paddingTop: 16 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 28, background: C.greenSoft,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 44, margin: "0 auto 28px",
            }}>📍</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6, marginBottom: 12 }}>
              Find courts near you
            </div>
            <div style={{ fontSize: 15, color: C.ink2, lineHeight: 1.6, maxWidth: 300, margin: "0 auto 36px" }}>
              Allow location access to see active courts, players, and games in your area.
            </div>

            {locationGranted === null && (
              <button onClick={requestLocation} disabled={isLocating} style={{
                width: "100%", maxWidth: 320, height: 54, borderRadius: 16,
                background: C.green, color: "#fff", border: "none",
                fontSize: 16, fontWeight: 600, cursor: "pointer",
                boxShadow: `0 8px 24px -8px ${C.green}`, fontFamily: font,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                margin: "0 auto",
              }}>
                {isLocating ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Finding location...</>
                ) : (
                  "Allow Location"
                )}
              </button>
            )}

            {locationGranted === true && (
              <div style={{
                background: C.greenSoft, borderRadius: 14, padding: "16px 20px",
                display: "inline-flex", alignItems: "center", gap: 10,
                color: C.greenInk, fontWeight: 600, fontSize: 15,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Location enabled!
              </div>
            )}

            {locationGranted === false && (
              <div style={{ color: C.ink3, fontSize: 14, lineHeight: 1.6 }}>
                No problem — you can enable this later in your browser settings.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
        padding: "16px 24px 44px",
        background: `linear-gradient(to top, ${C.bg} 60%, transparent)`,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        <button
          disabled={!canContinue() || isSaving}
          onClick={handleNext}
          style={{
            height: 54, borderRadius: 16, border: "none",
            background: canContinue() ? C.green : C.hair,
            color: canContinue() ? "#fff" : C.ink3,
            fontSize: 16, fontWeight: 600, cursor: canContinue() ? "pointer" : "default",
            boxShadow: canContinue() ? `0 8px 24px -8px ${C.green}` : "none",
            fontFamily: font, transition: "background 0.2s",
          }}
        >
          {isSaving ? "Saving..." : step === TOTAL_STEPS - 1 ? "Let's play 🏀" : "Continue"}
        </button>

        {step > 0 && step < TOTAL_STEPS - 1 && (
          <button onClick={handleSkip} style={{
            height: 40, borderRadius: 12, border: "none", background: "transparent",
            fontSize: 14, color: C.ink3, cursor: "pointer", fontFamily: font,
          }}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
