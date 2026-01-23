import { MapPin, Search, Filter, List, Map as MapIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CourtCard } from "@/components/cards/CourtCard";
import { cn } from "@/lib/utils";

const courts = [
  {
    name: "Downtown Community Court",
    address: "123 Main St, Downtown",
    distance: "0.3 mi",
    rating: 4.8,
    reviewCount: 124,
    playersNow: 6,
    surface: "outdoor" as const,
    amenities: { lights: true, water: true, parking: true },
  },
  {
    name: "Riverside Park Courts",
    address: "456 River Rd",
    distance: "0.8 mi",
    rating: 4.5,
    reviewCount: 89,
    surface: "outdoor" as const,
    amenities: { lights: true, water: false, parking: true },
  },
  {
    name: "Central Recreation Center",
    address: "789 Center Ave",
    distance: "1.2 mi",
    rating: 4.9,
    reviewCount: 203,
    playersNow: 4,
    surface: "indoor" as const,
    amenities: { lights: true, water: true, parking: true },
  },
  {
    name: "Eastside Hoops",
    address: "321 East Blvd",
    distance: "1.5 mi",
    rating: 4.2,
    reviewCount: 56,
    surface: "cement" as const,
    amenities: { lights: false, water: false, parking: true },
  },
  {
    name: "Sunset Courts",
    address: "555 Sunset Dr",
    distance: "2.1 mi",
    rating: 4.6,
    reviewCount: 78,
    surface: "outdoor" as const,
    amenities: { lights: true, water: true, parking: false },
  },
];

export default function CourtsPage() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-foreground mb-3">Find Courts</h1>
          
          {/* Search bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary border-none text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="secondary" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "secondary"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex-1"
            >
              <List className="w-4 h-4" />
              List
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "secondary"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="flex-1"
            >
              <MapIcon className="w-4 h-4" />
              Map
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{courts.length} courts near you</span>
          </div>
          {courts.map((court, i) => (
            <CourtCard key={i} {...court} />
          ))}
        </div>
      ) : (
        <div className="relative h-[calc(100vh-180px)]">
          {/* Map placeholder */}
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-court-green-light flex items-center justify-center mx-auto mb-4">
                <MapIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Map View</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Interactive map coming soon. Switch to list view to browse courts.
              </p>
            </div>
          </div>

          {/* Floating court cards */}
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {courts.slice(0, 3).map((court, i) => (
                <div key={i} className="min-w-[280px]">
                  <CourtCard {...court} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
