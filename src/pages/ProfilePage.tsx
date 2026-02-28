import { useState } from "react";
import {
  Settings,
  ChevronRight,
  Edit2,
  Calendar,
  Users,
  MapPin,
  Moon,
  Sun,
  LogOut,
  BadgeCheck,
  Dribbble,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGames } from "@/hooks/useGames";
import { EditProfileSheet } from "@/components/profile/EditProfileSheet";
import { cn } from "@/lib/utils";

const SPORT_ICONS: Record<string, React.ReactNode> = {
  Basketball: <Dribbble className="w-6 h-6" />,
};

const SKILL_COLORS: Record<string, string> = {
  Beginner: "text-emerald-600",
  Intermediate: "text-blue-600",
  Advanced: "text-violet-600",
  Competitive: "text-rose-600",
};

const DEMO_SPORTS = [
  { name: "Basketball", level: "Intermediate" },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { games } = useGames();
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Player";
  const username = displayName.toLowerCase().replace(/\s+/g, "");
  const avatarUrl = profile?.avatar_url;
  const initial = displayName[0]?.toUpperCase() || "?";

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const gamesPlayed = games.length;
  const gamesCreated = games.filter((g) => g.host_id === user?.id).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top pb-32">
      {/* Banner */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-green-950 via-green-900 to-green-800 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700" />

        {/* Top bar buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="w-9 h-9 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <Edit2 className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <Settings className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full border-4 border-background bg-secondary flex items-center justify-center overflow-hidden shadow-md">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-secondary-foreground">{initial}</span>
            )}
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="mt-16 px-4 flex flex-col items-center text-center gap-1">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
          <BadgeCheck className="w-5 h-5 text-primary fill-primary/20" />
        </div>
        <p className="text-sm text-muted-foreground">@{username}</p>
        {joinedDate && (
          <p className="text-xs text-muted-foreground">Joined {joinedDate}</p>
        )}
      </div>

      <div className="px-4 mt-5 flex flex-col gap-3">
        {/* Stats */}
        <div className="bg-card rounded-xl border border-border p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">{gamesPlayed}</span>
          <span className="text-xs text-muted-foreground mt-0.5">games played</span>
        </div>

        {/* Bio */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold text-foreground mb-1.5">Bio</h2>
          <p className="text-sm text-muted-foreground">
            {profile?.bio || "No bio yet. Tap edit to add one."}
          </p>
        </div>

        {/* Sports */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-2">Sports</h2>
          <div className="grid grid-cols-2 gap-3">
            {DEMO_SPORTS.map((sport) => (
              <div
                key={sport.name}
                className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                  {SPORT_ICONS[sport.name] ?? <Activity className="w-6 h-6" />}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{sport.name}</p>
                  <p className={cn("text-xs font-medium", SKILL_COLORS[sport.level] ?? "text-muted-foreground")}>
                    {sport.level}
                  </p>
                </div>
              </div>
            ))}
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                <span className="text-lg font-bold">{gamesCreated}</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Games</p>
                <p className="text-xs text-muted-foreground">created</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings (collapsible) */}
        {settingsOpen && (
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="font-medium text-foreground">Dark Mode</span>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>

            {[
              { label: "My Games", icon: Calendar, route: "/games" },
              { label: "Find Players", icon: Users, route: "/players" },
              { label: "Find Courts", icon: MapPin, route: "/courts" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.route)}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}

            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-destructive/10 transition-colors mt-1"
            >
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="font-medium text-destructive">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Sheet */}
      <EditProfileSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile ?? null}
        onSave={updateProfile}
        isSaving={isUpdating}
      />
    </div>
  );
}
