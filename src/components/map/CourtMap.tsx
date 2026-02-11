import { CheckIn } from "@/hooks/useCheckIns";

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
  center,
  zoom,
  checkIns = [],
  onAvatarClick,
  selectedCourtId,
}: CourtMapProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
      <p className="text-muted-foreground text-sm">Map provider not configured</p>
    </div>
  );
}
