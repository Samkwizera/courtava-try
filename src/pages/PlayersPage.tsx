import { Search, MapPin, Plus, UserSearch, Users2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { CommunityCard } from "@/components/cards/CommunityCard";
import { CreateCommunitySheet } from "@/components/communities/CreateCommunitySheet";
import { useCommunities } from "@/hooks/useCommunities";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

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
  const [search, setSearch] = useState("");
  const [connectedPlayers, setConnectedPlayers] = useState(() => new Set(players.filter((player) => player.isConnected).map((player) => player.name)));
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

  const visiblePlayers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return players.filter((player) => {
      const matchesSkill = activeFilter === "All" || player.skillLevel === activeFilter;
      const matchesSearch = !query || [player.name, player.location, player.position, ...player.playStyles]
        .some((value) => value.toLowerCase().includes(query));
      return matchesSkill && matchesSearch;
    });
  }, [activeFilter, search]);

  const visibleCommunities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return communities;
    return communities.filter((community) => [community.name, community.description || ""]
      .some((value) => value.toLowerCase().includes(query)));
  }, [communities, search]);

  const connectPlayer = (name: string) => {
    setConnectedPlayers((current) => new Set(current).add(name));
    toast({ title: "Connected", description: `${name} is now in your player network.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Players">
        <>
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeTab === "players"
                    ? "Search players..."
                    : "Search communities..."
                }
                className="w-full h-11 pl-9 pr-10 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {search && <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Clear search"><X className="h-4 w-4" /></button>}
            </div>
          </div>

          {/* Filter chips - only show for players tab */}
          {activeTab === "players" && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {skillFilters.map((filter) => (
                <Chip
                  key={filter}
                  selected={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Chip>
              ))}
            </div>
          )}
        </>
      </PageHeader>

      {/* Content */}
      <div className="p-4">
        {activeTab === "players" ? (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{visiblePlayers.length} {visiblePlayers.length === 1 ? "player" : "players"} near you</span>
            </div>
            {visiblePlayers.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><UserSearch className="h-6 w-6" /></div>
                <div className="font-semibold">No matching players</div>
                <div className="mt-1 text-sm text-muted-foreground">Try another name, style, or skill level.</div>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => { setSearch(""); setActiveFilter("All"); }}>Reset search</Button>
              </div>
            ) : <StaggerGroup className="grid gap-3 sm:grid-cols-2">
              {visiblePlayers.map((player) => (
                <StaggerItem key={player.name}>
                  <PlayerCard
                    {...player}
                    isConnected={connectedPlayers.has(player.name)}
                    onConnect={() => connectPlayer(player.name)}
                    onMessage={() => toast({ title: "Messages coming soon", description: `${player.name} is already in your network.` })}
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users2 className="w-4 h-4" />
                <span>
                  {communitiesLoading
                    ? "Loading..."
                    : `${visibleCommunities.length} communities`}
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
            ) : visibleCommunities.length === 0 ? (
              <div className="text-center py-12">
                <Users2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">
                  {search ? "No communities match your search." : "No communities yet. Be the first to create one!"}
                </p>
                <Button onClick={search ? () => setSearch("") : handleCreateClick}>
                  {search ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  {search ? "Clear search" : "Create Community"}
                </Button>
              </div>
            ) : (
              <StaggerGroup className="grid gap-4 sm:grid-cols-2">
                {visibleCommunities.map((community) => (
                  <StaggerItem key={community.id}>
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
                  </StaggerItem>
                ))}
              </StaggerGroup>
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
