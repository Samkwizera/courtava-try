import { MapPin, Search, Filter, List, Map as MapIcon, X, Locate } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { CourtCard } from "@/components/cards/CourtCard";
import { CourtMap } from "@/components/map/CourtMap";
import { CourtFilters, CourtFiltersState } from "@/components/courts/CourtFilters";
import { CheckInSheet } from "@/components/courts/CheckInSheet";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useCourts } from "@/hooks/useCourts";
import { useUserLocation, getDistanceKm, formatDistance } from "@/hooks/useUserLocation";
import { cn } from "@/lib/utils";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

const defaultFilters: CourtFiltersState = {
  surfaces: [],
  amenities: { lights: false, water: false, parking: false },
  sortBy: "distance",
};

export default function CourtsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { view?: "list" | "map" } | null;
  const { checkIns } = useCheckIns();
  const { dbCourts } = useCourts();
  const { userLocation, isLocating, locationEnabled, requestLocation } = useUserLocation();
  const [viewMode, setViewMode] = useState<"list" | "map">(navState?.view ?? "map");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<CourtFiltersState>(defaultFilters);
  const [checkInSheetOpen, setCheckInSheetOpen] = useState(false);
  const [checkInCourtId, setCheckInCourtId] = useState<string | null>(null);

  // Use database courts with real distance when location is available
  const allCourts = useMemo(() => {
    return dbCourts.map((court) => {
      let distance = "N/A";
      let distanceNum = 999;

      if (userLocation) {
        const km = getDistanceKm(userLocation.lat, userLocation.lng, court.lat, court.lng);
        distance = formatDistance(km);
        distanceNum = km;
      }

      return {
        id: court.id,
        name: court.name,
        address: court.address,
        lat: court.lat,
        lng: court.lng,
        distance,
        distanceNum,
        rating: 0,
        reviewCount: 0,
        playersNow: 0,
        surface: court.surface as "outdoor" | "indoor" | "cement",
        amenities: {
          lights: court.lights,
          water: court.water,
          parking: court.parking,
        },
        photo_url: court.photo_url,
      };
    });
  }, [dbCourts, userLocation]);

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
    <div className="flex flex-col bg-background safe-top" style={{ height: "100dvh" }}>
      {/* Header */}
      <PageHeader
        title="Find Courts"
        actions={
          <Button
            variant={locationEnabled ? "default" : "secondary"}
            size="sm"
            onClick={requestLocation}
            disabled={isLocating}
            className="gap-1.5 rounded-full h-8 px-3 text-xs ios-tap"
          >
            <Locate className={`w-3.5 h-3.5 ${isLocating ? "animate-pulse" : ""}`} />
            {isLocating ? "…" : locationEnabled ? "On" : "Location"}
          </Button>
        }
      >
        <>

          {/* Search bar */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courts…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-muted/70 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring border-0"
                style={{ fontFamily: "inherit" }}
              />
            </div>
            <button
              className="w-9 h-9 rounded-xl bg-muted/70 flex items-center justify-center relative ios-tap"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="w-4 h-4 text-foreground" />
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-11">
                  {activeFilterCount}
                </Badge>
              )}
            </button>
          </div>

          {/* View toggle — iOS segmented control */}
          <div className="flex gap-1 p-0.5 bg-muted/70 rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-sm font-medium ios-tap",
                viewMode === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
              style={{ transition: "background-color 0.2s cubic-bezier(0.25,0.46,0.45,0.94)" }}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-sm font-medium ios-tap",
                viewMode === "map"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
              style={{ transition: "background-color 0.2s cubic-bezier(0.25,0.46,0.45,0.94)" }}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
          </div>
        </>
      </PageHeader>

      {/* Content */}
      {viewMode === "list" ? (
        <StaggerGroup className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <MapPin className="w-4 h-4" />
            <span>{filteredCourts.length} courts in Kigali</span>
          </div>
          {filteredCourts.map((court) => {
            const liveCount = checkIns.filter((c) => c.court_id === court.id).length;
            return (
              <StaggerItem key={court.id}>
                <CourtCard
                  name={court.name}
                  address={court.address}
                  distance={court.distance}
                  rating={court.rating}
                  reviewCount={court.reviewCount}
                  playersNow={liveCount}
                  surface={court.surface}
                  amenities={court.amenities}
                  variant="compact"
                  onClick={() => navigate(`/courts/${court.id}`)}
                />
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      ) : (
        <div className="relative flex-1 min-h-0">
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
              userLocation={userLocation}
              isLocating={isLocating}
              onRequestLocation={requestLocation}
              locationEnabled={locationEnabled}
            />
          </div>

          {/* Show court card only when a marker is clicked */}
          {selectedCourt && (() => {
            const court = filteredCourts.find(c => c.id === selectedCourt);
            if (!court) return null;
            const liveCount = checkIns.filter((c) => c.court_id === court.id).length;
            return (
              <div className="absolute bottom-28 left-4 right-4 z-[1000]">
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
                    variant="compact"
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
    </div>
  );
}
