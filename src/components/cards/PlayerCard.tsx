import { MapPin, MessageCircle, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  name: string;
  avatar?: string;
  location: string;
  position: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Competitive";
  playStyles: string[];
  gamesPlayed?: number;
  mutualConnections?: number;
  isConnected?: boolean;
  onConnect?: () => void;
  onMessage?: () => void;
  onClick?: () => void;
}

const skillColors = {
  Beginner: "skill",
  Intermediate: "skill",
  Advanced: "skill",
  Competitive: "skill",
} as const;

export function PlayerCard({
  name,
  avatar,
  location,
  position,
  skillLevel,
  playStyles,
  gamesPlayed,
  mutualConnections,
  isConnected,
  onConnect,
  onMessage,
  onClick,
}: PlayerCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-lg p-4 border border-border transition-colors hover:border-foreground/20 hover:bg-muted/30 cursor-pointer"
    >
      {/* Header with avatar */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-secondary-foreground">
              {name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="position">{position}</Badge>
            <Badge variant={skillColors[skillLevel]}>{skillLevel}</Badge>
          </div>
        </div>
      </div>

      {/* Play styles */}
      <div className="flex flex-wrap gap-1.5 mb-3 min-h-6">
        {playStyles.slice(0, 3).map((style) => (
          <Badge key={style} variant="muted" className="text-xs">
            {style}
          </Badge>
        ))}
        {playStyles.length > 3 && (
          <Badge variant="muted" className="text-xs">
            +{playStyles.length - 3}
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground mb-3">
        {gamesPlayed !== undefined && (
          <span>
            <span className="font-semibold text-foreground">{gamesPlayed}</span> games
          </span>
        )}
        {mutualConnections !== undefined && mutualConnections > 0 && (
          <span>
            <span className="font-semibold text-foreground">{mutualConnections}</span> mutual
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isConnected ? (
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.();
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onConnect?.();
            }}
          >
            <UserPlus className="w-4 h-4" />
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
