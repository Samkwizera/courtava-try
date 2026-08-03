import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skill_level: string | null;
  position: string | null;
  play_styles: string[] | null;
  availability: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  display_name?: string | null;
  bio?: string | null;
  skill_level?: string | null;
  position?: string | null;
  play_styles?: string[] | null;
  availability?: string[] | null;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({ id: user.id, display_name: user.email?.split("@")[0] || "Player" })
            .select()
            .single();

          if (insertError) throw insertError;
          return newProfile as Profile;
        }
        throw error;
      }

      return data as Profile;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile updated!");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    },
  });

  return {
    profile,
    isLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}
