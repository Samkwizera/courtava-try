import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useCheckInNotifications(myCourtId: string | null, enabled = true) {
  const { user } = useAuth();
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !myCourtId || !enabled) return;

    const channel = supabase
      .channel("check_in_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "check_ins",
          filter: `court_id=eq.${myCourtId}`,
        },
        async (payload) => {
          const newCheckIn = payload.new as {
            id: string;
            user_id: string;
            court_id: string;
          };

          // Don't notify for own check-ins or already notified
          if (
            newCheckIn.user_id === user.id ||
            notifiedIds.current.has(newCheckIn.id)
          ) {
            return;
          }

          notifiedIds.current.add(newCheckIn.id);

          // Fetch the user's profile for a friendly name
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", newCheckIn.user_id)
            .single();

          const displayName = profile?.display_name || "A player";

          toast.success(`${displayName} just checked in at your court! 🏀`, {
            duration: 5000,
          });

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Courtava check-in", {
              body: `${displayName} just checked in at your court.`,
              icon: "/pwa-192x192.png",
              tag: `check-in-${newCheckIn.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, user, myCourtId]);
}
