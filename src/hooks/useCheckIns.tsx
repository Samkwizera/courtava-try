import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CheckIn {
  id: string;
  user_id: string;
  court_id: string;
  created_at: string;
  expires_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

type CheckInRow = Omit<CheckIn, "profile"> & {
  profile?: CheckIn["profile"] | CheckIn["profile"][];
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useCheckIns() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [myCheckIn, setMyCheckIn] = useState<CheckIn | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCheckIns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("check_ins")
        .select(`
          *,
          profile:profiles(display_name, avatar_url)
        `)
        .gt("expires_at", new Date().toISOString());

      if (error) throw error;

      const formattedData: CheckIn[] = ((data || []) as CheckInRow[]).map((item) => ({
        ...item,
        profile: Array.isArray(item.profile) ? item.profile[0] : item.profile,
      }));

      setCheckIns(formattedData);
      
      if (user) {
        const myActive = formattedData.find((c: CheckIn) => c.user_id === user.id);
        setMyCheckIn(myActive || null);
      }
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const checkIn = async (courtId: string) => {
    if (!user) {
      toast.error("Please sign in to check in");
      return false;
    }

    try {
      // First, delete any existing check-in
      await supabase.from("check_ins").delete().eq("user_id", user.id);

      // Create new check-in
      const { error } = await supabase.from("check_ins").insert({
        user_id: user.id,
        court_id: courtId,
      });

      if (error) throw error;

      toast.success("You're checked in! Others can now see you on the map.");
      await fetchCheckIns();
      return true;
    } catch (error: unknown) {
      console.error("Error checking in:", error);
      toast.error(getErrorMessage(error) || "Failed to check in. Please try again.");
      return false;
    }
  };

  const checkOut = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("check_ins")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("You've checked out");
      setMyCheckIn(null);
      await fetchCheckIns();
      return true;
    } catch (error: unknown) {
      console.error("Error checking out:", error);
      toast.error(getErrorMessage(error) || "Failed to check out. Please try again.");
      return false;
    }
  };

  useEffect(() => {
    fetchCheckIns();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("check_ins_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "check_ins",
        },
        () => {
          fetchCheckIns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCheckIns]);

  return {
    checkIns,
    myCheckIn,
    isLoading,
    checkIn,
    checkOut,
    refetch: fetchCheckIns,
  };
}
