import { useEffect, useState, useId, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { Locate, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckIn } from "@/hooks/useCheckIns";
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

// Create avatar marker icon (Snapchat-style)
const createAvatarIcon = (name: string, color: string = "#FF6B00") => {
  const initial = (name || "U")[0].toUpperCase();
  
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 60" width="40" height="48">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="25" cy="22" r="18" fill="${color}" filter="url(#shadow)"/>
      <polygon points="25,55 15,35 35,35" fill="${color}"/>
      <circle cx="25" cy="22" r="15" fill="white"/>
      <text x="25" y="28" text-anchor="middle" font-size="16" font-weight="bold" fill="${color}">${initial}</text>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: "avatar-marker",
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
};

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

// Component to handle map centering
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Component to fly to selected court
function FlyToSelectedCourt({ courts, selectedCourtId }: { courts: Court[]; selectedCourtId?: string | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedCourtId) {
      const court = courts.find(c => c.id === selectedCourtId);
      if (court) {
        map.flyTo([court.lat, court.lng], 15, { duration: 0.8 });
      }
    }
  }, [selectedCourtId, courts, map]);
  
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

// Checked-in user avatars (Snapchat-style)
function CheckedInAvatars({ 
  checkIns, 
  courts,
  onAvatarClick 
}: { 
  checkIns: CheckIn[];
  courts: Court[];
  onAvatarClick?: (courtId: string) => void;
}) {
  // Group check-ins by court and offset positions slightly
  const checkInsByCourtWithPositions = checkIns.map((checkIn, index) => {
    const court = courts.find(c => c.id === checkIn.court_id);
    if (!court) return null;

    // Count how many users at this court
    const courtCheckIns = checkIns.filter(c => c.court_id === checkIn.court_id);
    const positionIndex = courtCheckIns.findIndex(c => c.id === checkIn.id);

    // Offset positions in a circle around the court
    const angleStep = (2 * Math.PI) / Math.max(courtCheckIns.length, 1);
    const angle = positionIndex * angleStep;
    const radius = 0.0008; // Small offset in lat/lng

    return {
      ...checkIn,
      lat: court.lat + Math.cos(angle) * radius,
      lng: court.lng + Math.sin(angle) * radius,
    };
  }).filter(Boolean);

  // Avatar colors for variety
  const colors = ["#FF6B00", "#10B981", "#6366F1", "#EC4899", "#F59E0B"];

  return (
    <>
      {checkInsByCourtWithPositions.map((checkIn, index) => {
        if (!checkIn) return null;
        
        const displayName = checkIn.profile?.display_name || "Player";
        const color = colors[index % colors.length];
        
        return (
          <Marker
            key={checkIn.id}
            position={[checkIn.lat, checkIn.lng]}
            icon={createAvatarIcon(displayName, color)}
            eventHandlers={{
              click: () => onAvatarClick?.(checkIn.court_id),
            }}
          >
            <Popup>
              <div className="p-1 text-center">
                <p className="font-semibold text-sm">{displayName}</p>
                <p className="text-xs text-gray-500">Playing now</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
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
  const mapId = useId();
  const [isMounted, setIsMounted] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLocate = useCallback((position: [number, number]) => {
    setUserPosition(position);
  }, []);

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
      <FlyToSelectedCourt courts={courts} selectedCourtId={selectedCourtId} />
      <CourtMarkers courts={courts} onCourtSelect={onCourtSelect} />
      <CheckedInAvatars checkIns={checkIns} courts={courts} onAvatarClick={onAvatarClick} />
      <LocateControl onLocate={handleLocate} />
      <UserMarker position={userPosition} />
    </MapContainer>
  );
}
