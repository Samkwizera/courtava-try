import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface DbGame {
  id: string;
  title: string;
  court_id: string | null;
  court_name: string;
  date: string;
  time: string;
  format: string;
  skill_level: string;
  current_players: number;
  max_players: number;
  host_id: string;
  host_name: string;
  created_at: string;
  updated_at: string;
}

export interface GameInsert {
  title: string;
  court_id?: string | null;
  court_name: string;
  date: string;
  time: string;
  format: string;
  skill_level: string;
  max_players: number;
  host_id: string;
  host_name: string;
}

export function useGames() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: games = [], isLoading, error } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DbGame[];
    },
  });

  const { data: myParticipantGameIds = [] } = useQuery({
    queryKey: ["game_participants", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("game_participants")
        .select("game_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((row) => row.game_id as string);
    },
    enabled: !!user,
  });

  const addGameMutation = useMutation({
    mutationFn: async (game: GameInsert) => {
      const { data, error } = await supabase
        .from("games")
        .insert(game)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast.success("Game created successfully!");
    },
    onError: (error) => {
      console.error("Error creating game:", error);
      toast.error("Failed to create game. Please try again.");
    },
  });

  const joinGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      if (!user) throw new Error("Please sign in to join a game");
      const { error } = await supabase
        .from("game_participants")
        .insert({ game_id: gameId, user_id: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["game_participants", user?.id] });
      toast.success("You're in! See you on the court.");
    },
    onError: (error) => {
      console.error("Error joining game:", error);
      toast.error(error instanceof Error ? error.message : "Failed to join game. Please try again.");
    },
  });

  const leaveGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      if (!user) throw new Error("Please sign in first");
      const { error } = await supabase
        .from("game_participants")
        .delete()
        .eq("game_id", gameId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["game_participants", user?.id] });
      toast("You've left the game.");
    },
    onError: (error) => {
      console.error("Error leaving game:", error);
      toast.error(error instanceof Error ? error.message : "Failed to leave game. Please try again.");
    },
  });

  return {
    games,
    isLoading,
    error,
    addGame: addGameMutation.mutateAsync,
    isAdding: addGameMutation.isPending,
    myParticipantGameIds,
    joinGame: joinGameMutation.mutateAsync,
    isJoining: joinGameMutation.isPending,
    leaveGame: leaveGameMutation.mutateAsync,
    isLeaving: leaveGameMutation.isPending,
  };
}
