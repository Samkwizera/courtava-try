import { useState, useEffect } from "react";
import { MapPin, Search, Bell, ChevronRight, Calendar, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourtCard } from "@/components/cards/CourtCard";
import { GameCard } from "@/components/cards/GameCard";
import courtavaLogo from "@/assets/courtava-logo.png";
import { Link } from "react-router-dom";

// Kigali courts data
const nearbyCourts = [
  {
    name: "Kigali Arena Courts",
    address: "KG 7 Ave, Kigali",
    distance: "0.3 km",
    rating: 4.9,
    reviewCount: 156,
    playersNow: 8,
    surface: "indoor" as const,
    amenities: { lights: true, water: true, parking: true },
  },
  {
    name: "Amahoro Stadium Courts",
    address: "KG 200 St, Remera",
    distance: "1.2 km",
    rating: 4.7,
    reviewCount: 203,
    playersNow: 6,
    surface: "outdoor" as const,
    amenities: { lights: true, water: true, parking: true },
  },
];

const upcomingGames = [
  {
    title: "Evening Run - 5v5",
    courtName: "Kigali Arena Courts",
    date: "Today",
    time: "6:00 PM",
    format: "5v5" as const,
    skillLevel: "Intermediate" as const,
    currentPlayers: 8,
    maxPlayers: 10,
    hostName: "Jean-Claude M.",
  },
  {
    title: "Weekend 3v3",
    courtName: "Amahoro Stadium Courts",
    date: "Saturday",
    time: "10:00 AM",
    format: "3v3" as const,
    skillLevel: "Beginner" as const,
    currentPlayers: 4,
    maxPlayers: 6,
    hostName: "Grace U.",
  },
];

export default function HomePage() {
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else if (hour >= 17) setGreeting("Good evening");
  }, []);

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-card shadow-card flex items-center justify-center overflow-hidden">
              <img src={courtavaLogo} alt="Courtava" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{greeting}</p>
              <h1 className="text-lg font-bold text-foreground">Player</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-court-orange rounded-full" />
            </Button>
          </div>
        </div>

        {/* Location pill */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium">Kigali, Rwanda</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      {/* Quick Stats */}
      <section className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 shadow-card border border-border">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Games played</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card border border-border">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">28</p>
            <p className="text-xs text-muted-foreground">Connections</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card border border-border">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">4</p>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
        </div>
      </section>

      {/* Nearby Courts */}
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Nearby Courts</h2>
          <Link to="/courts">
            <Button variant="ghost" size="sm" className="text-primary">
              See all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {nearbyCourts.map((court, i) => (
            <div key={i} className="min-w-[280px] max-w-[280px]">
              <CourtCard {...court} />
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Games */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Games</h2>
          <Link to="/games">
            <Button variant="ghost" size="sm" className="text-primary">
              See all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {upcomingGames.map((game, i) => (
            <GameCard key={i} {...game} onJoin={() => console.log("Join game")} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 py-4 pb-8">
        <div className="gradient-hero rounded-2xl p-4 text-primary-foreground">
          <h3 className="font-semibold mb-1">Ready to play?</h3>
          <p className="text-sm opacity-90 mb-3">Create a game and invite your squad</p>
          <Button variant="secondary" className="bg-card text-foreground hover:bg-card/90">
            Create a Game
          </Button>
        </div>
      </section>
    </div>
  );
}
