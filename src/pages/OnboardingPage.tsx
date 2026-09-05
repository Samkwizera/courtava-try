import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  LocateFixed,
  MapPin,
  Pencil,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import courtavaLogo from "@/assets/courtava-logo.png";
import { Chip } from "@/components/ui/Chip";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { capture } from "@/lib/analytics";
import { haptic } from "@/lib/haptics";
import { markOnboardingDone } from "@/lib/onboarding";

/** Step 0 is the welcome screen; steps 1-4 are the numbered questions. */
const QUESTION_STEPS = 4;
const TOTAL_STEPS = QUESTION_STEPS + 1;
const STEP_NAMES = ["welcome", "profile", "style", "location", "review"] as const;

const SKILL_LEVELS = [
  { value: "Beginner", description: "Learning the game" },
  { value: "Casual", description: "Playing for fun" },
  { value: "Intermediate", description: "Comfortable in games" },
  { value: "Advanced", description: "Playing competitively" },
  { value: "Pro", description: "High-level competition" },
];

const POSITIONS = [
  "Point Guard",
  "Shooting Guard",
  "Small Forward",
  "Power Forward",
  "Center",
  "Any position",
];

const VIBES = [
  { value: "Casual", description: "Relaxed shootarounds", Icon: Sparkles },
  { value: "Pickup", description: "Friendly five-on-five", Icon: Users },
  { value: "Competitive", description: "Serious games", Icon: Trophy },
];

const AVAILABILITY_OPTIONS = [
  "Weekday mornings",
  "Weekday evenings",
  "Weekend mornings",
  "Weekend afternoons",
  "Anytime",
];

interface Draft {
  step: number;
  skillLevel: string;
  positions: string[];
  vibes: string[];
  availability: string[];
  locationGranted: boolean | null;
}

const EMPTY_DRAFT: Draft = {
  step: 0,
  skillLevel: "",
  positions: [],
  vibes: [],
  availability: [],
  locationGranted: null,
};

const draftKey = (userId: string) => `courtava_onboarding_draft_${userId}`;

function readDraft(userId: string): Draft {
  try {
    const raw = localStorage.getItem(draftKey(userId));
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return {
      ...EMPTY_DRAFT,
      ...parsed,
      step: Math.min(Math.max(parsed.step ?? 0, 0), TOTAL_STEPS - 1),
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

function OptionalTag() {
  return (
    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      Optional
    </span>
  );
}

function SelectedCount({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-auto text-xs font-semibold text-primary" aria-live="polite">
      {count} selected
    </span>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex items-start gap-2 rounded-xl bg-secondary/60 px-3 py-2.5 text-xs leading-5 text-secondary-foreground"
    >
      <Sparkles size={14} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </motion.p>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label.toLowerCase()}`}
        className="ios-tap flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Pencil size={15} />
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reducedMotion = useReducedMotion();

  const [initial] = useState<Draft>(() => (user ? readDraft(user.id) : EMPTY_DRAFT));

  const [step, setStep] = useState(initial.step);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [skillLevel, setSkillLevel] = useState(initial.skillLevel);
  const [positions, setPositions] = useState<string[]>(initial.positions);
  const [vibes, setVibes] = useState<string[]>(initial.vibes);
  const [availability, setAvailability] = useState<string[]>(initial.availability);
  const [locationGranted, setLocationGranted] = useState<boolean | null>(initial.locationGranted);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const restored = initial.step > 0;

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Player";

  // Autosave the draft locally on every change so a refresh never loses progress.
  useEffect(() => {
    if (!user) return;
    const draft: Draft = { step, skillLevel, positions, vibes, availability, locationGranted };
    try {
      localStorage.setItem(draftKey(user.id), JSON.stringify(draft));
    } catch {
      /* storage unavailable */
    }
  }, [user, step, skillLevel, positions, vibes, availability, locationGranted]);

  // Analytics: step views.
  useEffect(() => {
    capture("onboarding_step_viewed", { step: STEP_NAMES[step], index: step });
  }, [step]);

  const canContinue =
    step === 1
      ? Boolean(skillLevel && positions.length)
      : step === 2
        ? vibes.length > 0
        : true;

  const toggleValue = (value: string, setValues: Dispatch<SetStateAction<string[]>>) => {
    setValues((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const togglePosition = (value: string) => {
    setPositions((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      if (value === "Any position") return [value];
      return [...current.filter((item) => item !== "Any position"), value];
    });
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationGranted(false);
      capture("onboarding_location_result", { granted: false, reason: "unsupported" });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        haptic("success");
        setLocationGranted(true);
        setIsLocating(false);
        capture("onboarding_location_result", { granted: true });
      },
      (error) => {
        setLocationGranted(false);
        setIsLocating(false);
        capture("onboarding_location_result", { granted: false, reason: error.code });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  /** Best-effort server sync of the answers so far. Silent on failure. */
  const syncProfile = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        skill_level: skillLevel || null,
        position: positions.length ? positions : null,
        play_styles: vibes.length ? vibes : null,
        availability: availability.length ? availability : null,
      })
      .eq("id", user.id);
  }, [user, skillLevel, positions, vibes, availability]);

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleNext = () => {
    if (!canContinue || isSaving) return;
    haptic("selection");
    capture("onboarding_step_completed", { step: STEP_NAMES[step], index: step });
    if (step === 1 || step === 2) void syncProfile().catch(() => undefined);
    if (step < TOTAL_STEPS - 1) goTo(step + 1);
    else void handleFinish();
  };

  const handleSkip = () => {
    capture("onboarding_step_skipped", { step: STEP_NAMES[step], index: step });
    goTo(step + 1);
  };

  const handleFinish = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          skill_level: skillLevel || null,
          position: positions.length ? positions : null,
          play_styles: vibes.length ? vibes : null,
          availability: availability.length ? availability : null,
        })
        .eq("id", user.id);
      if (error) throw error;

      if (locationGranted) {
        const { error: settingsError } = await supabase
          .from("user_settings")
          .upsert({ user_id: user.id, location_enabled: true }, { onConflict: "user_id" });
        if (settingsError) throw settingsError;
      }

      capture("onboarding_completed", {
        skill_level: skillLevel,
        positions: positions.length,
        vibes,
        availability: availability.length,
        location_enabled: locationGranted === true,
      });
      haptic("success");
      localStorage.removeItem(draftKey(user.id));
      markOnboardingDone(user.id);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Onboarding finish error:", error);
      capture("onboarding_save_failed");
      setSaveError("We could not save your setup. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const personalizationHint = (() => {
    if (step === 1 && skillLevel) {
      const pos = positions.includes("Any position")
        ? "games at any position"
        : positions.length
          ? `${positions.join(" and ")} opportunities`
          : "games";
      return `We will prioritize ${skillLevel.toLowerCase()} ${pos}.`;
    }
    if (step === 2 && vibes.length) {
      const when = availability.length && !availability.includes("Anytime")
        ? ` on ${availability.map((a) => a.toLowerCase()).join(", ")}`
        : "";
      return `Your feed will lead with ${vibes.map((v) => v.toLowerCase()).join(" and ")} games${when}.`;
    }
    return null;
  })();

  const slide = {
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, x: 32 * direction },
    animate: { opacity: 1, x: 0 },
    exit: reducedMotion ? { opacity: 0 } : { opacity: 0, x: -32 * direction },
  };

  const progress = step === 0 ? 0 : step / QUESTION_STEPS;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <section className="flex min-h-[100dvh] flex-col">
        <header className="mx-auto flex w-full max-w-2xl items-center gap-4 px-5 pb-4 pt-6 sm:px-8 lg:pt-8">
          {step > 0 ? (
            <button
              type="button"
              aria-label="Go to previous step"
              onClick={() => goTo(step - 1)}
              className="ios-tap flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft size={19} />
            </button>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
              <img src={courtavaLogo} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>{step === 0 ? "Getting started" : `Step ${step} of ${QUESTION_STEPS}`}</span>
              {step > 0 && <span>{Math.round(progress * 100)}%</span>}
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={QUESTION_STEPS}
              aria-valuenow={step}
            >
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${progress * 100}%` }}
                transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 26 }}
              />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-x-hidden px-5 py-6 sm:px-8 lg:justify-center lg:py-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              {...slide}
              transition={reducedMotion ? { duration: 0.12 } : { type: "spring", stiffness: 320, damping: 32 }}
              className="w-full"
            >
              {step === 0 && (
                <div className="mx-auto w-full max-w-lg text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <Trophy size={31} />
                  </span>
                  <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.04em]">
                    Welcome, {displayName}
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                    Four quick questions so Courtava can show you better games, courts, and players. It takes about a minute.
                  </p>

                  <div className="mt-8 grid gap-3 text-left">
                    {[
                      { Icon: MapPin, text: "Find active courts near you" },
                      { Icon: Target, text: "Match with your skill level" },
                      { Icon: Users, text: "Join games and meet players" },
                    ].map(({ Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
                        <Icon size={19} className="text-primary" />
                        <span className="text-sm font-semibold">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="w-full">
                  {restored && (
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      <Check size={13} /> Picked up where you left off
                    </p>
                  )}
                  <h2 className="text-3xl font-extrabold tracking-[-0.04em]">Your player profile</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Choose the options that best describe how you play.
                  </p>

                  <fieldset className="mt-7">
                    <legend className="mb-3 text-sm font-bold">Skill level</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {SKILL_LEVELS.map((level) => {
                        const selected = skillLevel === level.value;
                        return (
                          <motion.button
                            key={level.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                            onClick={() => {
                              haptic("selection");
                              setSkillLevel(level.value);
                            }}
                            className={`ios-tap flex items-center gap-3 rounded-2xl border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                              selected
                                ? "border-primary bg-secondary text-secondary-foreground"
                                : "border-border bg-card hover:bg-muted/50"
                            }`}
                          >
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                              {selected && <Check size={12} strokeWidth={3} />}
                            </span>
                            <span>
                              <span className="block text-sm font-bold">{level.value}</span>
                              <span className="block text-xs opacity-70">{level.description}</span>
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset className="mt-7">
                    <legend className="mb-3 flex w-full items-center text-sm font-bold">
                      Positions
                      <span className="ml-2 text-xs font-medium text-muted-foreground">Pick one or more</span>
                      <SelectedCount count={positions.length} />
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {POSITIONS.map((item) => (
                        <Chip key={item} selected={positions.includes(item)} onClick={() => togglePosition(item)}>
                          {item}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>

                  {personalizationHint && <Hint>{personalizationHint}</Hint>}
                </div>
              )}

              {step === 2 && (
                <div className="w-full">
                  <h2 className="text-3xl font-extrabold tracking-[-0.04em]">How do you like to play?</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Pick at least one game style. Your schedule helps us time suggestions.
                  </p>

                  <fieldset className="mt-7">
                    <legend className="mb-3 flex w-full items-center text-sm font-bold">
                      Game style
                      <SelectedCount count={vibes.length} />
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {VIBES.map(({ value, description, Icon }) => {
                        const selected = vibes.includes(value);
                        return (
                          <motion.button
                            key={value}
                            type="button"
                            aria-pressed={selected}
                            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                            onClick={() => {
                              haptic("selection");
                              toggleValue(value, setVibes);
                            }}
                            className={`ios-tap rounded-2xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                              selected
                                ? "border-primary bg-secondary text-secondary-foreground"
                                : "border-border bg-card hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Icon size={20} className={selected ? "" : "text-primary"} />
                              {selected && <Check size={16} strokeWidth={3} />}
                            </div>
                            <span className="mt-4 block text-sm font-bold">{value}</span>
                            <span className="mt-1 block text-xs opacity-70">{description}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset className="mt-7">
                    <legend className="mb-3 flex w-full items-center text-sm font-bold">
                      When do you usually play?
                      <OptionalTag />
                      <SelectedCount count={availability.length} />
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABILITY_OPTIONS.map((item) => (
                        <Chip
                          key={item}
                          selected={availability.includes(item)}
                          onClick={() => toggleValue(item, setAvailability)}
                        >
                          {item}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>

                  {personalizationHint && <Hint>{personalizationHint}</Hint>}
                </div>
              )}

              {step === 3 && (
                <div className="mx-auto w-full max-w-md text-center">
                  <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary text-secondary-foreground">
                    <LocateFixed size={34} />
                  </span>
                  <h2 className="mt-6 flex items-center justify-center text-3xl font-extrabold tracking-[-0.04em]">
                    Find courts near you
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                    Location shows nearby courts and live activity. This is optional and only used while you use the app.
                  </p>

                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={isLocating || locationGranted === true}
                    className="ios-tap mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-sm font-bold outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-70"
                  >
                    {locationGranted === true ? (
                      <>
                        <Check size={18} className="text-primary" />
                        Location enabled
                      </>
                    ) : isLocating ? (
                      "Finding your location..."
                    ) : (
                      <>
                        <MapPin size={18} className="text-primary" />
                        Use my location
                      </>
                    )}
                  </button>

                  {locationGranted === false && (
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      Location was not enabled. You can turn it on any time in Settings.
                    </p>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="w-full">
                  <h2 className="text-3xl font-extrabold tracking-[-0.04em]">Looks good?</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Review your answers. You can change everything later from your profile.
                  </p>

                  <div className="mt-7 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                    <ReviewRow label="Skill level" value={skillLevel || "Not set"} onEdit={() => goTo(1)} />
                    <ReviewRow label="Positions" value={positions.join(", ") || "Not set"} onEdit={() => goTo(1)} />
                    <ReviewRow label="Game style" value={vibes.join(", ") || "Not set"} onEdit={() => goTo(2)} />
                    <ReviewRow label="Availability" value={availability.join(", ") || "Not set"} onEdit={() => goTo(2)} />
                    <ReviewRow
                      label="Location"
                      value={locationGranted ? "Enabled" : "Off"}
                      onEdit={() => goTo(3)}
                    />
                  </div>

                  {saveError && (
                    <div
                      role="alert"
                      className="mt-5 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground"
                    >
                      <AlertCircle size={18} className="mt-0.5 shrink-0 text-destructive" />
                      <div className="flex-1">
                        <p className="font-semibold">Save failed</p>
                        <p className="mt-0.5 text-muted-foreground">{saveError}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="sticky bottom-0 z-20 mt-auto border-t border-border bg-background/95 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
            <button
              type="button"
              disabled={!canContinue || isSaving}
              onClick={handleNext}
              className="ios-tap h-12 w-full rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-button outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              {isSaving
                ? "Saving..."
                : saveError
                  ? "Retry"
                  : step === 0
                    ? "Get started"
                    : step === TOTAL_STEPS - 1
                      ? "Finish setup"
                      : "Continue"}
            </button>
            {step === 3 && locationGranted !== true && (
              <button
                type="button"
                onClick={handleSkip}
                className="ios-tap h-10 w-full rounded-xl text-sm font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                Skip for now
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
