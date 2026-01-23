import { useEffect, useState, useId, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { Locate, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom green marker for courts
const courtIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Blue marker for user location
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
}

// Component to handle map centering - must be inside MapContainer
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Locate control component
function LocateControl({ 
  onLocate 
}: { 
  onLocate: (position: [number, number]) => void;
}) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 15, { duration: 1.5 });
        onLocate([latitude, longitude]);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please check your permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map, onLocate]);

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: "10px", marginRight: "10px" }}>
      <div className="leaflet-control">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleLocate}
          disabled={isLocating}
          className="bg-background shadow-md hover:bg-secondary"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Locate className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

// User location marker
function UserMarker({ position }: { position: [number, number] | null }) {
  if (!position) return null;
  
  return (
    <>
      <Circle
        center={position}
        radius={50}
        pathOptions={{ 
          color: "hsl(217, 91%, 60%)", 
          fillColor: "hsl(217, 91%, 60%)", 
          fillOpacity: 0.2 
        }}
      />
      <Marker position={position} icon={userIcon}>
        <Popup>
          <div className="p-1">
            <h3 className="font-semibold text-sm">Your Location</h3>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

// Separate component for markers to avoid context issues
function CourtMarkers({ courts, onCourtSelect }: { courts: Court[]; onCourtSelect?: (court: Court) => void }) {
  return (
    <>
      {courts.map((court) => (
        <Marker
          key={court.id}
          position={[court.lat, court.lng]}
          icon={courtIcon}
          eventHandlers={{
            click: () => onCourtSelect?.(court),
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-semibold text-sm mb-1">{court.name}</h3>
              <p className="text-xs text-gray-600 mb-1">{court.address}</p>
              {court.playersNow && court.playersNow > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  🏀 {court.playersNow} playing now
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export function CourtMap({ 
  courts, 
  onCourtSelect, 
  center = [-1.9403, 30.0588], // Kigali, Rwanda coordinates
  zoom = 13 
}: CourtMapProps) {
  const mapId = useId();
  const [isMounted, setIsMounted] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLocate = useCallback((position: [number, number]) => {
    setUserPosition(position);
  }, []);

  // Don't render map until component is mounted (fixes SSR/hydration issues)
  if (!isMounted) {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden bg-muted flex items-center justify-center" style={{ minHeight: "300px" }}>
        <span className="text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  return (
    <MapContainer
      key={mapId}
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: "300px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} zoom={zoom} />
      <CourtMarkers courts={courts} onCourtSelect={onCourtSelect} />
      <LocateControl onLocate={handleLocate} />
      <UserMarker position={userPosition} />
    </MapContainer>
  );
}
