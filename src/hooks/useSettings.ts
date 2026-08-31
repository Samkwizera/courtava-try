import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserSettings {
  notify_nearby_check_ins: boolean;
  notify_new_games: boolean;
  notify_communities: boolean;
  court_reminders: boolean;
  game_reminders: boolean;
  location_enabled: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  notify_nearby_check_ins: true,
  notify_new_games: true,
  notify_communities: true,
  court_reminders: true,
  game_reminders: true,
  location_enabled: false,
};

const localKey = (userId: string) => `courtava-settings:${userId}`;

function readLocal(userId: string): UserSettings {
  try {
    const value = localStorage.getItem(localKey(userId));
    return value ? { ...DEFAULT_SETTINGS, ...JSON.parse(value) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeLocal(userId: string, settings: UserSettings) {
  localStorage.setItem(localKey(userId), JSON.stringify(settings));
}

export function useSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["user-settings", user?.id];

  const query = useQuery({
    queryKey,
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return DEFAULT_SETTINGS;
      const local = readLocal(user.id);
      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle();
      if (error) return local;
      const settings = data ? {
        notify_nearby_check_ins: data.notify_nearby_check_ins,
        notify_new_games: data.notify_new_games,
        notify_communities: data.notify_communities,
        court_reminders: data.court_reminders,
        game_reminders: data.game_reminders,
        location_enabled: data.location_enabled,
      } : local;
      writeLocal(user.id, settings);
      return settings;
    },
    initialData: user ? readLocal(user.id) : DEFAULT_SETTINGS,
  });

  const mutation = useMutation({
    mutationFn: async (settings: UserSettings) => {
      if (!user) throw new Error("Sign in to update settings");
      writeLocal(user.id, settings);
      const { error } = await supabase.from("user_settings").upsert({ user_id: user.id, ...settings }, { onConflict: "user_id" });
      if (error && error.code !== "PGRST205" && error.code !== "42P01") throw error;
      return settings;
    },
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UserSettings>(queryKey);
      queryClient.setQueryData(queryKey, settings);
      return { previous };
    },
    onError: (_error, _settings, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (settings) => queryClient.setQueryData(queryKey, settings),
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    saveSettings: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
