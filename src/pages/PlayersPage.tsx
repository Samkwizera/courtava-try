import { Search, Filter, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { cn } from "@/lib/utils";

const players = [
  {
    name: "Marcus Johnson",
    location: "Downtown",
    position: "PG",
    skillLevel: "Advanced" as const,
    playStyles: ["Playmaker", "Shooter", "Defender"],
    gamesPlayed: 45,
    mutualConnections: 3,
  },
  {
    name: "Sarah Kim",
    location: "Riverside",
    position: "SG",
    skillLevel: "Intermediate" as const,
    playStyles: ["Shooter", "Hustler"],
    gamesPlayed: 28,
    mutualConnections: 1,
  },
  {
    name: "James Davis",
    location: "Central",
    position: "SF",
    skillLevel: "Competitive" as const,
    playStyles: ["Defender", "Rebounder", "Hustler"],
    gamesPlayed: 89,
    mutualConnections: 5,
    isConnected: true,
  },
  {
    name: "Mike Thompson",
    location: "Eastside",
    position: "PF",
    skillLevel: "Intermediate" as const,
    playStyles: ["Rebounder", "Defender"],
    gamesPlayed: 34,
    mutualConnections: 0,
  },
  {
    name: "Alex Chen",
    location: "Downtown",
    position: "C",
    skillLevel: "Beginner" as const,
    playStyles: ["Rebounder", "Hustler"],
    gamesPlayed: 12,
    mutualConnections: 2,
  },
];

const skillFilters = ["All", "Beginner", "Intermediate", "Advanced", "Competitive"];

export default function PlayersPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-foreground mb-3">Find Players</h1>

          {/* Search bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search players..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary border-none text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="secondary" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {skillFilters.map((filter) => (
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

      {/* Players Grid */}
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          <span>{players.length} players near you</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {players.map((player, i) => (
            <PlayerCard
              key={i}
              {...player}
              onConnect={() => console.log("Connect")}
              onMessage={() => console.log("Message")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
