import {
  ChevronRight,
  List,
  Locate,
  Map as MapIcon,
  MapPin,
  Navigation,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
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
      const liveCount = checkIns.filter((checkIn) => checkIn.court_id === court.id).length;

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
        playersNow: liveCount,
        surface: court.surface as "outdoor" | "indoor" | "cement",
        amenities: {
          lights: court.lights,
          water: court.water,
          parking: court.parking,
        },
        photo_url: court.photo_url,
      };
    });
  }, [dbCourts, userLocation, checkIns]);

  const activeFilterCount =
    filters.surfaces.length +
    Object.values(filters.amenities).filter(Boolean).length;

  const filteredCourts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = allCourts.filter(
      (court) =>
        !query ||
        court.name.toLowerCase().includes(query) ||
        court.address.toLowerCase().includes(query)
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

  const activeCourts = allCourts.filter((court) => court.playersNow > 0).length;
  const selectedCourtDetails = selectedCourt
    ? filteredCourts.find((court) => court.id === selectedCourt)
    : null;
  const hasAnyRefinement = searchQuery.trim().length > 0 || activeFilterCount > 0;

  const resetSearchAndFilters = () => {
    setSearchQuery("");
    setFilters(defaultFilters);
  };

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
        eyebrow={activeCourts > 0 ? `${activeCourts} active now` : "Kigali courts"}
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
            {isLocating ? "..." : locationEnabled ? "On" : "Near me"}
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
                placeholder="Search courts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-9 rounded-xl bg-muted/70 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring border-0"
                style={{ fontFamily: "inherit" }}
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Open court filters"
              className="w-10 h-10 rounded-xl bg-muted/70 flex items-center justify-center relative ios-tap"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="w-4 h-4 text-foreground" />
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-11">
                  {activeFilterCount}
                </Badge>
              )}
            </button>
          </div>

          {/* View toggle - iOS segmented control */}
          <div className="flex gap-1 p-0.5 bg-muted/70 rounded-xl">
            <button
              type="button"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-sm font-medium ios-tap",
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
              type="button"
              aria-pressed={viewMode === "map"}
              onClick={() => setViewMode("map")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-sm font-medium ios-tap",
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
        <div className="flex-1 overflow-y-auto px-3 pb-32 pt-3">
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <MapPin className="w-4 h-4" />
              <span>{filteredCourts.length} {filteredCourts.length === 1 ? "court" : "courts"} in Kigali</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {filters.sortBy === "distance" ? "Nearest first" : "Top rated"}
            </span>
          </div>

          {filteredCourts.length === 0 ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-8 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <Search className="h-6 w-6" strokeWidth={1.9} />
              </div>
              <h2 className="text-base font-semibold text-foreground">No courts found</h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Try a different search or loosen your filters.
              </p>
              {hasAnyRefinement && (
                <Button className="mt-5" variant="secondary" onClick={resetSearchAndFilters}>
                  <RotateCcw className="h-4 w-4" />
                  Reset search
                </Button>
              )}
            </div>
          ) : (
            <StaggerGroup className="flex flex-col gap-2">
              {filteredCourts.map((court) => (
              <StaggerItem key={court.id}>
                <CourtCard
                  name={court.name}
                  address={court.address}
                  distance={court.distance}
                  rating={court.rating}
                  reviewCount={court.reviewCount}
                  playersNow={court.playersNow}
                  surface={court.surface}
                  amenities={court.amenities}
                  imageUrl={court.photo_url}
                  variant="compact"
                  onClick={() => navigate(`/courts/${court.id}`)}
                />
              </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      ) : (
        <div className="relative flex-1 min-h-0">
          <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex items-center justify-between gap-3">
            <div className="rounded-full border border-border bg-background/90 px-3 py-2 text-xs font-semibold text-foreground shadow-card backdrop-blur">
              {filteredCourts.length} {filteredCourts.length === 1 ? "court" : "courts"}
              {activeCourts > 0 && <span className="ml-1 text-primary">/ {activeCourts} active</span>}
            </div>
            {hasAnyRefinement && (
              <button
                type="button"
                className="pointer-events-auto rounded-full border border-border bg-background/90 px-3 py-2 text-xs font-semibold text-foreground shadow-card backdrop-blur ios-tap"
                onClick={resetSearchAndFilters}
              >
                Reset
              </button>
            )}
          </div>

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
              showSearch={false}
            />
          </div>

          {/* Show court card only when a marker is clicked */}
          {selectedCourtDetails && (
              <div className="absolute bottom-28 left-4 right-4 z-[1000]">
                <div className="relative rounded-2xl border border-border bg-card p-3 shadow-float">
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

                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {selectedCourtDetails.photo_url ? (
                        <img src={selectedCourtDetails.photo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-primary">
                          <MapPin className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-semibold text-foreground">
                            {selectedCourtDetails.name}
                          </h2>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {selectedCourtDetails.address}
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize shrink-0">
                          {selectedCourtDetails.surface}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3.5 w-3.5" />
                          {selectedCourtDetails.distance}
                        </span>
                        <span className="flex items-center gap-1 text-primary">
                          <Users className="h-3.5 w-3.5" />
                          {selectedCourtDetails.playersNow || 0} now
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-[1fr_1.2fr] gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(`/courts/${selectedCourtDetails.id}`)}
                    >
                      Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setCheckInCourtId(selectedCourtDetails.id);
                        setCheckInSheetOpen(true);
                      }}
                    >
                      Check in
                    </Button>
                  </div>
                </div>
              </div>
          )}
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
