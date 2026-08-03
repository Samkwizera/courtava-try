import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CheckIn } from "@/hooks/useCheckIns";
import { Search, Locate, X, MapPin, Loader2 } from "lucide-react";
import { formatDistance, getDistanceKm } from "@/hooks/useUserLocation";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const COURT_SOURCE_ID = "court-markers";
const COURT_CIRCLE_LAYER_ID = "court-marker-circles";
const COURT_DOT_LAYER_ID = "court-marker-dots";
const COURT_BADGE_LAYER_ID = "court-marker-badges";
const COURT_BADGE_TEXT_LAYER_ID = "court-marker-badge-text";

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
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const placeMarker = useRef<mapboxgl.Marker | null>(null);
  const courtPopup = useRef<mapboxgl.Popup | null>(null);
  const initialCenter = useRef(center);
  const initialZoom = useRef(zoom);
  const didFitInitialBounds = useRef(false);
  const [mapSearch, setMapSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const centerLat = center[0];
  const centerLng = center[1];

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
      const pin = document.createElement("div");
      el.style.cssText = `
        width: 28px; height: 28px;
        cursor: pointer;
      `;
      pin.style.cssText = `
        width: 28px; height: 28px;
        background: #ef4444;
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;
      el.appendChild(pin);

      placeMarker.current = new mapboxgl.Marker({ element: el, anchor: "center" })
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

  const fitToCourts = useCallback(
    (m: mapboxgl.Map) => {
      if (courts.length === 0) return;

      const bounds = new mapboxgl.LngLatBounds();
      courts.forEach((court) => bounds.extend([court.lng, court.lat]));

      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }

      m.fitBounds(bounds, {
        padding: { top: 90, bottom: 140, left: 48, right: 48 },
        maxZoom: 15,
        duration: 700,
      });
    },
    [courts, userLocation]
  );

  // ── 1. Initialize map ──
  useEffect(() => {
    if (map.current || !mapContainer.current || !mapboxgl.accessToken) return;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialCenter.current[1], initialCenter.current[0]],
      zoom: initialZoom.current,
    });
    map.current = m;

    const reportMapError = (event: mapboxgl.ErrorEvent) => {
      console.error("Mapbox error:", event.error);
      setMapError("Map failed to load. Check your Mapbox token and network connection.");
    };

    m.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    m.on("error", reportMapError);

    requestAnimationFrame(() => m.resize());
    const resizeTimer = window.setTimeout(() => m.resize(), 250);

    return () => {
      window.clearTimeout(resizeTimer);
      m.off("error", reportMapError);
      courtPopup.current?.remove();
      courtPopup.current = null;
      placeMarker.current?.remove();
      placeMarker.current = null;
      m.remove();
      map.current = null;
    };
  }, []);

  // Keep Mapbox dimensions in sync after tab changes, mobile viewport changes, or data load.
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    const resize = () => m.resize();
    requestAnimationFrame(resize);
    const resizeTimer = window.setTimeout(resize, 250);
    window.addEventListener("resize", resize);

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", resize);
    };
  }, [courts.length]);

  // ── 2. Sync court markers ──
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    const addMarkers = () => {
      const courtSourceData = {
        type: "FeatureCollection" as const,
        features: courts.map((court) => {
          const count = checkIns.filter((c) => c.court_id === court.id).length;
          const distText = userLocation
            ? formatDistance(getDistanceKm(userLocation.lat, userLocation.lng, court.lat, court.lng))
            : "";

          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [court.lng, court.lat],
            },
            properties: {
              courtId: court.id,
              name: court.name,
              address: court.address,
              count,
              countLabel: count ? String(count) : "",
              distText,
              isSelected: selectedCourtId === court.id,
            },
          };
        }),
      };

      const source = m.getSource(COURT_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
      if (source) {
        source.setData(courtSourceData as Parameters<mapboxgl.GeoJSONSource["setData"]>[0]);
        return;
      }

      m.addSource(COURT_SOURCE_ID, {
        type: "geojson",
        data: courtSourceData,
      });

      m.addLayer({
        id: COURT_CIRCLE_LAYER_ID,
        type: "circle",
        source: COURT_SOURCE_ID,
        paint: {
          "circle-radius": ["case", ["boolean", ["get", "isSelected"], false], 20, 16],
          "circle-color": ["case", ["boolean", ["get", "isSelected"], false], "#4ade80", "#22c55e"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
        },
      });

      m.addLayer({
        id: COURT_DOT_LAYER_ID,
        type: "circle",
        source: COURT_SOURCE_ID,
        paint: {
          "circle-radius": ["case", ["boolean", ["get", "isSelected"], false], 8, 6],
          "circle-color": "#ffffff",
        },
      });

      m.addLayer({
        id: COURT_BADGE_LAYER_ID,
        type: "circle",
        source: COURT_SOURCE_ID,
        filter: [">", ["get", "count"], 0],
        paint: {
          "circle-radius": 9,
          "circle-color": "#f97316",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-translate": [12, -12],
          "circle-translate-anchor": "viewport",
        },
      });

      m.addLayer({
        id: COURT_BADGE_TEXT_LAYER_ID,
        type: "symbol",
        source: COURT_SOURCE_ID,
        filter: [">", ["get", "count"], 0],
        layout: {
          "text-field": ["get", "countLabel"],
          "text-size": 10,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-translate": [12, -12],
          "text-translate-anchor": "viewport",
        },
      });
    };

    const findCourtFromFeature = (
      event: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      const courtId = event.features?.[0]?.properties?.courtId as string | undefined;
      return courtId ? courts.find((court) => court.id === courtId) : undefined;
    };

    const handleCourtClick = (
      event: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      const court = findCourtFromFeature(event);
      if (!court) return;

      onCourtSelect?.(court);

      const count = checkIns.filter((c) => c.court_id === court.id).length;
      const distText = userLocation
        ? formatDistance(getDistanceKm(userLocation.lat, userLocation.lng, court.lat, court.lng))
        : null;

      courtPopup.current?.remove();
      courtPopup.current = new mapboxgl.Popup({ offset: 20, closeButton: true })
        .setLngLat([court.lng, court.lat])
        .setHTML(
          `<div style="padding:4px 2px; min-width:140px">
            <strong style="font-size:13px">${esc(court.name)}</strong>
            <p style="font-size:11px; color:#666; margin:2px 0 0">${esc(court.address)}</p>
            ${distText ? `<p style="font-size:11px; color:#3b82f6; margin:4px 0 0; font-weight:600">${esc(distText)} from you</p>` : ""}
            ${count > 0 ? `<p style="font-size:11px; color:#22c55e; margin:4px 0 0; font-weight:600">${count} player${count > 1 ? "s" : ""} here</p>` : ""}
          </div>`
        )
        .addTo(m);
    };

    const handleBadgeClick = (
      event: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      const court = findCourtFromFeature(event);
      if (!court) return;

      event.preventDefault();
      onAvatarClick?.(court.id);
    };

    const setPointerCursor = () => {
      m.getCanvas().style.cursor = "pointer";
    };

    const clearPointerCursor = () => {
      m.getCanvas().style.cursor = "";
    };

    const bindLayerEvents = () => {
      if (!m.getLayer(COURT_CIRCLE_LAYER_ID)) return;

      m.on("click", COURT_CIRCLE_LAYER_ID, handleCourtClick);
      m.on("click", COURT_DOT_LAYER_ID, handleCourtClick);
      m.on("click", COURT_BADGE_LAYER_ID, handleBadgeClick);
      m.on("click", COURT_BADGE_TEXT_LAYER_ID, handleBadgeClick);
      m.on("mouseenter", COURT_CIRCLE_LAYER_ID, setPointerCursor);
      m.on("mouseenter", COURT_DOT_LAYER_ID, setPointerCursor);
      m.on("mouseenter", COURT_BADGE_LAYER_ID, setPointerCursor);
      m.on("mouseleave", COURT_CIRCLE_LAYER_ID, clearPointerCursor);
      m.on("mouseleave", COURT_DOT_LAYER_ID, clearPointerCursor);
      m.on("mouseleave", COURT_BADGE_LAYER_ID, clearPointerCursor);
    };

    const syncAndBind = () => {
      addMarkers();
      bindLayerEvents();
    };

    if (m.loaded()) {
      syncAndBind();
    } else {
      m.on("load", syncAndBind);
    }

    if (!didFitInitialBounds.current && courts.length > 0) {
      const fit = () => {
        if (!didFitInitialBounds.current) {
          fitToCourts(m);
          didFitInitialBounds.current = true;
        }
      };

      if (m.loaded()) {
        fit();
      } else {
        m.once("load", fit);
      }
    }

    return () => {
      m.off("load", syncAndBind);

      if (map.current !== m) return;

      if (m.getLayer(COURT_CIRCLE_LAYER_ID)) {
        m.off("click", COURT_CIRCLE_LAYER_ID, handleCourtClick);
        m.off("mouseenter", COURT_CIRCLE_LAYER_ID, setPointerCursor);
        m.off("mouseleave", COURT_CIRCLE_LAYER_ID, clearPointerCursor);
      }
      if (m.getLayer(COURT_DOT_LAYER_ID)) {
        m.off("click", COURT_DOT_LAYER_ID, handleCourtClick);
        m.off("mouseenter", COURT_DOT_LAYER_ID, setPointerCursor);
        m.off("mouseleave", COURT_DOT_LAYER_ID, clearPointerCursor);
      }
      if (m.getLayer(COURT_BADGE_LAYER_ID)) {
        m.off("click", COURT_BADGE_LAYER_ID, handleBadgeClick);
        m.off("mouseenter", COURT_BADGE_LAYER_ID, setPointerCursor);
        m.off("mouseleave", COURT_BADGE_LAYER_ID, clearPointerCursor);
      }
      if (m.getLayer(COURT_BADGE_TEXT_LAYER_ID)) {
        m.off("click", COURT_BADGE_TEXT_LAYER_ID, handleBadgeClick);
      }
    };
  }, [courts, selectedCourtId, checkIns, onCourtSelect, onAvatarClick, userLocation, fitToCourts]);

  // ── 3. Fly to new center ──
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({ center: [centerLng, centerLat], zoom, duration: 800 });
  }, [centerLat, centerLng, zoom]);

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

    userMarker.current = new mapboxgl.Marker({ element: el, anchor: "center" })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 15 }).setHTML(
          `<div style="padding:4px 2px"><strong style="font-size:12px">You are here</strong></div>`
        )
      )
      .addTo(m);

    // Fit bounds to show user + all courts
    if (courts.length > 0) {
      fitToCourts(m);
    } else {
      m.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14, duration: 1000 });
    }

    return () => {
      userMarker.current?.remove();
      userMarker.current = null;
    };
  }, [userLocation, courts, fitToCourts]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

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
      {mapError && (
        <div className="absolute left-3 right-3 top-16 z-20 rounded-xl border border-destructive/20 bg-background/95 px-3 py-2 text-sm text-destructive shadow-lg">
          {mapError}
        </div>
      )}

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
