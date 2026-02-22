import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useGames, GameInsert } from "@/hooks/useGames";
import { useCourts } from "@/hooks/useCourts";

interface CreateGameSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGameSheet({ open, onOpenChange }: CreateGameSheetProps) {
  const { user } = useAuth();
  const { addGame, isAdding } = useGames();
  const { dbCourts } = useCourts();

  const [title, setTitle] = useState("");
  const [courtId, setCourtId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [format, setFormat] = useState("5v5");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [maxPlayers, setMaxPlayers] = useState("10");

  const resetForm = () => {
    setTitle("");
    setCourtId("");
    setDate("");
    setTime("");
    setFormat("5v5");
    setSkillLevel("Intermediate");
    setMaxPlayers("10");
  };

  const selectedCourt = dbCourts.find((c) => c.id === courtId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const game: GameInsert = {
      title: title.trim(),
      court_id: courtId || null,
      court_name: selectedCourt?.name || "TBD",
      date,
      time,
      format,
      skill_level: skillLevel,
      max_players: parseInt(maxPlayers) || 10,
      host_id: user.id,
      host_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Player",
    };

    try {
      await addGame(game);
      resetForm();
      onOpenChange(false);
    } catch {
      // Error handled in hook
    }
  };

  const isValid = title.trim() && date && time && courtId;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>Create a Game</SheetTitle>
          <SheetDescription>
            Set up a pickup game and invite players
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto max-h-[calc(85vh-120px)] pb-4"
        >
          <div className="space-y-2">
            <Label htmlFor="game-title">Game Title *</Label>
            <Input
              id="game-title"
              placeholder="e.g., Evening Run - 5v5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Court *</Label>
            <Select value={courtId} onValueChange={setCourtId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a court" />
              </SelectTrigger>
              <SelectContent>
                {dbCourts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="game-date">Date *</Label>
              <Input
                id="game-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="game-time">Time *</Label>
              <Input
                id="game-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3v3">3v3</SelectItem>
                <SelectItem value="5v5">5v5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Skill Level</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Competitive">Competitive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-players">Max Players</Label>
            <Select value={maxPlayers} onValueChange={setMaxPlayers}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={!isValid || isAdding}>
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Game...
              </>
            ) : (
              "Create Game"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
