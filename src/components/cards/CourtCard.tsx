import { Car, ChevronRight, Droplets, MapPin, Star, Sun, Users } from "lucide-react";
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
  variant?: "card" | "compact";
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
  variant = "card",
  onClick,
}: CourtCardProps) {
  const amenityItems = [
    amenities.lights ? { icon: Sun, label: "Lights" } : null,
    amenities.water ? { icon: Droplets, label: "Water" } : null,
    amenities.parking ? { icon: Car, label: "Parking" } : null,
  ].filter(Boolean) as { icon: typeof Sun; label: string }[];

  if (variant === "compact") {
    return (
      <button
        onClick={onClick}
        className="w-full text-left bg-card rounded-xl px-3.5 py-3 ios-card-tap"
        style={{ border: "0.5px solid hsl(var(--border))" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" strokeWidth={2.25} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-foreground text-[15px] truncate">
                {name}
              </h3>
              <Badge variant="secondary" className="capitalize shrink-0 px-1.5 py-0 text-[10px]">
                {surface}
              </Badge>
            </div>

            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground min-w-0">
              <span className="truncate">{address}</span>
              <span className="shrink-0">&middot; {distance}</span>
            </div>

            <div className="mt-2 flex items-center gap-2.5 text-[11px] text-muted-foreground">
              {playersNow && playersNow > 0 ? (
                <span className="flex items-center gap-1 text-orange-600 font-medium">
                  <Users className="w-3.5 h-3.5" />
                  {playersNow} playing
                </span>
              ) : null}
              {reviewCount > 0 ? (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {rating.toFixed(1)}
                </span>
              ) : null}
              {amenityItems.slice(0, 2).map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-2xl overflow-hidden ios-card-tap"
      style={{ border: "0.5px solid hsl(var(--border))", boxShadow: "var(--shadow-card)" }}
    >
      {/* Court Image */}
      <div className="relative h-32 bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-12 rounded-md bg-muted-foreground/10 border border-muted-foreground/20 relative">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-muted-foreground/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
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
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({reviewCount})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="line-clamp-1">{address}</span>
          <span className="shrink-0">&middot; {distance}</span>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-2">
          {amenityItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
