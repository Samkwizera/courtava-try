import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CheckIn } from "@/hooks/useCheckIns";

// Set the token once at module level
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface Court {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  playersNow?: number;
}

interface CourtMapProps {
  courts: Court[];
  onCourtSelect?: (court: Court) => void;
  center?: [number, number];
  zoom?: number;
  checkIns?: CheckIn[];
  onAvatarClick?: (courtId: string) => void;
  selectedCourtId?: string | null;
}

export function CourtMap({
  courts,
  onCourtSelect,
  center = [-1.9403, 30.0588],
  zoom = 13,
  checkIns = [],
  onAvatarClick,
  selectedCourtId,
}: CourtMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // ── 1. Initialize map (runs once) ──
  useEffect(() => {
    if (map.current || !mapContainer.current || !mapboxgl.accessToken) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center[1], center[0]], // Mapbox uses [lng, lat]
      zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.current.addControl(
      new mapboxgl.GeolocateControl({ trackUserLocation: true }),
      "bottom-right"
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ── 2. Sync markers whenever courts/selection/checkIns change ──
  useEffect(() => {
    const m = map.current;
    if (!m) return;

    const addMarkers = () => {
      // Clear old markers
      markers.current.forEach((mk) => mk.remove());
      markers.current = [];

      courts.forEach((court) => {
        const isSelected = selectedCourtId === court.id;
        const courtCheckIns = checkIns.filter((c) => c.court_id === court.id);
        const count = courtCheckIns.length;

        // Marker element
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

        // Badge for check-in count
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

        // Popup
        const popup = new mapboxgl.Popup({ offset: 20, closeButton: true })
          .setHTML(`
            <div style="padding:4px 2px; min-width:140px">
              <strong style="font-size:13px">${court.name}</strong>
              <p style="font-size:11px; color:#666; margin:2px 0 0">${court.address}</p>
              ${count > 0 ? `<p style="font-size:11px; color:#22c55e; margin:4px 0 0; font-weight:600">${count} player${count > 1 ? "s" : ""} here</p>` : ""}
            </div>
          `);

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

    // If map is already loaded, add markers immediately; otherwise wait
    if (m.loaded()) {
      addMarkers();
    } else {
      m.on("load", addMarkers);
    }

    return () => {
      m.off("load", addMarkers);
    };
  }, [courts, selectedCourtId, checkIns, onCourtSelect, onAvatarClick]);

  // ── 3. Fly to new center when it changes ──
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({ center: [center[1], center[0]], zoom, duration: 800 });
  }, [center, zoom]);

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
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100%", minHeight: 400, borderRadius: 8 }}
    />
  );
}
