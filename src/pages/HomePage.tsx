import { useState } from "react";
import { Search, ChevronRight, MapPin, Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourtCard } from "@/components/cards/CourtCard";
import courtavaLogo from "@/assets/courtava-logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useCourts } from "@/hooks/useCourts";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useGames } from "@/hooks/useGames";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const skillColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
  Expert: "bg-red-100 text-red-700",
  Competitive: "bg-red-100 text-red-700",
};

const filters = ["All Time", "All Sports", "All Levels", "Sort by"];

export default function HomePage() {
  const navigate = useNavigate();
  const { dbCourts } = useCourts();
  const { checkIns } = useCheckIns();
  const { games } = useGames();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Player";
  const initials = displayName.charAt(0).toUpperCase();

  const formatGameDate = (date: string, time: string) => {
    if (!date) return "";
    const d = new Date(date + "T00:00:00");
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const timeStr = time || "";
    return `${day} ${month} ${timeStr}`;
  };

  return (
    <div className="min-h-screen bg-background safe-top pb-20">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src={courtavaLogo} alt="Courtava" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">courtava.</h1>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border"
          >
            <span className="text-sm font-bold text-foreground">{initials}</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search games"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Explore Games banner */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-card flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Explore Games</h3>
            <p className="text-xs text-muted-foreground mb-3">Check out games happening in your area</p>
            <Button
              size="sm"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs px-4"
              onClick={() => navigate("/games")}
            >
              Check it out
            </Button>
          </div>
          <div className="text-4xl">🏀</div>
        </div>
      </header>

      {/* Nearby Courts */}
      <section className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Nearby Courts</h2>
          <Link to="/courts">
            <Button variant="ghost" size="sm" className="text-primary text-xs">
              See all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {dbCourts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No courts yet. Be the first to add one!</p>
          ) : (
            dbCourts.slice(0, 5).map((court) => {
              const liveCount = checkIns.filter((c) => c.court_id === court.id).length;
              return (
                <div key={court.id} className="min-w-[260px] max-w-[260px]">
                  <CourtCard
                    name={court.name}
                    address={court.address}
                    distance="N/A"
                    rating={0}
                    reviewCount={0}
                    playersNow={liveCount}
                    surface={court.surface as "outdoor" | "indoor" | "cement"}
                    amenities={{ lights: court.lights, water: court.water, parking: court.parking }}
                    onClick={() => navigate(`/courts/${court.id}`)}
                  />
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Dashboard - Games */}
      <section className="px-4 pt-2 pb-4">
        <h2 className="text-xl font-bold text-foreground mb-3">Dashboard</h2>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border border-border bg-background text-foreground hover:bg-secondary transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Game cards */}
        <div className="flex flex-col gap-4">
          {games.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-3">No games yet</p>
              <Button onClick={() => navigate("/create-game")} className="rounded-full bg-foreground text-background">
                Create your first game
              </Button>
            </div>
          ) : (
            games.map((game) => (
              <div
                key={game.id}
                className="bg-card rounded-2xl border border-border shadow-card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/games`)}
              >
                {/* Court image placeholder */}
                <div className="w-full h-44 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <span className="text-5xl">🏟️</span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-foreground text-lg mb-1">{game.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {formatGameDate(game.date, game.time)} • {game.court_name} • {game.skill_level === "Indoor" ? "Indoor" : "Outdoor"}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-xs font-bold">{game.host_name.charAt(0)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{game.host_name}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge className={cn("text-[10px]", skillColors[game.skill_level] || "bg-blue-100 text-blue-700")}>
                        {game.skill_level}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {game.current_players}/{game.max_players}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
