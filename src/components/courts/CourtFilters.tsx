import { X, Sun, Droplets, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

export interface CourtFiltersState {
  surfaces: ("indoor" | "outdoor" | "cement")[];
  amenities: {
    lights: boolean;
    water: boolean;
    parking: boolean;
  };
  sortBy: "distance" | "rating";
}

interface CourtFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CourtFiltersState;
  onFiltersChange: (filters: CourtFiltersState) => void;
}

const surfaceOptions = [
  { value: "indoor" as const, label: "Indoor" },
  { value: "outdoor" as const, label: "Outdoor" },
  { value: "cement" as const, label: "Cement" },
];

const amenityOptions = [
  { key: "lights" as const, label: "Lights", icon: Sun },
  { key: "water" as const, label: "Water", icon: Droplets },
  { key: "parking" as const, label: "Parking", icon: Car },
];

export function CourtFilters({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: CourtFiltersProps) {
  const handleSurfaceToggle = (surface: "indoor" | "outdoor" | "cement") => {
    const newSurfaces = filters.surfaces.includes(surface)
      ? filters.surfaces.filter((s) => s !== surface)
      : [...filters.surfaces, surface];
    onFiltersChange({ ...filters, surfaces: newSurfaces });
  };

  const handleAmenityToggle = (key: "lights" | "water" | "parking") => {
    onFiltersChange({
      ...filters,
      amenities: { ...filters.amenities, [key]: !filters.amenities[key] },
    });
  };

  const handleSortChange = (sortBy: "distance" | "rating") => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleReset = () => {
    onFiltersChange({
      surfaces: [],
      amenities: { lights: false, water: false, parking: false },
      sortBy: "distance",
    });
  };

  const activeFilterCount =
    filters.surfaces.length +
    Object.values(filters.amenities).filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Filter Courts</SheetTitle>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset all
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Surface Type */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Surface Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {surfaceOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    filters.surfaces.includes(option.value)
                      ? "default"
                      : "secondary"
                  }
                  size="sm"
                  onClick={() => handleSurfaceToggle(option.value)}
                  className="capitalize"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Amenities
            </h3>
            <div className="space-y-3">
              {amenityOptions.map((option) => (
                <div key={option.key} className="flex items-center space-x-3">
                  <Checkbox
                    id={option.key}
                    checked={filters.amenities[option.key]}
                    onCheckedChange={() => handleAmenityToggle(option.key)}
                  />
                  <Label
                    htmlFor={option.key}
                    className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                  >
                    <option.icon className="w-4 h-4 text-muted-foreground" />
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Sort By
            </h3>
            <div className="flex gap-2">
              <Button
                variant={filters.sortBy === "distance" ? "default" : "secondary"}
                size="sm"
                onClick={() => handleSortChange("distance")}
              >
                Nearest
              </Button>
              <Button
                variant={filters.sortBy === "rating" ? "default" : "secondary"}
                size="sm"
                onClick={() => handleSortChange("rating")}
              >
                Top Rated
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Show Results
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
