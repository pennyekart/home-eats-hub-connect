import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Panchayath {
  id: string;
  panchayath_id: string;
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
      try {
        // Fetch from external database
        const { createClient } = await import('@supabase/supabase-js');
        const externalSupabase = createClient(
          'https://mbvxiphgomdtoaqzmbgv.supabase.co', 
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo'
        );

        const { data, error } = await externalSupabase
          .from("panchayaths")
          .select("id, name_english, name_malayalam, district, state")
          .order("name_english");
        
        if (error) throw error;
        
        // Map external data to internal structure
        return (data || []).map((item: any) => ({
          id: item.id,
          panchayath_id: item.id,
          name_english: item.name_english,
          name_malayalam: item.name_malayalam,
          district: item.district,
          state: item.state || 'Kerala',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })) as Panchayath[];
      } catch (error) {
        console.error('Failed to fetch panchayaths from external database:', error);
        throw error;
      }
    },
  });
};