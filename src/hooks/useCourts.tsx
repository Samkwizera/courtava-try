import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export function useCourts() {
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

  return {
    dbCourts,
    isLoading,
    error,
  };
}

export function useCourt(courtId?: string) {
  const { data: court = null, isLoading, error } = useQuery({
    queryKey: ["court", courtId],
    queryFn: async () => {
      if (!courtId) return null;

      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .eq("id", courtId)
        .maybeSingle();

      if (error) throw error;
      return data as DbCourt | null;
    },
    enabled: !!courtId,
  });

  return {
    court,
    isLoading,
    error,
  };
}
