import { useState } from "react";
import {
  Settings,
  ChevronRight,
  Edit2,
  Calendar,
  Users,
  MapPin,
  Award,
  Star,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { EditProfileSheet } from "@/components/profile/EditProfileSheet";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const [editOpen, setEditOpen] = useState(false);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Player";
  const avatarUrl = profile?.avatar_url;
  const initial = displayName[0]?.toUpperCase() || "?";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top pb-24">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {/* Profile Card */}
      <section className="p-4">
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          {/* Banner */}
          <div className="h-20 gradient-hero relative" />

          {/* Avatar & Info */}
          <div className="px-4 pb-4 -mt-10 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-secondary border-4 border-card flex items-center justify-center text-2xl font-bold text-secondary-foreground shadow-lg mb-3 overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                initial
              )}
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 py-4">
        <div className="flex flex-col gap-2">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-card rounded-xl shadow-card border border-border">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
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
              className="flex items-center justify-between p-3 bg-card rounded-xl shadow-card border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center justify-between p-3 bg-card rounded-xl shadow-card border border-border hover:bg-destructive/10 transition-colors cursor-pointer mt-2"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="font-medium text-destructive">Sign Out</span>
            </div>
          </button>
        </div>
      </section>

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
