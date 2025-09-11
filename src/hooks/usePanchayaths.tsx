import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Panchayath {
  id: string;
  name_english: string;
  name_malayalam: string | null;
  district: string | null;
  state: string;
  created_at: string;
  updated_at: string;
}

export const usePanchayaths = () => {
  return useQuery({
    queryKey: ["panchayaths"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("panchayaths")
        .select("*")
        .order("name_english");
      
      if (error) throw error;
      return data as Panchayath[];
    },
  });
};