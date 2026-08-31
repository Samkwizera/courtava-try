import { useState } from "react";
import { Settings, Edit2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGames } from "@/hooks/useGames";
import { useCheckIns } from "@/hooks/useCheckIns";
import { EditProfileSheet } from "@/components/profile/EditProfileSheet";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { C, SHADOW } from "@/lib/tokens";
import { PageHeader } from "@/components/layout/PageHeader";
import { IconButton } from "@/components/ui/IconButton";

const ChevIcon = () => <ChevronRight size={14} color={C.ink3} strokeWidth={2} />;


const font = `"Inter", -apple-system, system-ui, sans-serif`;

const SKILL_LEVELS = ["Beginner", "Casual", "Intermediate", "Advanced", "Pro"];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { games, myParticipantGameIds } = useGames();
  const { checkIns } = useCheckIns();
  const [editOpen, setEditOpen] = useState(false);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Player";
  const username = displayName.toLowerCase().replace(/\s+/g, "");
  const avatarUrl = profile?.avatar_url;
  const initial = displayName.slice(0, 2).toUpperCase();

  // Games this user hosted or joined
  const myGames = games.filter((g) => g.host_id === user?.id || myParticipantGameIds.includes(g.id));
  const gamesPlayed = myGames.length;
  // Courts visited = distinct courts from check-ins
  const distinctCourts = new Set(checkIns.filter((ci) => ci.user_id === user?.id).map((ci) => ci.court_id)).size;
  // Rating placeholder
  const rating = "—";

  // Skill level from profile
  const skillIndex = profile?.skill_level
    ? SKILL_LEVELS.indexOf(profile.skill_level)
    : -1;
  const skillLabel = skillIndex >= 0 ? SKILL_LEVELS[skillIndex] : "Not set";

  // Recent games (last 3)
  const recentGames = myGames.slice(0, 3);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: C.bg, fontFamily: font, color: C.ink, overflowY: "auto", paddingBottom: 120 }}>

      <PageHeader
        sticky={false}
        actions={
          <>
            <IconButton label="Edit profile" onClick={() => setEditOpen(true)}>
              <Edit2 size={15} />
            </IconButton>
            <IconButton label="Settings" onClick={() => navigate("/settings")}>
              <Settings size={15} />
            </IconButton>
          </>
        }
      />

      {/* Avatar + identity */}
      <ScrollReveal>
      <div style={{ padding: "20px 22px 0", textAlign: "center" }}>
        <div style={{
          width: 88, height: 88, borderRadius: 99, margin: "0 auto",
          background: "linear-gradient(135deg, #D9C9A8, #B5956B)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, color: C.onOverlay,
          border: `3px solid ${C.surface}`, boxShadow: SHADOW.float,
          overflow: "hidden",
        }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 14, letterSpacing: -0.4 }}>
          {displayName}
        </div>
        <div style={{ fontSize: 13, color: C.ink3, marginTop: 2 }}>@{username}</div>

        {/* Available chip */}
        <div style={{
          marginTop: 10, display: "inline-flex", gap: 5, alignItems: "center",
          padding: "4px 10px", borderRadius: 99, background: C.greenSoft,
          color: C.greenInk, fontSize: 11, fontWeight: 600,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 99, background: C.green }} />
          Available to hoop today
        </div>

        {profile?.bio && (
          <div style={{ fontSize: 13, color: C.ink2, marginTop: 10, lineHeight: 1.5 }}>
            {profile.bio}
          </div>
        )}
      </div>
      </ScrollReveal>

      {/* Stats row */}
      <ScrollReveal>
      <StaggerGroup style={{ padding: "20px 14px 0", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {[
          { v: String(gamesPlayed), l: "Games" },
          { v: String(rating), l: "Rating" },
          { v: String(distinctCourts || "—"), l: "Courts" },
        ].map((s) => (
          <StaggerItem key={s.l}>
          <div style={{
            background: C.surface, border: `1px solid ${C.hair}`,
            borderRadius: 16, padding: "14px 10px", textAlign: "center",
          }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>{s.l}</div>
          </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
      </ScrollReveal>

      {/* Skill level */}
      <ScrollReveal>
      <div style={{ padding: "10px 14px 0" }}>
        <div style={{
          background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 16, padding: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Skill level</div>
            <div style={{ fontSize: 12, color: C.ink3 }}>{skillLabel}</div>
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
            {SKILL_LEVELS.map((l, i) => (
              <div key={l} style={{
                flex: 1, height: 5, borderRadius: 99,
                background: skillIndex >= 0 && i <= skillIndex ? C.ink : C.hair,
              }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: C.ink3 }}>Beginner</div>
            <div style={{ fontSize: 11, color: C.ink3 }}>Pro</div>
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* Preferences */}
      <ScrollReveal>
      <div style={{ padding: "10px 14px 0" }}>
        <div style={{
          background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 16, overflow: "hidden",
        }}>
          {[
            { l: "Sport", v: "Basketball" },
            { l: "Position", v: profile?.position || "—" },
            { l: "Preferred vibe", v: profile?.play_styles?.join(", ") || "—" },
            { l: "Availability", v: profile?.availability?.join(", ") || "—" },
          ].map((r, i, a) => (
            <div key={r.l} style={{
              padding: "14px 16px", display: "flex", justifyContent: "space-between",
              borderBottom: i < a.length - 1 ? `1px solid ${C.hair}` : "none",
            }}>
              <div style={{ fontSize: 13, color: C.ink3 }}>{r.l}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{r.v}</div>
            </div>
          ))}
        </div>
      </div>
      </ScrollReveal>

      {/* Recent games */}
      {recentGames.length > 0 && (
        <ScrollReveal>
          <div style={{ padding: "20px 22px 4px", fontSize: 15, fontWeight: 600 }}>Recent games</div>
          <StaggerGroup style={{ padding: "0 14px 0", display: "flex", flexDirection: "column", gap: 6 }}>
            {recentGames.map((game) => (
              <StaggerItem key={game.id}>
              <div style={{
                background: C.surface, border: `1px solid ${C.hair}`, borderRadius: 12,
                padding: 12, display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer",
              }} onClick={() => navigate("/games")}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: C.green, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{game.title}</div>
                  <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>{game.court_name} · {game.date}</div>
                </div>
                <ChevIcon />
              </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </ScrollReveal>
      )}

      {/* Empty games state */}
      {recentGames.length === 0 && (
        <div style={{ padding: "20px 22px 0", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.ink3 }}>No games yet. Host or join a game!</div>
        </div>
      )}

      <EditProfileSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile ?? null}
        onSave={updateProfile}
        isSaving={isUpdating}
      />
    </div>
  );
}
