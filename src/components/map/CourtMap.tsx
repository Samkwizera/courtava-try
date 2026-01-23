import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
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

// Component to handle map centering
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

export function CourtMap({ 
  courts, 
  onCourtSelect, 
  center = [-1.9403, 29.8739], // Kigali, Rwanda coordinates
  zoom = 13 
}: CourtMapProps) {
  return (
    <MapContainer
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
    </MapContainer>
  );
}
