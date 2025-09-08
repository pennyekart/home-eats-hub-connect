import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Hook to fetch all program applications for admin
export const useAdminApplications = () => {
  return useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_applications")
        .select(`
          *,
          programs!inner(program_name, description, employment_categories(display_name))
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook to fetch all program requests for admin
export const useAdminRequests = () => {
  return useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_requests")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook to update application status
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const { data, error } = await supabase
        .from("program_applications")
        .update({ status })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["user-applications"] });
      toast({
        title: "Success",
        description: `Application ${variables.status} successfully`,
      });
    },
    onError: (error) => {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    },
  });
};

// Hook to update request status
export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      // First get the request details to know the type and user
      const { data: requestData, error: requestError } = await supabase
        .from("program_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (requestError) throw requestError;

      // Update the request status
      const { data, error } = await supabase
        .from("program_requests")
        .update({ status })
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;

      // If request is approved, update corresponding program applications
      if (status === 'approved' && requestData) {
        let applicationStatus = '';
        
        if (requestData.request_type === 'cancellation') {
          applicationStatus = 'cancelled';
        } else if (requestData.request_type === 'multi-program') {
          applicationStatus = 'multi-program';
        }

        // Update all program applications for this user to the new status
        if (applicationStatus) {
          const { error: appError } = await supabase
            .from("program_applications")
            .update({ status: applicationStatus })
            .eq("user_id", requestData.user_id)
            .eq("status", "pending"); // Only update pending applications

          if (appError) {
            console.error("Error updating application status:", appError);
          }
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["user-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["user-applications"] });
      toast({
        title: "Success",
        description: `Request ${variables.status} successfully`,
      });
    },
    onError: (error) => {
      console.error("Error updating request status:", error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    },
  });
};

// Hook to delete an application
export const useDeleteApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("program_applications")
        .delete()
        .eq("id", applicationId);

      if (error) throw error;
      return applicationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["user-applications"] });
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting application:", error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    },
  });
};