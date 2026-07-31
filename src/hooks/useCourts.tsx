import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { dedupeCourts } from "@/lib/courtDeduplication";

export interface DbCourt {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  surface: string;
  lights: boolean;
  water: boolean;
  parking: boolean;
  photo_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourtInsert {
  name: string;
  address: string;
  lat: number;
  lng: number;
  surface: string;
  lights: boolean;
  water: boolean;
  parking: boolean;
  created_by: string;
}

export function useCourts() {
  const queryClient = useQueryClient();

  const { data: dbCourts = [], isLoading, error } = useQuery({
    queryKey: ["courts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return dedupeCourts(data as DbCourt[]);
    },
  });

  const addCourtMutation = useMutation({
    mutationFn: async (court: CourtInsert) => {
      const { data, error } = await supabase
        .from("courts")
        .insert(court)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
      toast.success("Court added successfully!");
    },
    onError: (error) => {
      console.error("Error adding court:", error);
      toast.error("Failed to add court. Please try again.");
    },
  });

  return {
    dbCourts,
    isLoading,
    error,
    addCourt: addCourtMutation.mutateAsync,
    isAdding: addCourtMutation.isPending,
  };
}
