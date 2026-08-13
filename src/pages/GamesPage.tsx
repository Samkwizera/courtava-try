import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGames } from "@/hooks/useGames";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useCourts } from "@/hooks/useCourts";
import { useAuth } from "@/hooks/useAuth";
import { Plus, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

async function shareGame(game: { title: string; court_name: string; date: string; time: string; format: string; max_players: number }) {
  const text = `Join my game: ${game.title} at ${game.court_name} — ${game.date} ${game.time ? formatTime(game.time) : ""} · ${game.format} · ${game.max_players} players`;
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

const C = {
  bg: "hsl(var(--background))",
  surface: "hsl(var(--card))",
  ink: "hsl(var(--foreground))",
  ink2: "hsl(var(--muted-foreground))",
  ink3: "hsl(var(--muted-foreground))",
  hair: "hsl(var(--border))",
  hair2: "hsl(var(--muted))",
  green: "oklch(0.68 0.14 150)",
  greenSoft: "hsl(var(--secondary))",
  greenInk: "hsl(var(--secondary-foreground))",
  amber: "oklch(0.78 0.12 75)",
};

const font = `"Inter", -apple-system, system-ui, sans-serif`;

const ChevIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke={C.ink3} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function formatGameTime(date: string, time: string) {
  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;
  if (isToday) return `Today · ${time ? formatTime(time) : ""}`;
  return `${date} · ${time ? formatTime(time) : ""}`;
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

export default function GamesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const courtFilterId = searchParams.get("court");
  const [tab, setTab] = useState("live");
  const { games, isLoading, myParticipantGameIds, joinGame, leaveGame } = useGames();
  const { checkIns } = useCheckIns();
  const { dbCourts } = useCourts();
  const { user } = useAuth();

  const handleJoin = (gameId: string) => {
    if (!user) { navigate("/auth"); return; }
    joinGame(gameId);
  };

  const filterCourt = courtFilterId ? dbCourts.find((c) => c.id === courtFilterId) : undefined;
  const courtGames = courtFilterId
    ? games
        .filter((g) => g.court_id === courtFilterId)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    : [];

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

  if (courtFilterId) {
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
            {courtGames.length} upcoming {courtGames.length === 1 ? "game" : "games"}
          </div>
        </div>

        <div style={{ padding: "14px 14px 0" }}>
          {courtGames.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏀</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No games scheduled yet</div>
              <div style={{ fontSize: 13, color: C.ink3, marginBottom: 20 }}>Be the first to host a game at this court</div>
              <button onClick={() => navigate("/create-game", { state: { courtId: courtFilterId, mode: "host" } })} style={{
                background: C.ink, color: "#fff", border: "none",
                padding: "12px 24px", borderRadius: 99, fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: font,
              }}>Host a game</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {courtGames.map((game) => (
                <GameListRow
                  key={game.id}
                  game={game}
                  isJoined={myParticipantGameIds.includes(game.id)}
                  isHost={user?.id === game.host_id}
                  onJoin={() => handleJoin(game.id)}
                  onLeave={() => leaveGame(game.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: C.bg, fontFamily: font, color: C.ink, overflowY: "auto", paddingBottom: 120 }}>

      {/* Header */}
      <div style={{ padding: "70px 22px 8px" }}>
        <div style={{ fontSize: 12, color: C.ink3, fontWeight: 500, letterSpacing: 0.2 }}>ACTIVITY</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>What's happening</div>
          <button
            onClick={() => navigate("/create-game")}
            style={{
              width: 36, height: 36, borderRadius: 99,
              background: C.ink, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Plus size={16} color="#fff" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Segment tabs */}
      <div style={{ padding: "10px 22px 4px", display: "flex", gap: 6 }}>
        {[
          { k: "live", label: "Live", dot: true },
          { k: "invites", label: "Games", badge: todayGames.length > 0 ? todayGames.length : undefined },
          { k: "friends", label: "Activity" },
        ].map((s) => (
          <button key={s.k} onClick={() => setTab(s.k)} style={{
            padding: "8px 14px", borderRadius: 99, border: "none", cursor: "pointer",
            background: tab === s.k ? C.ink : "#fff",
            color: tab === s.k ? "#fff" : C.ink2,
            fontSize: 13, fontWeight: 600,
            display: "flex", gap: 6, alignItems: "center",
            boxShadow: tab === s.k ? "none" : `inset 0 0 0 1px ${C.hair}`,
            fontFamily: font,
            transition: "background 0.2s, color 0.2s",
          }}>
            {s.dot && tab === s.k && (
              <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 99, background: C.green }} />
            )}
            {s.label}
            {s.badge !== undefined && s.badge > 0 && (
              <span style={{
                fontSize: 10, padding: "1px 6px", borderRadius: 99,
                background: tab === s.k ? "#fff" : C.ink,
                color: tab === s.k ? C.ink : "#fff",
                fontWeight: 700,
              }}>{s.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* LIVE TAB */}
      {tab === "live" && (
        <>
          {/* Live courts banner */}
          <div style={{ padding: "14px 14px 0" }}>
            <div style={{
              background: C.surface, borderRadius: 16, padding: 16,
              border: `1px solid ${C.hair}`,
              display: "flex", gap: 14, alignItems: "center",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: C.greenSoft,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                flexShrink: 0,
              }}>🏀</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {liveCourts.length > 0
                    ? `${liveCourts.length} court${liveCourts.length > 1 ? "s" : ""} active near you`
                    : "No active courts right now"}
                </div>
                <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>
                  {liveCourts.length > 0
                    ? liveCourts.slice(0, 3).map((c) => c.name).join(" · ")
                    : "Check back later or be the first to check in"}
                </div>
              </div>
              <button onClick={() => navigate("/courts")} style={{
                fontSize: 12, fontWeight: 600, color: "#fff", background: C.ink,
                border: "none", padding: "8px 14px", borderRadius: 99, cursor: "pointer",
                flexShrink: 0, fontFamily: font,
              }}>Open map</button>
            </div>
          </div>

          {/* NOW section */}
          <div style={{ padding: "12px 14px 0" }}>
            {/* Hot courts */}
            {hotCourts.length > 0 && (
              <>
                <div style={{ padding: "10px 8px 6px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>
                  NOW
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {hotCourts.map((court) => (
                    <FeedRow
                      key={`heat-${court.id}`}
                      icon="🔥"
                      tint={C.greenSoft}
                      title={`${court.name} is heating up`}
                      sub={`${court.liveCount} players just checked in`}
                      action="View"
                      onAction={() => navigate(`/courts/${court.id}`)}
                      onClick={() => navigate(`/courts/${court.id}`)}
                    />
                  ))}
                  {todayGames.map((game) => {
                    const spots = game.max_players - game.current_players;
                    const goToGame = () => navigate(game.court_id ? `/games?court=${game.court_id}` : "/games");
                    return (
                      <FeedRow
                        key={`game-${game.id}`}
                        icon="📣"
                        tint="#F5EFE4"
                        title={game.title}
                        sub={`${game.court_name} · ${formatTime(game.time)} · ${game.current_players}/${game.max_players} players`}
                        action={spots > 0 ? "Join" : "Full"}
                        onAction={goToGame}
                        onClick={goToGame}
                        onShare={() => shareGame(game)}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* Other check-ins */}
            {otherCheckIns.length > 0 && (
              <>
                <div style={{ padding: "16px 8px 6px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>
                  CHECKED IN
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {otherCheckIns.slice(0, 3).map((ci) => {
                    const court = dbCourts.find((c) => c.id === ci.court_id);
                    const name = (ci as { profile?: { display_name?: string } }).profile?.display_name || "Someone";
                    return (
                      <FeedRow
                        key={`ci-${ci.id}`}
                        icon={null}
                        tint={C.hair2}
                        title={`${name} checked into ${court?.name || "a court"}`}
                        sub="Just now"
                        onClick={() => court && navigate(`/courts/${court.id}`)}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* Upcoming games */}
            {upcomingGames.length > 0 && (
              <>
                <div style={{ padding: "16px 8px 6px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>
                  UPCOMING
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {upcomingGames.slice(0, 3).map((game) => {
                    const spots = game.max_players - game.current_players;
                    const goToGame = () => navigate(game.court_id ? `/games?court=${game.court_id}` : "/games");
                    return (
                      <FeedRow
                        key={`upcoming-${game.id}`}
                        icon="🏀"
                        tint={C.hair2}
                        title={game.title}
                        sub={`${game.court_name} · ${formatGameTime(game.date, game.time)}`}
                        action={spots > 0 ? "Join" : "Full"}
                        onAction={goToGame}
                        onClick={goToGame}
                        onShare={() => shareGame(game)}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* New courts */}
            {newCourts.length > 0 && (
              <>
                <div style={{ padding: "16px 8px 6px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>
                  NEW COURTS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {newCourts.map((court) => (
                    <FeedRow
                      key={`new-${court.id}`}
                      icon={null}
                      tint={C.hair2}
                      title={`New court added: ${court.name}`}
                      sub={court.address || "Newly verified location"}
                      onClick={() => navigate(`/courts/${court.id}`)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Empty state */}
            {hotCourts.length === 0 && todayGames.length === 0 && otherCheckIns.length === 0 && upcomingGames.length === 0 && newCourts.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🏀</div>
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
              <div style={{ fontSize: 32, marginBottom: 12 }}>📣</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No games yet</div>
              <div style={{ fontSize: 13, color: C.ink3, marginBottom: 20 }}>Be the first to host a game in your area</div>
              <button onClick={() => navigate("/create-game")} style={{
                background: C.ink, color: "#fff", border: "none",
                padding: "12px 24px", borderRadius: 99, fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: font,
              }}>Host a game</button>
            </div>
          ) : (
            <>
              {todayGames.length > 0 && (
                <>
                  <div style={{ padding: "4px 8px 8px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>TODAY</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    {todayGames.map((game) => (
                      <GameListRow
                        key={game.id}
                        game={game}
                        isJoined={myParticipantGameIds.includes(game.id)}
                        isHost={user?.id === game.host_id}
                        onJoin={() => handleJoin(game.id)}
                        onLeave={() => leaveGame(game.id)}
                      />
                    ))}
                  </div>
                </>
              )}
              {upcomingGames.length > 0 && (
                <>
                  <div style={{ padding: "4px 8px 8px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>UPCOMING</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {upcomingGames.map((game) => (
                      <GameListRow
                        key={game.id}
                        game={game}
                        isJoined={myParticipantGameIds.includes(game.id)}
                        isHost={user?.id === game.host_id}
                        onJoin={() => handleJoin(game.id)}
                        onLeave={() => leaveGame(game.id)}
                      />
                    ))}
                  </div>
                </>
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
              <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No activity right now</div>
              <div style={{ fontSize: 13, color: C.ink3 }}>When others check in at courts you'll see it here</div>
            </div>
          )}
          {otherCheckIns.length > 0 && (
            <>
              <div style={{ padding: "4px 8px 8px", fontSize: 11, color: C.ink3, fontWeight: 600, letterSpacing: 0.4 }}>LIVE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {otherCheckIns.map((ci) => {
                  const court = dbCourts.find((c) => c.id === ci.court_id);
                  const name = (ci as { profile?: { display_name?: string } }).profile?.display_name || "Someone";
                  return (
                    <FeedRow
                      key={`act-${ci.id}`}
                      icon={null}
                      tint={C.hair2}
                      title={`${name} checked into ${court?.name || "a court"}`}
                      sub="Active now"
                      onClick={() => court && navigate(`/courts/${court.id}`)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
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
  icon: string | null;
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
      background: C.surface, borderRadius: 14, padding: 14,
      border: `1px solid ${C.hair}`, display: "flex", gap: 12, alignItems: "flex-start",
      cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: tint,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        flexShrink: 0,
      }}>
        {icon ? (
          <span>{icon}</span>
        ) : (
          <div style={{ width: 8, height: 8, borderRadius: 99, background: C.ink3 }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.ink3, marginTop: 3 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        {onShare && (
          <button onClick={(e) => { e.stopPropagation(); onShare(); }} style={{
            width: 30, height: 30, borderRadius: 99, border: `1px solid ${C.hair}`,
            background: C.surface, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v13m0-13l-4 4m4-4l4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
                stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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

function GameListRow({
  game,
  isJoined,
  isHost,
  onJoin,
  onLeave,
}: {
  game: { id: string; title: string; court_name: string; date: string; time: string; format: string; skill_level: string; current_players: number; max_players: number; host_name: string };
  isJoined?: boolean;
  isHost?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
}) {
  const spots = game.max_players - game.current_players;
  const isFull = spots <= 0;
  const canJoin = !isHost && !isJoined && !isFull;
  return (
    <div style={{
      background: C.surface, borderRadius: 16, padding: 14,
      border: `1px solid ${C.hair}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{game.title}</div>
          <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>{game.court_name}</div>
        </div>
        <span style={{
          fontSize: 10, padding: "3px 8px", borderRadius: 99,
          background: isFull ? C.hair2 : C.greenSoft,
          color: isFull ? C.ink3 : C.greenInk,
          fontWeight: 600, flexShrink: 0,
        }}>{isFull ? "Full" : `${spots} spot${spots > 1 ? "s" : ""} left`}</span>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: C.ink3 }}>
        <span>{formatGameTime(game.date, game.time)}</span>
        <span>·</span>
        <span>{game.format}</span>
        <span>·</span>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v13m0-13l-4 4m4-4l4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
              color: isJoined ? C.ink : "#fff",
              background: isHost ? C.hair2 : isJoined ? C.greenSoft : isFull ? C.ink3 : C.ink,
              border: "none", padding: "7px 16px", borderRadius: 99,
              cursor: isHost || (!isJoined && isFull) ? "default" : "pointer", fontFamily: font,
            }}
          >{isHost ? "Hosting" : isJoined ? "Joined ✓" : isFull ? "Full" : "Join"}</button>
        </div>
      </div>
    </div>
  );
}
