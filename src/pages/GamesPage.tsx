import { Plus, Search, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/cards/GameCard";
import { useGames } from "@/hooks/useGames";
import { cn } from "@/lib/utils";

const filters = ["All", "Today", "This Week", "5v5", "3v3"];

export default function GamesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const { games, isLoading } = useGames();

  const filteredGames = games.filter((game) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "5v5" || activeFilter === "3v3") return game.format === activeFilter;
    if (activeFilter === "Today") return game.date === new Date().toISOString().split("T")[0];
    return true;
  });

  return (
    <div className="min-h-screen bg-background safe-top">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">Games</h1>
            <Button size="sm" className="gap-1" onClick={() => navigate("/create-game")}>
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search games..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary border-none text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="secondary" size="icon">
              <Calendar className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-4 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-3">No games yet. Be the first to create one!</p>
            <Button onClick={() => navigate("/create-game")}>
              <Plus className="w-4 h-4 mr-2" />
              Create a Game
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {filteredGames.length} game{filteredGames.length !== 1 ? "s" : ""} available
            </p>
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
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
            ))}
          </>
        )}
      </div>
    </div>
  );
}
