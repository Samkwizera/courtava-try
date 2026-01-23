import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameCardProps {
  title: string;
  courtName: string;
  date: string;
  time: string;
  format: "3v3" | "5v5";
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Competitive";
  currentPlayers: number;
  maxPlayers: number;
  hostName: string;
  hostAvatar?: string;
  onJoin?: () => void;
  onClick?: () => void;
}

const skillColors = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
  Competitive: "bg-red-100 text-red-700",
};

export function GameCard({
  title,
  courtName,
  date,
  time,
  format,
  skillLevel,
  currentPlayers,
  maxPlayers,
  hostName,
  hostAvatar,
  onJoin,
  onClick,
}: GameCardProps) {
  const spotsLeft = maxPlayers - currentPlayers;
  const isFull = spotsLeft <= 0;
  const isAlmostFull = spotsLeft <= 2 && !isFull;

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl shadow-card p-4 border border-border transition-all duration-200 hover:shadow-lg cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{courtName}</span>
          </div>
        </div>
        <Badge className={cn("shrink-0", skillColors[skillLevel])}>
          {skillLevel}
        </Badge>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium">{date}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-medium">{time}</span>
        </div>
      </div>

      {/* Spots indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="position">{format}</Badge>
            <span className="text-sm text-muted-foreground">
              {currentPlayers}/{maxPlayers} players
            </span>
          </div>
          {isAlmostFull && (
            <span className="text-xs text-court-orange font-medium">
              {spotsLeft} spot{spotsLeft > 1 ? "s" : ""} left!
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              isFull
                ? "bg-muted-foreground"
                : isAlmostFull
                ? "bg-court-orange"
                : "bg-primary"
            )}
            style={{ width: `${(currentPlayers / maxPlayers) * 100}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {hostAvatar ? (
              <img src={hostAvatar} alt={hostName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-secondary-foreground">
                {hostName.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            Hosted by <span className="font-medium text-foreground">{hostName}</span>
          </span>
        </div>
        <Button
          size="sm"
          variant={isFull ? "secondary" : "default"}
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          disabled={isFull}
        >
          {isFull ? "Full" : "Join"}
        </Button>
      </div>
    </div>
  );
}
