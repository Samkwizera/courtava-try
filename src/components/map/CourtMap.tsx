import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CheckIn } from "@/hooks/useCheckIns";
import { Search, Locate, X, MapPin, Loader2 } from "lucide-react";
import { formatDistance, getDistanceKm } from "@/hooks/useUserLocation";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Court {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  playersNow?: number;
}

interface PlaceResult {
  id: string;
  name: string;
  fullAddress: string;
  lng: number;
  lat: number;
}

interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
}

interface MapboxGeocodingResponse {
  features?: MapboxFeature[];
}

interface CourtMapProps {
  courts: Court[];
  onCourtSelect?: (court: Court) => void;
  center?: [number, number];
  zoom?: number;
  checkIns?: CheckIn[];
  onAvatarClick?: (courtId: string) => void;
  selectedCourtId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  isLocating?: boolean;
  onRequestLocation?: () => void;
  locationEnabled?: boolean;
}

export function CourtMap({
  courts,
  onCourtSelect,
  center = [-1.9403, 30.0588],
  zoom = 13,
  checkIns = [],
  onAvatarClick,
  selectedCourtId,
  userLocation,
  isLocating,
  onRequestLocation,
  locationEnabled,
}: CourtMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const placeMarker = useRef<mapboxgl.Marker | null>(null);
  const initialCenter = useRef(center);
  const initialZoom = useRef(zoom);
  const [mapSearch, setMapSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter courts for search suggestions
  const courtResults = useMemo(() => {
    if (!mapSearch.trim()) return [];
    const q = mapSearch.toLowerCase();
    return courts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [mapSearch, courts]);

  // Geocode places via Mapbox API (debounced)
  const searchPlaces = useCallback(
    (query: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (!query.trim() || !mapboxgl.accessToken) {
        setPlaceResults([]);
        setIsSearchingPlaces(false);
        return;
      }
      setIsSearchingPlaces(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const proximity = userLocation
            ? `&proximity=${userLocation.lng},${userLocation.lat}`
            : "&proximity=30.0588,-1.9403";
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              query
            )}.json?access_token=${mapboxgl.accessToken}&limit=5${proximity}&language=en`
          );
          const data = (await res.json()) as MapboxGeocodingResponse;
          const places: PlaceResult[] = (data.features || []).map(
            (f) => ({
              id: f.id,
              name: f.text,
              fullAddress: f.place_name,
              lng: f.center[0],
              lat: f.center[1],
            })
          );
          setPlaceResults(places);
        } catch {
          setPlaceResults([]);
        } finally {
          setIsSearchingPlaces(false);
        }
      }, 350);
    },
    [userLocation]
  );

  const handleSearchChange = (value: string) => {
    setMapSearch(value);
    searchPlaces(value);
  };

  const flyToCourt = (court: Court) => {
    setMapSearch(court.name);
    setSearchFocused(false);
    removePlaceMarker();
    map.current?.flyTo({
      center: [court.lng, court.lat],
      zoom: 16,
      duration: 1200,
    });
    onCourtSelect?.(court);
  };

  const flyToPlace = (place: PlaceResult) => {
    setMapSearch(place.name);
    setSearchFocused(false);
    removePlaceMarker();

    // Add a temporary red marker for the place
    if (map.current) {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 28px; height: 28px;
        background: #ef4444;
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      placeMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 20 }).setHTML(
            `<div style="padding:4px 2px; min-width:120px">
              <strong style="font-size:13px">${esc(place.name)}</strong>
              <p style="font-size:11px; color:#666; margin:2px 0 0">${esc(place.fullAddress)}</p>
            </div>`
          )
        )
        .addTo(map.current);

      map.current.flyTo({
        center: [place.lng, place.lat],
        zoom: 15,
        duration: 1200,
      });
    }
  };

  const removePlaceMarker = () => {
    if (placeMarker.current) {
      placeMarker.current.remove();
      placeMarker.current = null;
    }
  };

  // ── 1. Initialize map ──
  useEffect(() => {
    if (map.current || !mapContainer.current || !mapboxgl.accessToken) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialCenter.current[1], initialCenter.current[0]],
      zoom: initialZoom.current,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    return () => {
      placeMarker.current?.remove();
      placeMarker.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ── 2. Sync court markers ──
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    const addMarkers = () => {
      markers.current.forEach((mk) => mk.remove());
      markers.current = [];

      courts.forEach((court) => {
        const isSelected = selectedCourtId === court.id;
        const courtCheckIns = checkIns.filter((c) => c.court_id === court.id);
        const count = courtCheckIns.length;

        const distText =
          userLocation
            ? formatDistance(
                getDistanceKm(userLocation.lat, userLocation.lng, court.lat, court.lng)
              )
            : null;

        const el = document.createElement("div");
        el.style.cssText = `
          width: 32px; height: 32px;
          background: ${isSelected ? "#4ade80" : "#22c55e"};
          border: 3px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.8)"};
          border-radius: 50%;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.15s;
          transform: ${isSelected ? "scale(1.3)" : "scale(1)"};
          position: relative;
        `;
        el.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="white"/>
          </svg>
        `;

        if (count > 0) {
          const badge = document.createElement("span");
          badge.textContent = String(count);
          badge.style.cssText = `
            position: absolute; top: -6px; right: -6px;
            background: #f97316; color: white; font-size: 10px; font-weight: 700;
            width: 18px; height: 18px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            border: 2px solid white;
          `;
          el.appendChild(badge);
        }

        const popupHtml = `
          <div style="padding:4px 2px; min-width:140px">
            <strong style="font-size:13px">${esc(court.name)}</strong>
            <p style="font-size:11px; color:#666; margin:2px 0 0">${esc(court.address)}</p>
            ${distText ? `<p style="font-size:11px; color:#3b82f6; margin:4px 0 0; font-weight:600">📍 ${esc(distText)} from you</p>` : ""}
            ${count > 0 ? `<p style="font-size:11px; color:#22c55e; margin:4px 0 0; font-weight:600">${count} player${count > 1 ? "s" : ""} here</p>` : ""}
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 20, closeButton: true }).setHTML(popupHtml);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([court.lng, court.lat])
          .setPopup(popup)
          .addTo(m);

        el.addEventListener("click", () => {
          onCourtSelect?.(court);
        });

        markers.current.push(marker);
      });
    };

    if (m.loaded()) {
      addMarkers();
    } else {
      m.on("load", addMarkers);
    }

    return () => {
      m.off("load", addMarkers);
    };
  }, [courts, selectedCourtId, checkIns, onCourtSelect, userLocation]);

  // ── 3. Fly to new center ──
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({ center: [center[1], center[0]], zoom, duration: 800 });
  }, [center, zoom]);

  // ── 4. User location marker ──
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    if (userMarker.current) {
      userMarker.current.remove();
      userMarker.current = null;
    }

    if (!userLocation) return;

    const el = document.createElement("div");
    el.style.cssText = `
      width: 20px; height: 20px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(59,130,246,0.25), 0 2px 8px rgba(0,0,0,0.3);
    `;

    userMarker.current = new mapboxgl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 15 }).setHTML(
          `<div style="padding:4px 2px"><strong style="font-size:12px">📍 You are here</strong></div>`
        )
      )
      .addTo(m);

    // Fit bounds to show user + all courts
    if (courts.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([userLocation.lng, userLocation.lat]);
      courts.forEach((c) => bounds.extend([c.lng, c.lat]));
      m.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 1200 });
    } else {
      m.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14, duration: 1000 });
    }

    return () => {
      userMarker.current?.remove();
      userMarker.current = null;
    };
  }, [userLocation, courts]);

  // ── No token fallback ──
  if (!mapboxgl.accessToken) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1f5f9",
          borderRadius: 8,
          flexDirection: "column",
          gap: 8,
        }}
      >
        <p style={{ color: "#64748b", fontSize: 14 }}>Map not configured</p>
        <p style={{ color: "#94a3b8", fontSize: 12 }}>
          Add <code>VITE_MAPBOX_ACCESS_TOKEN</code> to .env
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Floating search bar on the map */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search courts or places..."
            value={mapSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            className="w-full h-10 pl-9 pr-9 rounded-xl bg-background/95 backdrop-blur-sm border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
          />
          {mapSearch && (
            <button
              onClick={() => {
                setMapSearch("");
                setSearchFocused(false);
                setPlaceResults([]);
                removePlaceMarker();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Search dropdown results */}
        {searchFocused && mapSearch.trim() && (
          <div className="mt-1 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg max-h-72 overflow-y-auto">
            {/* Court results section */}
            {courtResults.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-secondary/50">
                  Courts
                </div>
                {courtResults.map((court) => {
                  const distText =
                    userLocation
                      ? formatDistance(
                          getDistanceKm(userLocation.lat, userLocation.lng, court.lat, court.lng)
                        )
                      : null;
                  return (
                    <button
                      key={court.id}
                      onClick={() => flyToCourt(court)}
                      className="w-full text-left px-4 py-3 hover:bg-secondary/80 transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-full bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                          <circle cx="12" cy="12" r="8"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-foreground">{court.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span className="truncate">{court.address}</span>
                          {distText && (
                            <span className="text-primary font-medium shrink-0"> &middot; {distText}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* Place results section */}
            {(placeResults.length > 0 || isSearchingPlaces) && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-secondary/50 flex items-center gap-2">
                  Places
                  {isSearchingPlaces && <Loader2 className="w-3 h-3 animate-spin" />}
                </div>
                {placeResults.map((place) => {
                  const distText =
                    userLocation
                      ? formatDistance(
                          getDistanceKm(userLocation.lat, userLocation.lng, place.lat, place.lng)
                        )
                      : null;
                  return (
                    <button
                      key={place.id}
                      onClick={() => flyToPlace(place)}
                      className="w-full text-left px-4 py-3 hover:bg-secondary/80 transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-foreground">{place.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span className="truncate">{place.fullAddress}</span>
                          {distText && (
                            <span className="text-primary font-medium shrink-0"> &middot; {distText}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* No results */}
            {courtResults.length === 0 && placeResults.length === 0 && !isSearchingPlaces && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Location button */}
      {onRequestLocation && (
        <button
          onClick={onRequestLocation}
          disabled={isLocating}
          className={`absolute bottom-24 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border transition-colors ${
            locationEnabled
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border hover:bg-secondary"
          }`}
          title={locationEnabled ? "Location enabled" : "Show my location"}
        >
          <Locate className={`w-5 h-5 ${isLocating ? "animate-pulse" : ""}`} />
        </button>
      )}

      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%", minHeight: 400, borderRadius: 8 }}
      />
    </div>
  );
}
