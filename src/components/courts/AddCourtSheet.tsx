import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useCourts, CourtInsert } from "@/hooks/useCourts";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface AddCourtSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function LocationPicker({
  lat,
  lng,
  onLocationChange,
}: {
  lat: string;
  lng: string;
  onLocationChange: (lat: string, lng: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const updateMarker = useCallback(
    (lngLat: { lng: number; lat: number }) => {
      if (!mapRef.current) return;

      if (markerRef.current) {
        markerRef.current.setLngLat([lngLat.lng, lngLat.lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: "#22c55e", draggable: true })
          .setLngLat([lngLat.lng, lngLat.lat])
          .addTo(mapRef.current);

        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLngLat();
          onLocationChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });
      }
    },
    [onLocationChange]
  );

  useEffect(() => {
    if (!containerRef.current || !mapboxgl.accessToken) return;

    const initialLat = lat ? parseFloat(lat) : -1.9403;
    const initialLng = lng ? parseFloat(lng) : 30.0588;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLng, initialLat],
      zoom: 14,
    });

    mapRef.current = map;

    map.on("load", () => {
      // If we already have coordinates, place the marker
      if (lat && lng) {
        updateMarker({ lat: parseFloat(lat), lng: parseFloat(lng) });
      }
    });

    // Click to drop pin
    map.on("click", (e) => {
      updateMarker(e.lngLat);
      onLocationChange(e.lngLat.lat.toFixed(6), e.lngLat.lng.toFixed(6));
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []); // Init once

  // Sync marker if lat/lng change externally (e.g. "Use Current" button)
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) return;

    updateMarker({ lat: parsedLat, lng: parsedLng });
    mapRef.current.flyTo({ center: [parsedLng, parsedLat], zoom: 15, duration: 600 });
  }, [lat, lng, updateMarker]);

  if (!mapboxgl.accessToken) {
    return (
      <div className="w-full h-[200px] rounded-lg bg-muted flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Map not available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[200px] rounded-lg overflow-hidden border border-border">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 pointer-events-none">
        <p className="text-[10px] text-muted-foreground font-medium">
          Tap the map to drop a pin
        </p>
      </div>
    </div>
  );
}

export function AddCourtSheet({ open, onOpenChange }: AddCourtSheetProps) {
  const { user } = useAuth();
  const { addCourt, isAdding } = useCourts();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [surface, setSurface] = useState("outdoor");
  const [lights, setLights] = useState(false);
  const [water, setWater] = useState(false);
  const [parking, setParking] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const resetForm = () => {
    setName("");
    setAddress("");
    setLat("");
    setLng("");
    setSurface("outdoor");
    setLights(false);
    setWater(false);
    setParking(false);
    setShowMap(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!name.trim() || !address.trim() || !lat || !lng) return;

    const court: CourtInsert = {
      name: name.trim(),
      address: address.trim(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      surface,
      lights,
      water,
      parking,
      created_by: user.id,
    };

    try {
      await addCourt(court);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const isValid =
    name.trim() &&
    address.trim() &&
    lat &&
    lng &&
    !isNaN(parseFloat(lat)) &&
    !isNaN(parseFloat(lng));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>Add New Court</SheetTitle>
          <SheetDescription>
            Share a basketball court with the community
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto max-h-[calc(85vh-120px)] pb-4"
        >
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="court-name">Court Name *</Label>
            <Input
              id="court-name"
              placeholder="e.g., Downtown Community Court"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="court-address">Address *</Label>
            <Input
              id="court-address"
              placeholder="e.g., 123 Main Street, Kigali"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Location *</Label>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant={showMap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  {showMap ? "Hide Map" : "Drop Pin"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 mr-1" />
                  )}
                  GPS
                </Button>
              </div>
            </div>

            {/* Drop pin map */}
            {showMap && (
              <LocationPicker
                lat={lat}
                lng={lng}
                onLocationChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            )}

            {/* Coordinate inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  placeholder="Latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  type="number"
                  step="any"
                />
              </div>
              <div>
                <Input
                  placeholder="Longitude"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  type="number"
                  step="any"
                />
              </div>
            </div>
            {lat && lng && (
              <p className="text-xs text-muted-foreground">
                {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
              </p>
            )}
          </div>

          {/* Surface Type */}
          <div className="space-y-2">
            <Label>Surface Type</Label>
            <Select value={surface} onValueChange={setSurface}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outdoor">Outdoor</SelectItem>
                <SelectItem value="indoor">Indoor</SelectItem>
                <SelectItem value="cement">Cement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Lights</span>
                <Switch checked={lights} onCheckedChange={setLights} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Water Fountain</span>
                <Switch checked={water} onCheckedChange={setWater} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Parking</span>
                <Switch checked={parking} onCheckedChange={setParking} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={!isValid || isAdding}>
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Court...
              </>
            ) : (
              "Add Court"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
