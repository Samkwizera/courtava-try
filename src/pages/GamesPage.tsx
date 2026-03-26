import { Plus, Search, Calendar, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/cards/GameCard";
import { useGames } from "@/hooks/useGames";
import { cn } from "@/lib/utils";

const filters = ["All", "Today", "This Week", "5v5", "3v3"];

export default function GamesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [scrolled, setScrolled] = useState(false);
  const { games, isLoading } = useGames();
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredGames = games.filter((game) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "5v5" || activeFilter === "3v3") return game.format === activeFilter;
    if (activeFilter === "Today") return game.date === new Date().toISOString().split("T")[0];
    return true;
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 52);
  };

  return (
    <div className="min-h-screen bg-background safe-top flex flex-col">
      {/* iOS Navigation Bar — collapses large title on scroll */}
      <header
        className="sticky top-0 z-40 glass-nav"
        style={{ boxShadow: scrolled ? "inset 0 -0.5px 0 0 rgba(0,0,0,0.14)" : "none", transition: "box-shadow 0.2s ease" }}
      >
        {/* Inline nav title — appears when scrolled */}
        <div
          className="flex items-center justify-between px-4 pt-2 pb-1"
          style={{ minHeight: 44 }}
        >
          <span
            className="ios-title text-foreground"
            style={{
              opacity: scrolled ? 1 : 0,
              transform: scrolled ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 0.2s ease, transform 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          >
            Games
          </span>
          <Button
            size="sm"
            className="gap-1.5 rounded-full h-8 px-3 text-xs ios-tap"
            onClick={() => navigate("/create-game")}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Create
          </Button>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search games..."
              className="w-full h-9 pl-9 pr-4 rounded-[10px] bg-muted/70 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring border-0"
              style={{ fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* Segmented-style filter pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 pb-3">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-3.5 py-1 rounded-full text-sm font-medium whitespace-nowrap ios-tap",
                activeFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/70 text-foreground"
              )}
              style={{ transition: "background-color 0.2s cubic-bezier(0.25,0.46,0.45,0.94), color 0.2s ease" }}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Large title — hides when scrolled */}
        <div
          className="px-4 pt-3 pb-1 overflow-hidden"
          style={{
            maxHeight: scrolled ? 0 : 64,
            opacity: scrolled ? 0 : 1,
            transition: "max-height 0.25s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.2s ease",
          }}
        >
          <h1 className="ios-large-title text-foreground">Games</h1>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-3 text-[15px]">No games yet. Be the first to create one!</p>
              <Button onClick={() => navigate("/create-game")} className="rounded-full ios-tap">
                <Plus className="w-4 h-4 mr-2" />
                Create a Game
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 stagger-children">
              <p className="text-sm text-muted-foreground font-medium">
                {filteredGames.length} game{filteredGames.length !== 1 ? "s" : ""} available
              </p>
              {filteredGames.map((game) => (
                <div key={game.id} className="animate-ios-fade-in">
                  <GameCard
                    title={game.title}
                    courtName={game.court_name}
                    date={game.date}
                    time={game.time}
                    format={game.format as "3v3" | "5v5"}
                    skillLevel={game.skill_level as "Beginner" | "Intermediate" | "Advanced" | "Competitive"}
                    currentPlayers={game.current_players}
                    maxPlayers={game.max_players}
                    hostName={game.host_name}
                    onJoin={() => console.log("Join game", game.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
