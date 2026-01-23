import { MapPin, Star, Users, Sun, Droplets, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CourtCardProps {
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviewCount: number;
  playersNow?: number;
  surface: "outdoor" | "indoor" | "cement";
  amenities: {
    lights?: boolean;
    water?: boolean;
    parking?: boolean;
  };
  imageUrl?: string;
  onClick?: () => void;
}

export function CourtCard({
  name,
  address,
  distance,
  rating,
  reviewCount,
  playersNow,
  surface,
  amenities,
  imageUrl,
  onClick,
}: CourtCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-2xl shadow-card overflow-hidden transition-all duration-200 hover:shadow-lg active:scale-[0.99] border border-border"
    >
      {/* Court Image */}
      <div className="relative h-32 bg-gradient-to-br from-court-green-light to-secondary">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-12 rounded-md bg-court-surface border-2 border-court-green/30 relative">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-court-green/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-court-green/40" />
              </div>
            </div>
          </div>
        )}

        {/* Live players indicator */}
        {playersNow && playersNow > 0 && (
          <div className="absolute top-3 right-3">
            <Badge variant="live" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {playersNow} playing
            </Badge>
          </div>
        )}

        {/* Surface type */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="capitalize">
            {surface}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-court-orange text-court-orange" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({reviewCount})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="line-clamp-1">{address}</span>
          <span className="shrink-0">• {distance}</span>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-2">
          {amenities.lights && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sun className="w-3.5 h-3.5" />
              <span>Lights</span>
            </div>
          )}
          {amenities.water && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Droplets className="w-3.5 h-3.5" />
              <span>Water</span>
            </div>
          )}
          {amenities.parking && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Car className="w-3.5 h-3.5" />
              <span>Parking</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
