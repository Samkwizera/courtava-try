import { MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courts } from "@/data/courts";

interface CommunityCardProps {
  id: string;
  name: string;
  description: string | null;
  courtId: string | null;
  schedule: string | null;
  memberCount: number;
  isMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

export function CommunityCard({
  name,
  description,
  courtId,
  schedule,
  memberCount,
  isMember,
  onJoin,
  onLeave,
}: CommunityCardProps) {
  const court = courtId ? courts.find((c) => c.id === courtId) : null;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {memberCount}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        {court && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 text-primary" />
            <span className="truncate">{court.name}</span>
          </div>
        )}
        {schedule && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0 text-primary" />
            <span>{schedule}</span>
          </div>
        )}
      </div>

      {isMember ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onLeave}
        >
          Leave
        </Button>
      ) : (
        <Button size="sm" className="w-full" onClick={onJoin}>
          Join
        </Button>
      )}
    </div>
  );
}
