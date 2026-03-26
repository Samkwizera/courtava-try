import { useState, useRef } from "react";
import { Search, ChevronRight, Users, Dribbble, LayoutGrid } from "lucide-react";
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
  Beginner: "bg-emerald-50 text-emerald-700",
  Intermediate: "bg-blue-50 text-blue-700",
  Advanced: "bg-violet-50 text-violet-700",
  Expert: "bg-rose-50 text-rose-700",
  Competitive: "bg-rose-50 text-rose-700",
};

const filters = ["All Time", "All Sports", "All Levels", "Sort by"];

export default function HomePage() {
  const navigate = useNavigate();
  const { dbCourts } = useCourts();
  const { checkIns } = useCheckIns();
  const { games } = useGames();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 48);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top">
      {/* iOS Navigation bar */}
      <header
        className="sticky top-0 z-40 glass-nav px-4"
        style={{
          boxShadow: scrolled ? "inset 0 -0.5px 0 0 rgba(0,0,0,0.14)" : "none",
          transition: "box-shadow 0.2s ease",
        }}
      >
        <div className="flex items-center justify-between h-[44px]">
          {/* Logo / inline title when scrolled */}
          <div className="flex items-center gap-2">
            <img src={courtavaLogo} alt="Courtava" className="w-7 h-7 rounded-[8px]" />
            <span
              className="ios-title text-foreground"
              style={{
                opacity: scrolled ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            >
              courtava.
            </span>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden ios-tap"
            style={{ border: "0.5px solid hsl(var(--border))" }}
          >
            <span className="text-xs font-bold text-foreground">{initials}</span>
          </button>
        </div>
      </header>

      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {/* Large title */}
        <div
          className="px-4 pt-3 pb-2 overflow-hidden"
          style={{
            maxHeight: scrolled ? 0 : 72,
            opacity: scrolled ? 0 : 1,
            transition: "max-height 0.25s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.2s ease",
          }}
        >
          <h1 className="ios-large-title text-foreground">courtava.</h1>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search games, courts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-[10px] bg-muted/70 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring border-0"
              style={{ fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* Explore Games banner — inset card */}
        <div className="px-4 pb-4">
          <div
            className="bg-card rounded-2xl p-4 flex items-center justify-between ios-card-tap"
            style={{ border: "0.5px solid hsl(var(--border))", boxShadow: "var(--shadow-card)" }}
            onClick={() => navigate("/games")}
          >
            <div>
              <h3 className="font-semibold text-foreground mb-0.5" style={{ fontSize: "15px" }}>Explore Games</h3>
              <p className="text-xs text-muted-foreground mb-3">Games happening in your area</p>
              <Button
                size="sm"
                className="text-xs px-4 h-7 rounded-full ios-tap"
                onClick={(e) => { e.stopPropagation(); navigate("/games"); }}
              >
                Check it out
              </Button>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Dribbble className="w-7 h-7 text-primary" />
            </div>
          </div>
        </div>

        {/* Nearby Courts */}
        <section className="pb-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-[17px] font-bold text-foreground tracking-tight">Nearby Courts</h2>
            <Link to="/courts">
              <button className="flex items-center gap-0.5 text-primary text-sm font-medium ios-tap">
                See all
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-0 px-4 scrollbar-hide">
            {dbCourts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No courts yet. Be the first to add one!</p>
            ) : (
              dbCourts.slice(0, 5).map((court) => {
                const liveCount = checkIns.filter((c) => c.court_id === court.id).length;
                return (
                  <div key={court.id} className="min-w-[240px] max-w-[240px]">
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

        {/* Dashboard — Games */}
        <section className="px-4 pb-6">
          <h2 className="text-[17px] font-bold text-foreground tracking-tight mb-2">Dashboard</h2>

          {/* Filter chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter}
                className="px-3.5 py-1 rounded-full text-sm font-medium whitespace-nowrap bg-muted/70 text-foreground ios-tap"
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Game cards */}
          <div className="flex flex-col gap-3">
            {games.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-3 text-[15px]">No games yet</p>
                <Button onClick={() => navigate("/create-game")} className="rounded-full ios-tap">
                  Create your first game
                </Button>
              </div>
            ) : (
              games.map((game) => (
                <div
                  key={game.id}
                  className="bg-card rounded-2xl overflow-hidden ios-card-tap"
                  style={{ border: "0.5px solid hsl(var(--border))", boxShadow: "var(--shadow-card)" }}
                  onClick={() => navigate("/games")}
                >
                  {/* Court image placeholder */}
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <LayoutGrid className="w-10 h-10 text-muted-foreground/25" strokeWidth={1} />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-[17px] mb-0.5 tracking-tight">{game.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {formatGameDate(game.date, game.time)} · {game.court_name}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-xs font-bold text-secondary-foreground">{game.host_name.charAt(0)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{game.host_name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge className={cn("text-[10px] rounded-md", skillColors[game.skill_level] || "bg-blue-100 text-blue-700")}>
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
    </div>
  );
}
