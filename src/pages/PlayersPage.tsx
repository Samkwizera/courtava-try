import { Search, Filter, MapPin, Plus, Users2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { CommunityCard } from "@/components/cards/CommunityCard";
import { CreateCommunitySheet } from "@/components/communities/CreateCommunitySheet";
import { useCommunities } from "@/hooks/useCommunities";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Reveal } from "@/components/Reveal";

const players = [
  {
    name: "Marcus Johnson",
    location: "Downtown",
    position: "PG",
    skillLevel: "Advanced" as const,
    playStyles: ["Playmaker", "Shooter", "Defender"],
    gamesPlayed: 45,
    mutualConnections: 3,
  },
  {
    name: "Sarah Kim",
    location: "Riverside",
    position: "SG",
    skillLevel: "Intermediate" as const,
    playStyles: ["Shooter", "Hustler"],
    gamesPlayed: 28,
    mutualConnections: 1,
  },
  {
    name: "James Davis",
    location: "Central",
    position: "SF",
    skillLevel: "Competitive" as const,
    playStyles: ["Defender", "Rebounder", "Hustler"],
    gamesPlayed: 89,
    mutualConnections: 5,
    isConnected: true,
  },
  {
    name: "Mike Thompson",
    location: "Eastside",
    position: "PF",
    skillLevel: "Intermediate" as const,
    playStyles: ["Rebounder", "Defender"],
    gamesPlayed: 34,
    mutualConnections: 0,
  },
  {
    name: "Alex Chen",
    location: "Downtown",
    position: "C",
    skillLevel: "Beginner" as const,
    playStyles: ["Rebounder", "Hustler"],
    gamesPlayed: 12,
    mutualConnections: 2,
  },
];

const skillFilters = ["All", "Beginner", "Intermediate", "Advanced", "Competitive"];

type Tab = "players" | "communities";

export default function PlayersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("players");
  const [activeFilter, setActiveFilter] = useState("All");
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  const handleCreateClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a community.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setCreateSheetOpen(true);
  };

  const {
    communities,
    isLoading: communitiesLoading,
    createCommunity,
    joinCommunity,
    leaveCommunity,
  } = useCommunities();

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-1.5 mb-2">
            <img src="/courtava-icon.png" alt="" width={14} height={14} className="rounded-[3px]" />
            <span
              className="font-wordmark uppercase text-primary"
              style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em" }}
            >
              Courtava
            </span>
          </div>
          {/* Tab Toggle */}
          <div className="flex gap-2 mb-3">
            <Button
              variant={activeTab === "players" ? "default" : "secondary"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab("players")}
            >
              Find Players
            </Button>
            <Button
              variant={activeTab === "communities" ? "default" : "secondary"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab("communities")}
            >
              <Users2 className="w-4 h-4 mr-1" />
              Communities
            </Button>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={
                  activeTab === "players"
                    ? "Search players..."
                    : "Search communities..."
                }
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <Button variant="secondary" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter chips - only show for players tab */}
          {activeTab === "players" && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {skillFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                    activeFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {activeTab === "players" ? (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{players.length} players near you</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {players.map((player, i) => (
                <Reveal key={i} index={i}>
                  <PlayerCard
                    {...player}
                    onConnect={() => console.log("Connect")}
                    onMessage={() => console.log("Message")}
                  />
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users2 className="w-4 h-4" />
                <span>
                  {communitiesLoading
                    ? "Loading..."
                    : `${communities.length} communities`}
                </span>
              </div>
              <Button size="sm" onClick={handleCreateClick}>
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            </div>

            {communitiesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading communities...
              </div>
            ) : communities.length === 0 ? (
              <div className="text-center py-12">
                <Users2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">
                  No communities yet. Be the first to create one!
                </p>
                <Button onClick={handleCreateClick}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Community
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {communities.map((community, i) => (
                  <Reveal key={community.id} index={i}>
                    <CommunityCard
                      id={community.id}
                      name={community.name}
                      description={community.description}
                      courtId={community.court_id}
                      schedule={community.schedule}
                      memberCount={community.member_count}
                      isMember={community.is_member}
                      onJoin={() => joinCommunity(community.id)}
                      onLeave={() => leaveCommunity(community.id)}
                    />
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Community Sheet */}
      <CreateCommunitySheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onSubmit={createCommunity}
      />
    </div>
  );
}
