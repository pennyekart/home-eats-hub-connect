import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Program {
  id: string;
  category_id: string;
  sub_project_id: string | null;
  program_name: string;
  description: string;
  qualifications: string | null;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProgramData {
  category_id: string;
  sub_project_id?: string;
  program_name: string;
  description: string;
  qualifications?: string;
}

export const usePrograms = (userCategoryName?: string) => {
  return useQuery({
    queryKey: ["programs", userCategoryName],
    queryFn: async () => {
      console.log("usePrograms called with userCategoryName:", userCategoryName);
      
      let query = supabase
        .from("programs")
        .select(`
          *,
          employment_categories!inner(name, display_name),
          sub_projects(name, display_name)
        `);

      // Filter by category if user is not registered under "job card"
      if (userCategoryName && userCategoryName.toLowerCase() !== 'job card' && userCategoryName.toLowerCase() !== 'job card (special)') {
        console.log("Filtering by category:", userCategoryName);
        query = query.eq("employment_categories.name", userCategoryName.toLowerCase());
      } else {
        console.log("No category filtering applied - showing all programs");
      }

      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching programs:", error);
        throw error;
      }
      
      console.log("Programs fetched:", data?.length, "programs");
      console.log("Program categories:", data?.map(p => p.employment_categories?.name));
      
      return data;
    },
  });
};

export const useUserPrograms = () => {
  return useQuery({
    queryKey: ["user-programs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("programs")
        .select(`
          *,
          employment_categories!inner(name, display_name),
          sub_projects(name, display_name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (programData: CreateProgramData) => {
      // For now, use a placeholder user_id since authentication isn't set up yet
      const tempUserId = "00000000-0000-0000-0000-000000000000";

      const { data, error } = await supabase
        .from("programs")
        .insert({
          ...programData,
          user_id: tempUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["user-programs"] });
      toast({
        title: "Success",
        description: "Program added successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating program:", error);
      toast({
        title: "Error",
        description: "Failed to add program",
        variant: "destructive",
      });
    },
  });
};