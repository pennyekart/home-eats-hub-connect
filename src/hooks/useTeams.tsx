import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  member_id: string;
  member_name: string;
  member_mobile: string | null;
  added_at: string;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
  member_count: number;
}

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          team_members (*)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include member count
      const teamsWithMembers: TeamWithMembers[] = (data || []).map(team => ({
        ...team,
        members: team.team_members || [],
        member_count: team.team_members?.length || 0
      }));
      
      return teamsWithMembers;
    },
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("teams")
        .insert({ name, description })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Success",
        description: `Team "${data.name}" created successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
      console.error("Create team error:", error);
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive"
      });
      console.error("Delete team error:", error);
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      teamId, 
      memberId, 
      memberName, 
      memberMobile 
    }: { 
      teamId: string; 
      memberId: string; 
      memberName: string; 
      memberMobile?: string;
    }) => {
      const { data, error } = await supabase
        .from("team_members")
        .insert({
          team_id: teamId,
          member_id: memberId,
          member_name: memberName,
          member_mobile: memberMobile
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Success",
        description: `Member added to team successfully`,
      });
    },
    onError: (error) => {
      if (error.message?.includes('duplicate key value')) {
        toast({
          title: "Error",
          description: "This member is already in the team",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add member to team",
          variant: "destructive"
        });
      }
      console.error("Add team member error:", error);
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ teamId, memberId }: { teamId: string; memberId: string }) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("member_id", memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({
        title: "Success",
        description: "Member removed from team successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove member from team",
        variant: "destructive"
      });
      console.error("Remove team member error:", error);
    },
  });
};