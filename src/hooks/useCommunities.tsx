import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  court_id: string | null;
  schedule: string | null;
  created_by: string;
  created_at: string;
  member_count: number;
  is_member: boolean;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useCommunities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommunities = useCallback(async () => {
    try {
      // Fetch communities with member counts
      const { data: communitiesData, error: communitiesError } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });

      if (communitiesError) throw communitiesError;

      // Fetch member counts for each community
      const { data: memberCounts, error: memberError } = await supabase
        .from("community_members")
        .select("community_id");

      if (memberError) throw memberError;

      // Count members per community
      const countMap: Record<string, number> = {};
      memberCounts?.forEach((m) => {
        countMap[m.community_id] = (countMap[m.community_id] || 0) + 1;
      });

      // Check which communities the current user is a member of
      let userMemberships: Set<string> = new Set();
      if (user) {
        const { data: memberships } = await supabase
          .from("community_members")
          .select("community_id")
          .eq("user_id", user.id);

        userMemberships = new Set(memberships?.map((m) => m.community_id) || []);
      }

      const formattedData: Community[] = (communitiesData || []).map((c) => ({
        ...c,
        member_count: countMap[c.id] || 0,
        is_member: userMemberships.has(c.id),
      }));

      setCommunities(formattedData);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createCommunity = async (data: {
    name: string;
    description?: string;
    court_id?: string;
    schedule?: string;
  }) => {
    if (!user) {
      toast.error("Please sign in to create a community");
      return null;
    }

    try {
      const { data: newCommunity, error } = await supabase
        .from("communities")
        .insert({
          name: data.name,
          description: data.description || null,
          court_id: data.court_id || null,
          schedule: data.schedule || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator
      await supabase.from("community_members").insert({
        community_id: newCommunity.id,
        user_id: user.id,
      });

      toast.success("Community created!");
      await fetchCommunities();
      return newCommunity;
    } catch (error: unknown) {
      console.error("Error creating community:", error);
      toast.error(getErrorMessage(error) || "Failed to create community");
      return null;
    }
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) {
      toast.error("Please sign in to join");
      return false;
    }

    try {
      const { error } = await supabase.from("community_members").insert({
        community_id: communityId,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("You've joined the community!");
      await fetchCommunities();
      return true;
    } catch (error: unknown) {
      console.error("Error joining community:", error);
      toast.error(getErrorMessage(error) || "Failed to join community");
      return false;
    }
  };

  const leaveCommunity = async (communityId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("You've left the community");
      await fetchCommunities();
      return true;
    } catch (error: unknown) {
      console.error("Error leaving community:", error);
      toast.error(getErrorMessage(error) || "Failed to leave community");
      return false;
    }
  };

  useEffect(() => {
    fetchCommunities();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("community_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "communities" },
        () => fetchCommunities()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_members" },
        () => fetchCommunities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCommunities]);

  return {
    communities,
    isLoading,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    refetch: fetchCommunities,
  };
}
