import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Minus, Plus, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useGames, GameInsert } from "@/hooks/useGames";
import { useCourts } from "@/hooks/useCourts";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 7;

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full bg-foreground rounded-full transition-all duration-300"
        style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
      />
    </div>
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ToggleOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 rounded-full text-sm font-medium transition-all border",
        selected
          ? "bg-foreground text-background border-foreground"
          : "bg-background text-foreground border-border hover:bg-secondary"
      )}
    >
      {label}
    </button>
  );
}

export default function CreateGamePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addGame, isAdding } = useGames();
  const { dbCourts } = useCourts();

  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1: Name & Description
  const [gameName, setGameName] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Sport & Level
  const [sport, setSport] = useState("Basketball");
  const [level, setLevel] = useState("");

  // Step 3: Court settings
  const [courtAccess, setCourtAccess] = useState<"Public" | "Private">("Public");
  const [venue, setVenue] = useState<"Outdoor" | "Indoor">("Outdoor");
  const [gameType, setGameType] = useState<"Individual" | "Teams">("Individual");
  const [visibility, setVisibility] = useState<"Public" | "Private">("Public");

  // Step 4: Location
  const [courtId, setCourtId] = useState("");

  // Step 5: Date & Time
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");

  // Step 6: Max players
  const [maxPlayers, setMaxPlayers] = useState(10);

  const selectedCourt = dbCourts.find((c) => c.id === courtId);

  const canProceed = () => {
    switch (step) {
      case 1: return gameName.trim().length > 0;
      case 2: return sport && level;
      case 3: return true;
      case 4: return courtId;
      case 5: return date && time;
      case 6: return maxPlayers >= 2;
      case 7: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const handlePublish = async () => {
    if (!user) return;

    const game: GameInsert = {
      title: gameName.trim(),
      court_id: courtId || null,
      court_name: selectedCourt?.name || "TBD",
      date,
      time,
      format: gameType === "Teams" ? "5v5" : "Individual",
      skill_level: level,
      max_players: maxPlayers,
      host_id: user.id,
      host_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Player",
    };

    try {
      await addGame(game);
      setShowSuccess(true);
    } catch {
      // Error handled in hook
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-card rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-border">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Game Created Successfully!</h2>
            <p className="text-muted-foreground mb-6">Would you like to share this game with your friends?</p>
            <Button
              className="w-full mb-3 h-12 text-base"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: gameName, text: `Join my game: ${gameName}` });
                }
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Game
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              onClick={() => navigate("/games")}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={handleBack} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <ProgressBar step={step} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col">
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              title="Enter the game name"
              description="Your game name will be displayed to other users on the dashboard"
            />
            <div className="flex-1 flex flex-col justify-center gap-4">
              <Input
                placeholder="Game name"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="h-14 text-base rounded-xl bg-secondary border-0"
                maxLength={100}
              />
              <Input
                placeholder="Game Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-14 text-base rounded-xl bg-secondary border-0"
                maxLength={200}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              title="Select the sport and level"
              description="Pick the sport and level of the event you're creating"
            />
            <div className="flex-1 flex flex-col justify-center gap-6">
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger className="h-14 text-base rounded-xl bg-secondary border-0">
                  <SelectValue placeholder="Choose sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Tennis">Tennis</SelectItem>
                  <SelectItem value="Volleyball">Volleyball</SelectItem>
                </SelectContent>
              </Select>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Skill Level</p>
                <div className="flex flex-wrap gap-2">
                  {["Beginner", "Intermediate", "Advanced", "Expert"].map((l) => (
                    <ToggleOption key={l} label={l} selected={level === l} onClick={() => setLevel(l)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              title="Game settings"
              description="Configure how your game will be set up"
            />
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2 text-center">Is the court publicly available?</p>
                <div className="flex justify-center gap-3">
                  <ToggleOption label="Public" selected={courtAccess === "Public"} onClick={() => setCourtAccess("Public")} />
                  <ToggleOption label="Private" selected={courtAccess === "Private"} onClick={() => setCourtAccess("Private")} />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1.5">
                  {courtAccess === "Private" ? "Private court that you control - only joined players will be there" : "Public court open to anyone"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2 text-center">Is it an indoor or outdoor court?</p>
                <div className="flex justify-center gap-3">
                  <ToggleOption label="Outdoor" selected={venue === "Outdoor"} onClick={() => setVenue("Outdoor")} />
                  <ToggleOption label="Indoor" selected={venue === "Indoor"} onClick={() => setVenue("Indoor")} />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2 text-center">Game Type</p>
                <div className="flex justify-center gap-3">
                  <ToggleOption label="Individual" selected={gameType === "Individual"} onClick={() => setGameType("Individual")} />
                  <ToggleOption label="Teams" selected={gameType === "Teams"} onClick={() => setGameType("Teams")} />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1.5">
                  {gameType === "Individual" ? "Individual players join the game" : "Players join as teams"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2 text-center">Should your game be visible to everyone?</p>
                <div className="flex justify-center gap-3">
                  <ToggleOption label="Public" selected={visibility === "Public"} onClick={() => setVisibility("Public")} />
                  <ToggleOption label="Private" selected={visibility === "Private"} onClick={() => setVisibility("Private")} />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1.5">
                  {visibility === "Private" ? "Your game will be hidden - players can only join with your game code or link" : "Visible to all players in your area"}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              title="Where will the game take place?"
              description="Select one of the courts on the map or type in the location of the game"
            />
            <div className="flex-1 flex flex-col justify-center gap-4">
              <Select value={courtId} onValueChange={setCourtId}>
                <SelectTrigger className="h-14 text-base rounded-xl bg-secondary border-0">
                  <SelectValue placeholder="Select a court" />
                </SelectTrigger>
                <SelectContent>
                  {dbCourts.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name} — {court.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCourt && (
                <div className="space-y-3">
                  <div className="bg-secondary rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Display Location</p>
                    <p className="font-medium text-foreground">{selectedCourt.name}</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4">
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Street Address</p>
                    <p className="font-medium text-foreground">{selectedCourt.address}</p>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-600">Location successfully selected</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              title="When will the game take place?"
              description="Set a date and the start and end times for the game"
            />
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Date</p>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-14 text-base rounded-xl bg-secondary border-0"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Start Time</p>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-14 text-base rounded-xl bg-secondary border-0"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground text-center mb-2">Game duration</p>
                <p className="text-2xl font-bold text-foreground text-center mb-3">
                  {parseInt(duration) >= 60 ? `${parseInt(duration) / 60} hour${parseInt(duration) > 60 ? "s" : ""}` : `${duration} min`}
                </p>
                <div className="flex justify-center gap-3">
                  {["30", "60", "90", "120"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "w-14 h-14 rounded-xl text-sm font-medium transition-all border",
                        duration === d
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-border hover:bg-secondary"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              title="What is the maximum amount of players?"
              description="Select the maximum amount of players that can join the game (2-50). By default, you will be included in the player count"
            />
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
                  className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Minus className="w-5 h-5 text-foreground" />
                </button>
                <div className="w-20 h-14 rounded-xl bg-secondary flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{maxPlayers}</span>
                </div>
                <button
                  onClick={() => setMaxPlayers(Math.min(50, maxPlayers + 1))}
                  className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="flex-1 flex flex-col">
            <StepHeader
              title="All done!"
              description="You've successfully created your game. Here's a summary of the details:"
            />
            <div className="bg-card rounded-2xl border border-border shadow-card p-5 mb-4">
              <h3 className="text-xl font-bold text-foreground text-center mb-3">{gameName}</h3>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-green-600 font-medium text-center mb-4">All done!</p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sport</span>
                  <span className="font-medium text-foreground">{sport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-medium text-foreground">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{formatDate(date)} {formatTime(time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max players</span>
                  <span className="font-medium text-foreground">{maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-foreground text-right">{selectedCourt?.name || "TBD"}</span>
                </div>
                {description && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">{description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venue</span>
                  <span className="font-medium text-foreground">{venue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">
                    {parseInt(duration) >= 60 ? `${parseInt(duration) / 60} hour${parseInt(duration) > 60 ? "s" : ""}` : `${duration} min`}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              We will notify you about users that join your game!
            </p>
          </div>
        )}

        {/* Bottom button */}
        <div className="py-4 pb-8">
          {step < TOTAL_STEPS ? (
            <Button
              className="w-full h-14 text-base rounded-xl font-semibold"
              disabled={!canProceed()}
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              className="w-full h-14 text-base rounded-xl font-semibold bg-foreground text-background hover:bg-foreground/90"
              onClick={handlePublish}
              disabled={isAdding}
            >
              {isAdding ? "Publishing..." : "Publish"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
