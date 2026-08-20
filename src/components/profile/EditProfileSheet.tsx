import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Profile, ProfileUpdate } from "@/hooks/useProfile";

interface EditProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onSave: (updates: ProfileUpdate) => Promise<void>;
  isSaving: boolean;
}

const SKILL_LEVELS = ["Beginner", "Casual", "Intermediate", "Advanced", "Pro"];
const POSITIONS = ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center", "Any position"];
const VIBES = ["Casual", "Pickup", "Competitive"];
const AVAILABILITY_OPTIONS = ["Weekday mornings", "Weekday evenings", "Weekend mornings", "Weekend afternoons", "Anytime"];

export function EditProfileSheet({
  open,
  onOpenChange,
  profile,
  onSave,
  isSaving,
}: EditProfileSheetProps) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [position, setPosition] = useState("");
  const [playStyles, setPlayStyles] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);

  useEffect(() => {
    if (profile && open) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setSkillLevel(profile.skill_level || "");
      setPosition(profile.position || "");
      setPlayStyles(profile.play_styles || []);
      setAvailability(profile.availability || []);
    }
  }, [profile, open]);

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    await onSave({
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      skill_level: skillLevel || null,
      position: position || null,
      play_styles: playStyles.length > 0 ? playStyles : null,
      availability: availability.length > 0 ? availability : null,
    });

    onOpenChange(false);
  };

  const chipStyle = (selected: boolean): React.CSSProperties => ({
    padding: "7px 13px",
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    border: `1px solid ${selected ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
    background: selected ? "hsl(var(--primary))" : "hsl(var(--card))",
    color: selected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
    transition: "background 0.15s",
  });

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "hsl(var(--muted-foreground))",
    marginBottom: 8,
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>Update your info and player preferences</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pb-6">
          {/* Display name */}
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Name</Label>
            <Input
              id="display-name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell others about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
          </div>

          {/* Skill level */}
          <div>
            <div style={sectionLabel}>Skill level</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SKILL_LEVELS.map((s) => (
                <div key={s} style={chipStyle(skillLevel === s)} onClick={() => setSkillLevel(s === skillLevel ? "" : s)}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <div style={sectionLabel}>Position</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {POSITIONS.map((p) => (
                <div key={p} style={chipStyle(position === p)} onClick={() => setPosition(p === position ? "" : p)}>
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Preferred vibe */}
          <div>
            <div style={sectionLabel}>Preferred vibe</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {VIBES.map((v) => (
                <div key={v} style={chipStyle(playStyles.includes(v))} onClick={() => toggleItem(playStyles, v, setPlayStyles)}>
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <div style={sectionLabel}>When do you play?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {AVAILABILITY_OPTIONS.map((a) => (
                <div key={a} style={chipStyle(availability.includes(a))} onClick={() => toggleItem(availability, a, setAvailability)}>
                  {a}
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!displayName.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
