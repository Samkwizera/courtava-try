import { MapPin, Search, Filter, List, Map as MapIcon, X, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourtCard } from "@/components/cards/CourtCard";
import { CourtMap } from "@/components/map/CourtMap";
import { CourtFilters, CourtFiltersState } from "@/components/courts/CourtFilters";
import { CheckInSheet } from "@/components/courts/CheckInSheet";
import { AddCourtSheet } from "@/components/courts/AddCourtSheet";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useCourts } from "@/hooks/useCourts";
import { useAuth } from "@/hooks/useAuth";

const defaultFilters: CourtFiltersState = {
  surfaces: [],
  amenities: { lights: false, water: false, parking: false },
  sortBy: "distance",
};

export default function CourtsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkIns } = useCheckIns();
  const { dbCourts } = useCourts();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<CourtFiltersState>(defaultFilters);
  const [checkInSheetOpen, setCheckInSheetOpen] = useState(false);
  const [checkInCourtId, setCheckInCourtId] = useState<string | null>(null);
  const [addCourtOpen, setAddCourtOpen] = useState(false);

  // Use only database courts
  const allCourts = useMemo(() => {
    return dbCourts.map((court) => ({
      id: court.id,
      name: court.name,
      address: court.address,
      lat: court.lat,
      lng: court.lng,
      distance: "N/A",
      distanceNum: 999,
      rating: 0,
      reviewCount: 0,
      playersNow: 0,
      surface: court.surface as "outdoor" | "indoor" | "cement",
      amenities: {
        lights: court.lights,
        water: court.water,
        parking: court.parking,
      },
    }));
  }, [dbCourts]);

  const activeFilterCount =
    filters.surfaces.length +
    Object.values(filters.amenities).filter(Boolean).length;

  const filteredCourts = useMemo(() => {
    let result = allCourts.filter(
      (court) =>
        court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter by surface type
    if (filters.surfaces.length > 0) {
      result = result.filter((court) => filters.surfaces.includes(court.surface));
    }

    // Filter by amenities
    if (filters.amenities.lights) {
      result = result.filter((court) => court.amenities.lights);
    }
    if (filters.amenities.water) {
      result = result.filter((court) => court.amenities.water);
    }
    if (filters.amenities.parking) {
      result = result.filter((court) => court.amenities.parking);
    }

    // Sort
    if (filters.sortBy === "distance") {
      result = [...result].sort((a, b) => a.distanceNum - b.distanceNum);
    } else {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [allCourts, searchQuery, filters]);

  // Map courts for CourtMap component (uses filtered results for consistency)
  const mapCourts = useMemo(() => 
    filteredCourts.map((court) => ({
      id: court.id,
      name: court.name,
      address: court.address,
      lat: court.lat,
      lng: court.lng,
      playersNow: court.playersNow,
    })),
  [filteredCourts]);

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">Find Courts</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setAddCourtOpen(true)}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                📍 Kigali
              </span>
            </div>
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
            <Button variant="secondary" size="icon" className="relative" onClick={() => setFiltersOpen(true)}>
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
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
          {filteredCourts.map((court) => {
            const liveCount = checkIns.filter((c) => c.court_id === court.id).length;
            return (
              <CourtCard
                key={court.id}
                name={court.name}
                address={court.address}
                distance={court.distance}
                rating={court.rating}
                reviewCount={court.reviewCount}
                playersNow={liveCount}
                surface={court.surface}
                amenities={court.amenities}
                onClick={() => navigate(`/courts/${court.id}`)}
              />
            );
          })}
        </div>
      ) : (
        <div className="relative h-[calc(100vh-200px)] min-h-[400px]">
          {/* Interactive Map */}
          <div className="absolute inset-0">
            <CourtMap
              courts={mapCourts}
              center={[-1.9403, 30.0588]} // Kigali center
              zoom={13}
              onCourtSelect={(court) => setSelectedCourt(court.id)}
              checkIns={checkIns}
              onAvatarClick={(courtId) => {
                setCheckInCourtId(courtId);
                setCheckInSheetOpen(true);
              }}
              selectedCourtId={selectedCourt}
            />
          </div>

          {/* Show court card only when a marker is clicked */}
          {selectedCourt && (() => {
            const court = filteredCourts.find(c => c.id === selectedCourt);
            if (!court) return null;
            const liveCount = checkIns.filter((c) => c.court_id === court.id).length;
            return (
              <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourt(null);
                    }}
                    className="absolute -top-2 -right-2 z-10 bg-background border border-border rounded-full p-1.5 shadow-md hover:bg-secondary transition-colors"
                    aria-label="Close court card"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <CourtCard
                    name={court.name}
                    address={court.address}
                    distance={court.distance}
                    rating={court.rating}
                    reviewCount={court.reviewCount}
                    playersNow={liveCount}
                    surface={court.surface}
                    amenities={court.amenities}
                    onClick={() => navigate(`/courts/${court.id}`)}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Filters Sheet */}
      <CourtFilters
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Check-in Sheet */}
      {checkInCourtId && (
        <CheckInSheet
          open={checkInSheetOpen}
          onOpenChange={setCheckInSheetOpen}
          courtId={checkInCourtId}
          courtName={allCourts.find(c => c.id === checkInCourtId)?.name || "Court"}
          checkedInUsers={checkIns.filter(c => c.court_id === checkInCourtId)}
        />
      )}

      {/* Add Court Sheet */}
      <AddCourtSheet open={addCourtOpen} onOpenChange={setAddCourtOpen} />
    </div>
  );
}
