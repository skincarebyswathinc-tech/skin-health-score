import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Scan {
  id: string;
  image_url: string;
  overall_score: number;
  skin_age: number | null;
  wrinkles_score: number | null;
  pores_score: number | null;
  redness_score: number | null;
  pigmentation_score: number | null;
  hydration_score: number | null;
  summary: string | null;
  created_at: string;
}

export const useScans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["scans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Scan[];
    },
    enabled: !!user,
  });
};

export const useLatestScan = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["latest-scan", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Scan | null;
    },
    enabled: !!user,
  });
};
