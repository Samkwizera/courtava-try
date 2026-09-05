import { Camera, User, MapPin, Ruler, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const POSITIONS = [
    "Point Guard",
    "Shooting Guard",
    "Small Forward",
    "Power Forward",
    "Center",
    "Flexible",
];

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"];

const PLAY_STYLES = [
    "Playmaker",
    "Shooter",
    "Defender",
    "Hustler",
    "Rebounder",
    "Slasher",
    "Post Player",
    "Versatile",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function EditProfilePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [formData, setFormData] = useState({
        displayName: "",
        location: "",
        skillLevel: "",
        height: "",
        bio: "",
    });

    const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
    const [selectedPlayStyles, setSelectedPlayStyles] = useState<string[]>([]);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    // Load existing profile data
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setFormData({
                        displayName: data.display_name || "",
                        location: data.location || "",
                        skillLevel: data.skill_level || "",
                        height: data.height || "",
                        bio: data.bio || "",
                    });
                    setSelectedPositions(data.position || []);
                    setSelectedPlayStyles(data.play_styles || []);
                    setSelectedDays(data.availability || []);
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, [user]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePlayStyle = (style: string) => {
        setSelectedPlayStyles((prev) =>
            prev.includes(style)
                ? prev.filter((s) => s !== style)
                : [...prev, style]
        );
    };

    const togglePosition = (position: string) => {
        setSelectedPositions((current) => {
            if (current.includes(position)) return current.filter((item) => item !== position);
            if (position === "Any position") return [position];
            return [...current.filter((item) => item !== "Any position"), position];
        });
    };

    const toggleDay = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleSave = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    display_name: formData.displayName,
                    location: formData.location,
                    bio: formData.bio,
                    position: selectedPositions,
                    skill_level: formData.skillLevel,
                    height: formData.height,
                    play_styles: selectedPlayStyles,
                    availability: selectedDays,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (error) throw error;

            toast({
                title: "Profile Updated",
                description: "Your profile has been successfully updated!",
            });

            navigate("/profile");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <PageHeader
                title="Edit Profile"
                back
                actions={
                    <Button onClick={handleSave} disabled={loading} size="sm" className="gap-2">
                        <Save className="w-4 h-4" />
                        Save
                    </Button>
                }
            />

            <div className="p-4 space-y-6">
                {/* Profile Photo Section */}
                <section className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-secondary border-4 border-card flex items-center justify-center text-3xl font-bold text-secondary-foreground shadow-lg">
                            {formData.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                toast({
                                    title: "Upload Photo",
                                    description: "Photo upload coming soon!",
                                })
                            }
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Tap to change profile photo
                    </p>
                </section>

                {/* Basic Information */}
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                        Basic Information
                    </h2>

                    <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-foreground">
                            Display Name
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                placeholder="Enter your name"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-foreground">
                            Location
                        </Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="City, State"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-foreground">
                            Bio
                        </Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            rows={4}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.bio.length}/200 characters
                        </p>
                    </div>
                </section>

                {/* Basketball Info */}
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                        Basketball Info
                    </h2>

                    <div className="space-y-2">
                        <Label className="text-foreground">Positions</Label>
                        <div className="flex flex-wrap gap-2">
                            {POSITIONS.map((position) => (
                                <button
                                    key={position}
                                    type="button"
                                    aria-pressed={selectedPositions.includes(position)}
                                    onClick={() => togglePosition(position)}
                                    className={`rounded-full border px-3 py-2 text-sm font-medium ${
                                        selectedPositions.includes(position)
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-card text-foreground"
                                    }`}
                                >
                                    {position}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="skillLevel" className="text-foreground">
                            Skill Level
                        </Label>
                        <Select
                            value={formData.skillLevel}
                            onValueChange={(value) =>
                                setFormData((prev) => ({ ...prev, skillLevel: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select your skill level" />
                            </SelectTrigger>
                            <SelectContent>
                                {SKILL_LEVELS.map((level) => (
                                    <SelectItem key={level} value={level}>
                                        {level}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="height" className="text-foreground">
                            Height
                        </Label>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="height"
                                name="height"
                                value={formData.height}
                                onChange={handleInputChange}
                                placeholder="e.g., 6'2&quot;"
                                className="pl-10"
                            />
                        </div>
                    </div>
                </section>

                {/* Play Styles */}
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                        Play Styles
                    </h2>
                    <p className="text-sm text-muted-foreground px-1">
                        Select all that apply
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {PLAY_STYLES.map((style) => (
                            <Badge
                                key={style}
                                variant={
                                    selectedPlayStyles.includes(style) ? "default" : "outline"
                                }
                                className="cursor-pointer hover:bg-primary/90 transition-colors"
                                onClick={() => togglePlayStyle(style)}
                            >
                                {style}
                            </Badge>
                        ))}
                    </div>
                </section>

                {/* Availability */}
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                        Availability
                    </h2>
                    <p className="text-sm text-muted-foreground px-1">
                        When are you usually available to play?
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        {DAYS.map((day) => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(day)}
                                className={cn(
                                    "w-14 h-14 rounded-xl flex items-center justify-center text-sm font-medium transition-all",
                                    selectedDays.includes(day)
                                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                )}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Save Button (Mobile) */}
                <div className="pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full gap-2 h-12"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
