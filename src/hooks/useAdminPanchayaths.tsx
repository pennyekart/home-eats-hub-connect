import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreatePanchayathData {
  name_english: string;
  name_malayalam?: string;
  district?: string;
  state?: string;
}

interface UpdatePanchayathData {
  id: string;
  name_english: string;
  name_malayalam?: string;
  district?: string;
  state?: string;
}

export const useCreatePanchayath = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePanchayathData) => {
      const { data: result, error } = await (supabase as any)
        .from("panchayaths")
        .insert([{
          name_english: data.name_english,
          name_malayalam: data.name_malayalam || null,
          district: data.district || null,
          state: data.state || 'Kerala'
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panchayaths"] });
      toast({
        title: "Success",
        description: "Panchayath created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create panchayath",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePanchayath = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdatePanchayathData) => {
      const { data: result, error } = await (supabase as any)
        .from("panchayaths")
        .update({
          name_english: data.name_english,
          name_malayalam: data.name_malayalam || null,
          district: data.district || null,
          state: data.state || 'Kerala'
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panchayaths"] });
      toast({
        title: "Success",
        description: "Panchayath updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to update panchayath",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePanchayath = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("panchayaths")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panchayaths"] });
      toast({
        title: "Success",
        description: "Panchayath deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete panchayath",
        variant: "destructive",
      });
    },
  });
};