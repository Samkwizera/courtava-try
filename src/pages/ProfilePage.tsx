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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const userProfile = {
  name: "Alex Player",
  location: "Downtown, City",
  position: "Point Guard",
  skillLevel: "Intermediate",
  height: "6'0\"",
  playStyles: ["Playmaker", "Shooter", "Hustler"],
  availability: ["Mon", "Wed", "Fri", "Sat"],
  preferredFormat: ["5v5", "3v3"],
  stats: {
    gamesPlayed: 47,
    connections: 28,
    courtsFavorited: 5,
    gamesHosted: 8,
  },
};

const recentActivity = [
  { type: "game", text: "Played at Downtown Community Court", time: "2 days ago" },
  { type: "connection", text: "Connected with Marcus J.", time: "3 days ago" },
  { type: "game", text: "Joined Morning Run - 5v5", time: "5 days ago" },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleQuickAction = (label: string) => {
    switch (label) {
      case "My Games":
        navigate("/games");
        break;
      case "My Connections":
        navigate("/players");
        break;
      case "Favorite Courts":
        navigate("/courts");
        break;
      case "Settings":
        toast({
          title: "Settings",
          description: "Settings page coming soon!",
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Profile Card */}
      <section className="p-4">
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          {/* Banner */}
          <div className="h-20 gradient-hero relative">
            <Button
              variant="secondary"
              size="icon-sm"
              className="absolute bottom-2 right-2 bg-card/80"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Avatar & Info */}
          <div className="px-4 pb-4 -mt-10">
            <div className="w-20 h-20 rounded-2xl bg-secondary border-4 border-card flex items-center justify-center text-2xl font-bold text-secondary-foreground shadow-lg mb-3">
              A
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{userProfile.name}</h2>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{userProfile.location}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="position">{userProfile.position}</Badge>
                  <Badge variant="skill">{userProfile.skillLevel}</Badge>
                  {userProfile.height && (
                    <Badge variant="muted">{userProfile.height}</Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Play Styles */}
      <section className="px-4 py-2">
        <h3 className="text-sm font-semibold text-foreground mb-2">Play Styles</h3>
        <div className="flex flex-wrap gap-2">
          {userProfile.playStyles.map((style) => (
            <Badge key={style} variant="secondary">
              {style}
            </Badge>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="px-4 py-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-3 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Games</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{userProfile.stats.gamesPlayed}</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Connections</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{userProfile.stats.connections}</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Favorites</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{userProfile.stats.courtsFavorited}</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Hosted</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{userProfile.stats.gamesHosted}</p>
          </div>
        </div>
      </section>

      {/* Availability */}
      <section className="px-4 py-2">
        <h3 className="text-sm font-semibold text-foreground mb-2">Availability</h3>
        <div className="flex gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div
              key={day}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium",
                userProfile.availability.includes(day)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {day}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="px-4 py-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        <div className="flex flex-col gap-3">
          {recentActivity.map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <span className="text-sm text-foreground">{activity.text}</span>
              <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 py-4 pb-8">
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
            { label: "My Games", icon: Calendar },
            { label: "My Connections", icon: Users },
            { label: "Favorite Courts", icon: Star },
            { label: "Settings", icon: Settings },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickAction(item.label);
              }}
              className="flex items-center justify-between p-3 bg-card rounded-xl shadow-card border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
