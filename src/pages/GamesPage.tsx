import { type ReactNode, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { type DbGame, useGames } from "@/hooks/useGames";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useCourts } from "@/hooks/useCourts";
import { useAuth } from "@/hooks/useAuth";
import { CalendarDays, ChevronLeft, CircleDot, Clock3, Flame, MapPin, Megaphone, Plus, Radio, Share2, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { C } from "@/lib/tokens";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/layout/PageHeader";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

async function shareGame(game: { title: string; court_name: string; date: string; time: string; format: string; max_players: number }) {
  const text = `Join my game: ${game.title} at ${game.court_name} - ${game.date} ${game.time ? formatTime(game.time) : ""} / ${game.format} / ${game.max_players} players`;
  const url = window.location.origin + "/games";
  if (navigator.share) {
    try {
      await navigator.share({ title: game.title, text, url });
    } catch {
      // user cancelled
    }
  } else {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast("Copied to clipboard", { description: "Share the link with your friends." });
  }
}


const font = `"Inter", -apple-system, system-ui, sans-serif`;

function formatGameTime(date: string, time: string) {
  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;
  if (isToday) return `Today - ${time ? formatTime(time) : ""}`;
  return `${date} - ${time ? formatTime(time) : ""}`;
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function isToday(date: string) {
  return date === new Date().toISOString().split("T")[0];
}

function EmptyStateIcon({ children, tint = C.hair2 }: { children: ReactNode; tint?: string }) {
  return (
    <div style={{
      width: 56,
      height: 56,
      borderRadius: 18,
      margin: "0 auto 14px",
      background: tint,
      color: C.ink2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {children}
    </div>
  );
}

export default function GamesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const courtFilterId = searchParams.get("court");
  const [tab, setTab] = useState("live");
  const [selectedGame, setSelectedGame] = useState<DbGame | null>(null);
  const { games, isLoading, myParticipantGameIds, joinGame, leaveGame } = useGames();
  const { checkIns } = useCheckIns();
  const { dbCourts } = useCourts();
  const { user } = useAuth();

  const handleJoin = (gameId: string) => {
    if (!user) { navigate("/auth"); return; }
    joinGame(gameId);
  };

  const selectedCourt = selectedGame?.court_id
    ? dbCourts.find((court) => court.id === selectedGame.court_id)
    : undefined;

  const gameDetails = (
    <GameDetailsSheet
      game={selectedGame}
      court={selectedCourt}
      open={Boolean(selectedGame)}
      isJoined={selectedGame ? myParticipantGameIds.includes(selectedGame.id) : false}
      isHost={selectedGame ? user?.id === selectedGame.host_id : false}
      onOpenChange={(open) => { if (!open) setSelectedGame(null); }}
      onJoin={() => selectedGame && handleJoin(selectedGame.id)}
      onLeave={() => selectedGame && leaveGame(selectedGame.id)}
      onCourt={() => {
        if (!selectedGame?.court_id) return;
        setSelectedGame(null);
        navigate(`/courts/${selectedGame.court_id}`);
      }}
    />
  );

  if (courtFilterId) {
    const filterCourt = dbCourts.find((c) => c.id === courtFilterId);
    const todayStr = new Date().toISOString().split("T")[0];
    const courtGames = games
      .filter((g) => g.court_id === courtFilterId && g.date >= todayStr)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    return (
      <div style={{ width: "100%", minHeight: "100vh", background: C.bg, fontFamily: font, color: C.ink, overflowY: "auto", paddingBottom: 120 }}>
        <div style={{ padding: "70px 22px 8px" }}>
          <button
            onClick={() => setSearchParams({})}
            style={{
              display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
              cursor: "pointer", padding: 0, color: C.ink2, fontSize: 13, fontWeight: 500, fontFamily: font,
            }}
          >
            <ChevronLeft size={16} /> All activity
          </button>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, marginTop: 8 }}>
            Games at {filterCourt?.name || "this court"}
          </div>
          <div style={{ fontSize: 13, color: C.ink3, marginTop: 4 }}>
            {isLoading ? "Loading..." : `${courtGames.length} upcoming ${courtGames.length === 1 ? "game" : "games"}`}
          </div>
        </div>

        <div style={{ padding: "14px 14px 0" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: C.ink3 }}>Loading...</div>
          ) : courtGames.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <EmptyStateIcon tint={C.greenSoft}>
                <CalendarDays size={24} strokeWidth={1.9} />
              </EmptyStateIcon>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No games scheduled yet</div>
              <div style={{ fontSize: 13, color: C.ink3, marginBottom: 20 }}>Be the first to host a game at this court</div>
              <button onClick={() => navigate("/create-game", { state: { courtId: courtFilterId, mode: "host" } })} style={{
                background: C.ink, color: C.onInk, border: "none",
                padding: "12px 24px", borderRadius: 99, fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: font,
              }}>Host a game</button>
            </div>
          ) : (
            <StaggerGroup style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {courtGames.map((game) => (
                <StaggerItem key={game.id}>
                  <GameListRow
                    game={game}
                    isJoined={myParticipantGameIds.includes(game.id)}
                    isHost={user?.id === game.host_id}
                    onOpen={() => setSelectedGame(game)}
                    onJoin={() => handleJoin(game.id)}
                    onLeave={() => leaveGame(game.id)}
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
        {gameDetails}
      </div>
    );
  }

  // Courts with heat from check-ins
  const courtsWithHeat = dbCourts.map((c) => ({
    ...c,
    liveCount: checkIns.filter((ci) => ci.court_id === c.id).length,
  })).filter((c) => c.liveCount > 0);

  const hotCourts = courtsWithHeat.filter((c) => c.liveCount >= 6);
  const liveCourts = courtsWithHeat;

  // Games split into today vs upcoming
  const todayGames = games.filter((g) => isToday(g.date));
  const upcomingGames = games.filter((g) => !isToday(g.date));

  // Check-ins by others
  const otherCheckIns = checkIns.filter((ci) => ci.user_id !== user?.id);

  // Recently added courts (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const newCourts = dbCourts.filter((c) => c.created_at > sevenDaysAgo);

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: C.bg, fontFamily: font, color: C.ink, overflowY: "auto", paddingBottom: 120 }}>

      <PageHeader
        sticky={false}
        eyebrow="Activity"
        title="What's happening"
        actions={
          <IconButton label="Create game" variant="solid" size={36} onClick={() => navigate("/create-game")}>
            <Plus size={16} strokeWidth={2.5} />
          </IconButton>
        }
      />

      {/* Segment tabs */}
      <div style={{ padding: "10px 22px 4px", display: "flex", gap: 6 }}>
        {[
          { k: "live", label: "Live", dot: true },
          { k: "invites", label: "Games", badge: todayGames.length > 0 ? todayGames.length : undefined },
          { k: "friends", label: "Activity" },
        ].map((s) => (
          <Chip
            key={s.k}
            selected={tab === s.k}
            onClick={() => setTab(s.k)}
            count={s.badge}
            icon={
              s.dot && tab === s.k ? (
                <div
                  className="pulse-dot"
                  style={{ width: 6, height: 6, borderRadius: 99, background: C.green }}
                />
              ) : undefined
            }
          >
            {s.label}
          </Chip>
        ))}
      </div>

      {/* LIVE TAB */}
      {tab === "live" && (
        <>
          {/* Live courts banner */}
          <ScrollReveal>
          <div style={{ padding: "14px 14px 0" }}>
            <div style={{
              background: C.surface, borderRadius: 16, padding: 16,
              border: `1px solid ${C.hair}`,
              display: "flex", gap: 14, alignItems: "center",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, background: C.greenSoft,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                flexShrink: 0,
              }}>
                <Radio size={22} color={C.green} strokeWidth={1.9} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {liveCourts.length > 0
                    ? `${liveCourts.length} court${liveCourts.length > 1 ? "s" : ""} active near you`
                    : "No active courts right now"}
                </div>
                <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>
                  {liveCourts.length > 0
                    ? liveCourts.slice(0, 3).map((c) => c.name).join(" / ")
                    : "Check back later or be the first to check in"}
                </div>
              </div>
              <button onClick={() => navigate("/courts")} style={{
                fontSize: 12, fontWeight: 600, color: C.onInk, background: C.ink,
                border: "none", padding: "8px 14px", borderRadius: 99, cursor: "pointer",
                flexShrink: 0, fontFamily: font,
              }}>Open map</button>
            </div>
          </div>
          </ScrollReveal>

          {/* NOW section */}
          <div style={{ padding: "12px 14px 0" }}>
            {/* Hot courts */}
            {hotCourts.length > 0 && (
              <ScrollReveal>
                <div style={{ padding: "10px 8px 6px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>
                  NOW
                </div>
                <StaggerGroup style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {hotCourts.map((court) => (
                    <StaggerItem key={`heat-${court.id}`}>
                      <FeedRow
                        icon={<Flame size={17} fill="currentColor" strokeWidth={0} />}
                        tint={C.greenSoft}
                        title={`${court.name} is heating up`}
                        sub={`${court.liveCount} players just checked in`}
                        action="View"
                        onAction={() => navigate(`/courts/${court.id}`)}
                        onClick={() => navigate(`/courts/${court.id}`)}
                      />
                    </StaggerItem>
                  ))}
                  {todayGames.map((game) => {
                    const spots = game.max_players - game.current_players;
                    const goToGame = () => navigate(game.court_id ? `/games?court=${game.court_id}` : "/games");
                    return (
                      <StaggerItem key={`game-${game.id}`}>
                        <FeedRow
                          icon={<Megaphone size={17} strokeWidth={1.9} />}
                          tint={C.amberTint}
                          title={game.title}
                          sub={`${game.court_name} / ${formatTime(game.time)} / ${game.current_players}/${game.max_players} players`}
                          action={spots > 0 ? "Join" : "Full"}
                          onAction={goToGame}
                          onClick={goToGame}
                          onShare={() => shareGame(game)}
                        />
                      </StaggerItem>
                    );
                  })}
                </StaggerGroup>
              </ScrollReveal>
            )}

            {/* Other check-ins */}
            {otherCheckIns.length > 0 && (
              <ScrollReveal>
                <div style={{ padding: "16px 8px 6px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>
                  CHECKED IN
                </div>
                <StaggerGroup style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {otherCheckIns.slice(0, 3).map((ci) => {
                    const court = dbCourts.find((c) => c.id === ci.court_id);
                    const name = (ci as { profile?: { display_name?: string } }).profile?.display_name || "Someone";
                    return (
                      <StaggerItem key={`ci-${ci.id}`}>
                        <FeedRow
                          icon={null}
                          tint={C.hair2}
                          title={`${name} checked into ${court?.name || "a court"}`}
                          sub="Just now"
                          onClick={() => court && navigate(`/courts/${court.id}`)}
                        />
                      </StaggerItem>
                    );
                  })}
                </StaggerGroup>
              </ScrollReveal>
            )}

            {/* Upcoming games */}
            {upcomingGames.length > 0 && (
              <ScrollReveal>
                <div style={{ padding: "16px 8px 6px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>
                  UPCOMING
                </div>
                <StaggerGroup style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {upcomingGames.slice(0, 3).map((game) => {
                    const spots = game.max_players - game.current_players;
                    const goToGame = () => navigate(game.court_id ? `/games?court=${game.court_id}` : "/games");
                    return (
                      <StaggerItem key={`upcoming-${game.id}`}>
                        <FeedRow
                          icon={<CalendarDays size={17} strokeWidth={1.9} />}
                          tint={C.hair2}
                          title={game.title}
                          sub={`${game.court_name} / ${formatGameTime(game.date, game.time)}`}
                          action={spots > 0 ? "Join" : "Full"}
                          onAction={goToGame}
                          onClick={goToGame}
                          onShare={() => shareGame(game)}
                        />
                      </StaggerItem>
                    );
                  })}
                </StaggerGroup>
              </ScrollReveal>
            )}

            {/* New courts */}
            {newCourts.length > 0 && (
              <ScrollReveal>
                <div style={{ padding: "16px 8px 6px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>
                  NEW COURTS
                </div>
                <StaggerGroup style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {newCourts.map((court) => (
                    <StaggerItem key={`new-${court.id}`}>
                      <FeedRow
                        icon={null}
                        tint={C.hair2}
                        title={`New court added: ${court.name}`}
                        sub={court.address || "Newly verified location"}
                        onClick={() => navigate(`/courts/${court.id}`)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </ScrollReveal>
            )}

            {/* Empty state */}
            {hotCourts.length === 0 && todayGames.length === 0 && otherCheckIns.length === 0 && upcomingGames.length === 0 && newCourts.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <EmptyStateIcon tint={C.greenSoft}>
                  <Radio size={24} strokeWidth={1.9} />
                </EmptyStateIcon>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No activity yet</div>
                <div style={{ fontSize: 13, color: C.ink3 }}>Check in at a court or host a game to get started</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* GAMES TAB */}
      {tab === "invites" && (
        <div style={{ padding: "14px 14px 0" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: C.ink3 }}>Loading...</div>
          ) : games.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <EmptyStateIcon tint={C.amberTint}>
                <Megaphone size={24} strokeWidth={1.9} />
              </EmptyStateIcon>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No games yet</div>
              <div style={{ fontSize: 13, color: C.ink3, marginBottom: 20 }}>Be the first to host a game in your area</div>
              <button onClick={() => navigate("/create-game")} style={{
                background: C.ink, color: C.onInk, border: "none",
                padding: "12px 24px", borderRadius: 99, fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: font,
              }}>Host a game</button>
            </div>
          ) : (
            <>
              {todayGames.length > 0 && (
                <ScrollReveal>
                  <div style={{ padding: "4px 8px 8px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>TODAY</div>
                  <StaggerGroup style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    {todayGames.map((game) => (
                      <StaggerItem key={game.id}>
                        <GameListRow
                          game={game}
                          isJoined={myParticipantGameIds.includes(game.id)}
                          isHost={user?.id === game.host_id}
                          onOpen={() => setSelectedGame(game)}
                          onJoin={() => handleJoin(game.id)}
                          onLeave={() => leaveGame(game.id)}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerGroup>
                </ScrollReveal>
              )}
              {upcomingGames.length > 0 && (
                <ScrollReveal>
                  <div style={{ padding: "4px 8px 8px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>UPCOMING</div>
                  <StaggerGroup style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {upcomingGames.map((game) => (
                      <StaggerItem key={game.id}>
                        <GameListRow
                          game={game}
                          isJoined={myParticipantGameIds.includes(game.id)}
                          isHost={user?.id === game.host_id}
                          onOpen={() => setSelectedGame(game)}
                          onJoin={() => handleJoin(game.id)}
                          onLeave={() => leaveGame(game.id)}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerGroup>
                </ScrollReveal>
              )}
            </>
          )}
        </div>
      )}

      {/* ACTIVITY TAB */}
      {tab === "friends" && (
        <div style={{ padding: "14px 14px 0" }}>
          {otherCheckIns.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <EmptyStateIcon>
                <Users size={24} strokeWidth={1.9} />
              </EmptyStateIcon>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No activity right now</div>
              <div style={{ fontSize: 13, color: C.ink3 }}>When others check in at courts you'll see it here</div>
            </div>
          )}
          {otherCheckIns.length > 0 && (
            <ScrollReveal>
              <div style={{ padding: "4px 8px 8px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>LIVE</div>
              <StaggerGroup style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {otherCheckIns.map((ci) => {
                  const court = dbCourts.find((c) => c.id === ci.court_id);
                  const name = (ci as { profile?: { display_name?: string } }).profile?.display_name || "Someone";
                  return (
                    <StaggerItem key={`act-${ci.id}`}>
                      <FeedRow
                        icon={null}
                        tint={C.hair2}
                        title={`${name} checked into ${court?.name || "a court"}`}
                        sub="Active now"
                        onClick={() => court && navigate(`/courts/${court.id}`)}
                      />
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>
            </ScrollReveal>
          )}
        </div>
      )}
      {gameDetails}
    </div>
  );
}

function FeedRow({
  icon,
  tint,
  title,
  sub,
  action,
  onAction,
  onClick,
  onShare,
}: {
  icon: ReactNode | null;
  tint: string;
  title: string;
  sub: string;
  action?: string;
  onAction?: () => void;
  onClick?: () => void;
  onShare?: () => void;
}) {
  return (
    <div onClick={onClick} style={{
      background: C.surface, borderRadius: 16, padding: 14,
      border: `1px solid ${C.hair}`, display: "flex", gap: 12, alignItems: "flex-start",
      cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: tint,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
        flexShrink: 0,
      }}>
        {icon ? (
          icon
        ) : (
          <CircleDot size={14} color={C.ink3} strokeWidth={1.9} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.ink3, marginTop: 3 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        {onShare && (
          <button onClick={(e) => { e.stopPropagation(); onShare(); }} style={{
            width: 30, height: 30, borderRadius: 99, border: `1px solid ${C.hair}`,
            background: C.surface, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Share2 size={13} strokeWidth={1.9} />
          </button>
        )}
        {action && (
          <button onClick={(e) => { e.stopPropagation(); onAction?.(); }} style={{
            fontSize: 11, fontWeight: 600, color: C.ink,
            background: C.hair2, border: "none", padding: "6px 12px", borderRadius: 99,
            cursor: "pointer", fontFamily: font,
          }}>{action}</button>
        )}
      </div>
    </div>
  );
}

function GameDetailsSheet({ game, court, open, isJoined, isHost, onOpenChange, onJoin, onLeave, onCourt }: {
  game: DbGame | null;
  court?: { photo_url: string | null; address: string };
  open: boolean;
  isJoined: boolean;
  isHost: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: () => void;
  onLeave: () => void;
  onCourt: () => void;
}) {
  if (!game) return null;
  const spots = Math.max(0, game.max_players - game.current_players);
  const isFull = spots === 0;
  const progress = Math.min(100, (game.current_players / game.max_players) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl border-x-0 px-0 pb-8 pt-0">
        <div className="relative h-44 overflow-hidden bg-secondary">
          {court?.photo_url ? <img src={court.photo_url} alt={game.court_name} className="h-full w-full object-cover" /> : (
            <div className="flex h-full items-center justify-center bg-emerald-50 text-emerald-700"><MapPin size={34} strokeWidth={1.6} /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="mb-2 flex gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-sm">{game.format}</span>
              <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-sm">{game.skill_level}</span>
            </div>
            <div className="text-2xl font-bold">{game.title}</div>
          </div>
        </div>
        <div className="px-5 pt-5">
          <SheetHeader className="sr-only"><SheetTitle>{game.title}</SheetTitle><SheetDescription>Game details and joining options</SheetDescription></SheetHeader>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-b pb-5">
            <DetailItem icon={<Clock3 size={17} />} label="When" value={formatGameTime(game.date, game.time)} />
            <DetailItem icon={<Users size={17} />} label="Players" value={`${game.current_players} of ${game.max_players}`} />
            <DetailItem icon={<Trophy size={17} />} label="Level" value={game.skill_level} />
            <DetailItem icon={<Megaphone size={17} />} label="Host" value={game.host_name} />
          </div>
          <button type="button" onClick={onCourt} disabled={!game.court_id} className="flex w-full items-center gap-3 border-b py-5 text-left disabled:cursor-default">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><MapPin size={19} /></div>
            <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{game.court_name}</div><div className="mt-0.5 truncate text-xs text-muted-foreground">{court?.address || "Court details"}</div></div>
            {game.court_id && <ChevronLeft className="rotate-180 text-muted-foreground" size={18} />}
          </button>
          <div className="py-5">
            <div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Game availability</span><span className={isFull ? "text-muted-foreground" : "text-emerald-700"}>{isFull ? "Game full" : `${spots} ${spots === 1 ? "spot" : "spots"} left`}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => shareGame(game)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-background" aria-label="Share game"><Share2 size={18} /></button>
            <button type="button" onClick={isJoined ? onLeave : onJoin} disabled={isHost || (!isJoined && isFull)} className="h-12 flex-1 rounded-full bg-foreground px-5 text-sm font-semibold text-background disabled:bg-muted disabled:text-muted-foreground">{isHost ? "You're hosting" : isJoined ? "Leave game" : isFull ? "Game full" : "Join game"}</button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex min-w-0 gap-2.5"><div className="mt-0.5 text-muted-foreground">{icon}</div><div className="min-w-0"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-0.5 truncate text-sm font-semibold">{value}</div></div></div>;
}

function GameListRow({
  game,
  isJoined,
  isHost,
  onOpen,
  onJoin,
  onLeave,
}: {
  game: { id: string; title: string; court_name: string; date: string; time: string; format: string; skill_level: string; current_players: number; max_players: number; host_name: string };
  isJoined?: boolean;
  isHost?: boolean;
  onOpen?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
}) {
  const spots = game.max_players - game.current_players;
  const isFull = spots <= 0;
  const canJoin = !isHost && !isJoined && !isFull;
  return (
    <div onClick={onOpen} style={{
      background: C.surface, borderRadius: 16, padding: 14,
      border: `1px solid ${C.hair}`,
      cursor: onOpen ? "pointer" : "default",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{game.title}</div>
          <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>{game.court_name}</div>
        </div>
        <span style={{
          fontSize: 11, padding: "3px 8px", borderRadius: 99,
          background: isFull ? C.hair2 : C.greenSoft,
          color: isFull ? C.ink3 : C.greenInk,
          fontWeight: 600, flexShrink: 0,
        }}>{isFull ? "Full" : `${spots} spot${spots > 1 ? "s" : ""} left`}</span>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: C.ink3 }}>
        <span>{formatGameTime(game.date, game.time)}</span>
        <span>/</span>
        <span>{game.format}</span>
        <span>/</span>
        <span>{game.current_players}/{game.max_players} players</span>
      </div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: C.ink2 }}>
          Hosted by <span style={{ fontWeight: 500 }}>{game.host_name}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={(e) => { e.stopPropagation(); shareGame(game); }}
            style={{
              width: 32, height: 32, borderRadius: 99, border: `1px solid ${C.hair}`,
              background: C.surface, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            title="Share game"
          >
            <Share2 size={14} strokeWidth={1.8} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isJoined) onLeave?.();
              else if (canJoin) onJoin?.();
            }}
            disabled={isHost || (!isJoined && isFull)}
            style={{
              fontSize: 12, fontWeight: 600,
              color: isJoined ? C.ink : C.onInk,
              background: isHost ? C.hair2 : isJoined ? C.greenSoft : isFull ? C.ink3 : C.ink,
              border: "none", padding: "7px 16px", borderRadius: 99,
              cursor: isHost || (!isJoined && isFull) ? "default" : "pointer", fontFamily: font,
            }}
          >{isHost ? "Hosting" : isJoined ? "Joined" : isFull ? "Full" : "Join"}</button>
        </div>
      </div>
    </div>
  );
}
