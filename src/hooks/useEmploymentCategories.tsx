import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmploymentCategory {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
}

export interface SubProject {
  id: string;
  category_id: string;
  name: string;
  display_name: string;
  description: string | null;
}

export const useEmploymentCategories = () => {
  return useQuery({
    queryKey: ["employment-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employment_categories")
        .select("*")
        .order("display_name");
      
      if (error) throw error;
      return data as EmploymentCategory[];
    },
  });
};

export const useSubProjects = (categoryId?: string) => {
  return useQuery({
    queryKey: ["sub-projects", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("sub_projects")
        .select("*")
        .order("display_name");
      
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SubProject[];
    },
    enabled: !!categoryId,
  });
};

export const useAllSubProjects = () => {
  return useQuery({
    queryKey: ["all-sub-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sub_projects")
        .select(`
          *,
          employment_categories!inner(name, display_name)
        `)
        .order("display_name");
      
      if (error) throw error;
      return data;
    },
  });
};