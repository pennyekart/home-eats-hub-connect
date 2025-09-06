import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EmploymentCategory, SubProject } from "./useEmploymentCategories";

export interface CreateCategoryData {
  name: string;
  display_name: string;
  description?: string;
}

export interface CreateSubProjectData {
  category_id: string;
  name: string;
  display_name: string;
  description?: string;
}

export const useCreateEmploymentCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const { data: result, error } = await supabase
        .from("employment_categories")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as EmploymentCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employment-categories"] });
      toast({
        title: "Success",
        description: "Employment category created successfully",
      });
    },
    onError: (error) => {
      console.error("Create category error:", error);
      toast({
        title: "Error",
        description: "Failed to create employment category",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEmploymentCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmploymentCategory> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("employment_categories")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result as EmploymentCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employment-categories"] });
      toast({
        title: "Success",
        description: "Employment category updated successfully",
      });
    },
    onError: (error) => {
      console.error("Update category error:", error);
      toast({
        title: "Error",
        description: "Failed to update employment category",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteEmploymentCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employment_categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employment-categories"] });
      toast({
        title: "Success",
        description: "Employment category deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Delete category error:", error);
      toast({
        title: "Error",
        description: "Failed to delete employment category",
        variant: "destructive",
      });
    },
  });
};

export const useCreateSubProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateSubProjectData) => {
      const { data: result, error } = await supabase
        .from("sub_projects")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as SubProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-projects"] });
      queryClient.invalidateQueries({ queryKey: ["all-sub-projects"] });
      toast({
        title: "Success",
        description: "Sub-project created successfully",
      });
    },
    onError: (error) => {
      console.error("Create sub-project error:", error);
      toast({
        title: "Error",
        description: "Failed to create sub-project",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSubProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SubProject> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("sub_projects")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result as SubProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-projects"] });
      queryClient.invalidateQueries({ queryKey: ["all-sub-projects"] });
      toast({
        title: "Success",
        description: "Sub-project updated successfully",
      });
    },
    onError: (error) => {
      console.error("Update sub-project error:", error);
      toast({
        title: "Error",
        description: "Failed to update sub-project",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSubProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sub_projects")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-projects"] });
      queryClient.invalidateQueries({ queryKey: ["all-sub-projects"] });
      toast({
        title: "Success",
        description: "Sub-project deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Delete sub-project error:", error);
      toast({
        title: "Error",
        description: "Failed to delete sub-project",
        variant: "destructive",
      });
    },
  });
};