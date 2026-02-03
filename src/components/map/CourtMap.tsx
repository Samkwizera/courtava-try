import { useEffect, useState, useRef } from "react";
import { 
  Map, 
  Marker, 
  Popup, 
  NavigationControl, 
  GeolocateControl,
  type MapRef
} from "react-map-gl/mapbox";
import { CheckIn } from "@/hooks/useCheckIns";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic2Fta3dpemVyYSIsImEiOiJjbWw2dThxcHUwMW85M2ZzNml2cW16aGs1In0.eqdDYMtaD4ZQ35VVYGs01g";

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

// Court marker component
function CourtMarker({ 
  court, 
  onClick,
  isSelected 
}: { 
  court: Court; 
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <Marker
      longitude={court.lng}
      latitude={court.lat}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <div 
        className={`
          w-8 h-8 rounded-full flex items-center justify-center cursor-pointer
          transition-all duration-200 shadow-lg
          ${isSelected 
            ? "bg-primary scale-125 ring-2 ring-primary/30" 
            : "bg-green-500 hover:scale-110"
          }
        `}
      >
        <span className="text-white text-sm">🏀</span>
      </div>
    </Marker>
  );
}

// Avatar marker for checked-in users
function AvatarMarker({
  checkIn,
  position,
  color,
  onClick,
}: {
  checkIn: CheckIn;
  position: { lat: number; lng: number };
  color: string;
  onClick: () => void;
}) {
  const displayName = checkIn.profile?.display_name || "Player";
  const initial = displayName[0].toUpperCase();

  return (
    <Marker
      longitude={position.lng}
      latitude={position.lat}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <div className="cursor-pointer transform hover:scale-110 transition-transform">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white"
          style={{ backgroundColor: color }}
        >
          {initial}
        </div>
        <div 
          className="w-0 h-0 mx-auto -mt-1"
          style={{
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: `10px solid ${color}`,
          }}
        />
      </div>
    </Marker>
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
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<Court | null>(null);
  const [viewState, setViewState] = useState({
    longitude: center[1],
    latitude: center[0],
    zoom: zoom,
  });

  // Fly to selected court
  useEffect(() => {
    if (selectedCourtId && mapRef.current) {
      const court = courts.find((c) => c.id === selectedCourtId);
      if (court) {
        mapRef.current.flyTo({
          center: [court.lng, court.lat],
          zoom: 15,
          duration: 800,
        });
      }
    }
  }, [selectedCourtId, courts]);

  // Calculate avatar positions around courts
  const avatarPositions = checkIns.map((checkIn) => {
    const court = courts.find((c) => c.id === checkIn.court_id);
    if (!court) return null;

    const courtCheckIns = checkIns.filter((c) => c.court_id === checkIn.court_id);
    const positionIndex = courtCheckIns.findIndex((c) => c.id === checkIn.id);
    const angleStep = (2 * Math.PI) / Math.max(courtCheckIns.length, 1);
    const angle = positionIndex * angleStep;
    const radius = 0.0008;

    return {
      checkIn,
      position: {
        lat: court.lat + Math.cos(angle) * radius,
        lng: court.lng + Math.sin(angle) * radius,
      },
    };
  }).filter(Boolean);

  const colors = ["#FF6B00", "#10B981", "#6366F1", "#EC4899", "#F59E0B"];

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      onClick={() => setPopupInfo(null)}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl
        position="top-right"
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
        showUserHeading
      />

      {/* Court markers */}
      {courts.map((court) => (
        <CourtMarker
          key={court.id}
          court={court}
          isSelected={court.id === selectedCourtId}
          onClick={() => {
            setPopupInfo(court);
            onCourtSelect?.(court);
          }}
        />
      ))}

      {/* Avatar markers for checked-in users */}
      {avatarPositions.map((item, index) => {
        if (!item) return null;
        return (
          <AvatarMarker
            key={item.checkIn.id}
            checkIn={item.checkIn}
            position={item.position}
            color={colors[index % colors.length]}
            onClick={() => onAvatarClick?.(item.checkIn.court_id)}
          />
        );
      })}

      {/* Popup for court info */}
      {popupInfo && (
        <Popup
          longitude={popupInfo.lng}
          latitude={popupInfo.lat}
          anchor="bottom"
          onClose={() => setPopupInfo(null)}
          closeButton={true}
          closeOnClick={false}
          className="court-popup"
        >
          <div className="p-2">
            <h3 className="font-semibold text-sm mb-1">{popupInfo.name}</h3>
            <p className="text-xs text-muted-foreground mb-1">{popupInfo.address}</p>
            {popupInfo.playersNow && popupInfo.playersNow > 0 && (
              <p className="text-xs text-green-600 font-medium">
                🏀 {popupInfo.playersNow} playing now
              </p>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
}
