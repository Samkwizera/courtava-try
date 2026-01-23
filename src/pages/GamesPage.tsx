import { Plus, Search, Filter, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameCard } from "@/components/cards/GameCard";
import { cn } from "@/lib/utils";

const games = [
  {
    title: "Morning Run - 5v5",
    courtName: "Downtown Community Court",
    date: "Today",
    time: "6:00 PM",
    format: "5v5" as const,
    skillLevel: "Intermediate" as const,
    currentPlayers: 8,
    maxPlayers: 10,
    hostName: "Marcus J.",
  },
  {
    title: "Casual 3v3",
    courtName: "Riverside Park Courts",
    date: "Tomorrow",
    time: "10:00 AM",
    format: "3v3" as const,
    skillLevel: "Beginner" as const,
    currentPlayers: 4,
    maxPlayers: 6,
    hostName: "Sarah K.",
  },
  {
    title: "Competitive 5v5",
    courtName: "Central Recreation Center",
    date: "Sat, Jan 25",
    time: "2:00 PM",
    format: "5v5" as const,
    skillLevel: "Advanced" as const,
    currentPlayers: 10,
    maxPlayers: 10,
    hostName: "James D.",
  },
  {
    title: "Sunday Hoops",
    courtName: "Eastside Hoops",
    date: "Sun, Jan 26",
    time: "9:00 AM",
    format: "5v5" as const,
    skillLevel: "Intermediate" as const,
    currentPlayers: 5,
    maxPlayers: 10,
    hostName: "Mike T.",
  },
  {
    title: "Evening 3v3 Tournament",
    courtName: "Sunset Courts",
    date: "Mon, Jan 27",
    time: "7:00 PM",
    format: "3v3" as const,
    skillLevel: "Competitive" as const,
    currentPlayers: 6,
    maxPlayers: 6,
    hostName: "League Admin",
  },
];

const filters = ["All", "Today", "This Week", "5v5", "3v3"];

export default function GamesPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">Games</h1>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </div>

          {/* Search bar */}
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

          {/* Filter chips */}
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

      {/* Games List */}
      <div className="p-4 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {games.length} games available
        </p>
        {games.map((game, i) => (
          <GameCard key={i} {...game} onJoin={() => console.log("Join game")} />
        ))}
      </div>
    </div>
  );
}
