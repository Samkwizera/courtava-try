import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useCourts, CourtInsert } from "@/hooks/useCourts";

interface AddCourtSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

  const resetForm = () => {
    setName("");
    setAddress("");
    setLat("");
    setLng("");
    setSurface("outdoor");
    setLights(false);
    setWater(false);
    setParking(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    
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

  const isValid = name.trim() && address.trim() && lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>Add New Court</SheetTitle>
          <SheetDescription>
            Share a basketball court with the community
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[calc(85vh-120px)] pb-4">
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
              <Label>Location Coordinates *</Label>
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
                  <MapPin className="w-4 h-4 mr-1" />
                )}
                Use Current
              </Button>
            </div>
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
                <span className="text-sm">💡 Lights</span>
                <Switch checked={lights} onCheckedChange={setLights} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">💧 Water Fountain</span>
                <Switch checked={water} onCheckedChange={setWater} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">🅿️ Parking</span>
                <Switch checked={parking} onCheckedChange={setParking} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isAdding}
          >
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
