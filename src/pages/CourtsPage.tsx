import { MapPin, Search, Filter, List, Map as MapIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CourtCard } from "@/components/cards/CourtCard";
import { CourtMap } from "@/components/map/CourtMap";
import { cn } from "@/lib/utils";

// Courts in Kigali, Rwanda with real locations
const courts = [
  {
    id: "1",
    name: "Kigali Arena Courts",
    address: "KG 7 Ave, Kigali",
    lat: -1.9355,
    lng: 30.0928,
    distance: "0.3 km",
    rating: 4.9,
    reviewCount: 156,
    playersNow: 8,
    surface: "indoor" as const,
    amenities: { lights: true, water: true, parking: true },
  },
  {
    id: "2",
    name: "Amahoro Stadium Courts",
    address: "KG 200 St, Remera",
    lat: -1.9537,
    lng: 30.1044,
    distance: "1.2 km",
    rating: 4.7,
    reviewCount: 203,
    playersNow: 6,
    surface: "outdoor" as const,
    amenities: { lights: true, water: true, parking: true },
  },
  {
    id: "3",
    name: "Nyamirambo Courts",
    address: "KN 3 Ave, Nyamirambo",
    lat: -1.9712,
    lng: 30.0456,
    distance: "2.5 km",
    rating: 4.5,
    reviewCount: 89,
    surface: "outdoor" as const,
    amenities: { lights: true, water: false, parking: true },
  },
  {
    id: "4",
    name: "Kicukiro Community Court",
    address: "KK 15 Rd, Kicukiro",
    lat: -1.9834,
    lng: 30.1123,
    distance: "3.1 km",
    rating: 4.3,
    reviewCount: 67,
    playersNow: 4,
    surface: "cement" as const,
    amenities: { lights: false, water: true, parking: true },
  },
  {
    id: "5",
    name: "Gisozi Sports Complex",
    address: "KG 11 Ave, Gisozi",
    lat: -1.9189,
    lng: 30.0612,
    distance: "4.0 km",
    rating: 4.6,
    reviewCount: 112,
    surface: "outdoor" as const,
    amenities: { lights: true, water: true, parking: false },
  },
  {
    id: "6",
    name: "Kimihurura Basketball Court",
    address: "KG 9 Ave, Kimihurura",
    lat: -1.9445,
    lng: 30.0789,
    distance: "1.8 km",
    rating: 4.4,
    reviewCount: 78,
    surface: "outdoor" as const,
    amenities: { lights: true, water: false, parking: true },
  },
];

// Map courts to format expected by CourtMap
const mapCourts = courts.map((court) => ({
  id: court.id,
  name: court.name,
  address: court.address,
  lat: court.lat,
  lng: court.lng,
  playersNow: court.playersNow,
}));

export default function CourtsPage() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);

  const filteredCourts = courts.filter(
    (court) =>
      court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">Find Courts</h1>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              📍 Kigali, Rwanda
            </span>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courts in Kigali..."
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
            <span>{filteredCourts.length} courts in Kigali</span>
          </div>
          {filteredCourts.map((court) => (
            <CourtCard
              key={court.id}
              name={court.name}
              address={court.address}
              distance={court.distance}
              rating={court.rating}
              reviewCount={court.reviewCount}
              playersNow={court.playersNow}
              surface={court.surface}
              amenities={court.amenities}
            />
          ))}
        </div>
      ) : (
        <div className="relative h-[calc(100vh-200px)]">
          {/* Interactive Map */}
          <div className="w-full h-full">
            <CourtMap
              courts={mapCourts}
              center={[-1.9403, 30.0588]} // Kigali center
              zoom={13}
              onCourtSelect={(court) => setSelectedCourt(court.id)}
            />
          </div>

          {/* Floating court cards */}
          <div className="absolute bottom-4 left-0 right-0 px-4 z-[1000]">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {filteredCourts.slice(0, 3).map((court) => (
                <div
                  key={court.id}
                  className={cn(
                    "min-w-[280px] transition-transform",
                    selectedCourt === court.id && "scale-[1.02]"
                  )}
                >
                  <CourtCard
                    name={court.name}
                    address={court.address}
                    distance={court.distance}
                    rating={court.rating}
                    reviewCount={court.reviewCount}
                    playersNow={court.playersNow}
                    surface={court.surface}
                    amenities={court.amenities}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
