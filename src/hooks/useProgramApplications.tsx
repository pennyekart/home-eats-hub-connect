import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProgramApplication {
  id: string;
  user_id: string;
  program_id: string;
  status: string;
  applied_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramRequest {
  id: string;
  user_id: string;
  request_type: string;
  status: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

export const useUserApplications = (userData?: any) => {
  return useQuery({
    queryKey: ["user-applications", userData?.mobile_number],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use mobile number as unique identifier when no auth user exists
      const userId = user?.id || userData?.mobile_number || "anonymous";
      
      const { data, error } = await supabase
        .from("program_applications")
        .select(`
          *,
          programs!inner(program_name, description, employment_categories(display_name))
        `)
        .eq("user_id", userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userData?.mobile_number, // Only run query when we have user data
  });
};

export const useApplyToProgram = (userData?: any) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (programId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use mobile number as unique identifier when no auth user exists
      const userId = user?.id || userData?.mobile_number || "anonymous";

      const { data, error } = await supabase
        .from("program_applications")
        .insert({
          user_id: userId,
          program_id: programId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["user-applications"] });
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
    },
    onError: (error) => {
      console.error("Error applying to program:", error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    },
  });
};

export const useCreateRequest = (userData?: any) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ requestType, message }: { requestType: string; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use mobile number as unique identifier when no auth user exists
      const userId = user?.id || userData?.mobile_number || "anonymous";

      const { data, error } = await supabase
        .from("program_requests")
        .insert({
          user_id: userId,
          request_type: requestType,
          message: message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-requests"] });
      const requestTypeText = variables.requestType === 'cancel' ? 'cancellation' : 'multi-program';
      toast({
        title: "Request Submitted",
        description: `Your ${requestTypeText} request has been submitted for admin review`,
      });
    },
    onError: (error) => {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
    },
  });
};