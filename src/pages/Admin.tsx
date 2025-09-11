import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Search, RefreshCw, Users, Tag, UserPlus, Trash2, Plus, Minus, Edit, Briefcase, FolderPlus, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeams, useCreateTeam, useDeleteTeam, useAddTeamMember, useRemoveTeamMember } from '@/hooks/useTeams';
import { useEmploymentCategories, useAllSubProjects } from '@/hooks/useEmploymentCategories';
import { useCreateEmploymentCategory, useUpdateEmploymentCategory, useDeleteEmploymentCategory, useCreateSubProject, useUpdateSubProject, useDeleteSubProject } from '@/hooks/useAdminEmploymentCategories';
import { useAdminApplications, useAdminRequests, useUpdateApplicationStatus, useUpdateRequestStatus, useDeleteApplication, useDeleteRequest } from '@/hooks/useAdminApplications';
import { usePrograms, useCreateProgram, useUpdateProgram, useDeleteProgram } from '@/hooks/usePrograms';
const Admin = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [panchayaths, setPanchayaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // Application filters
  const [applicationFilters, setApplicationFilters] = useState({
    panchayath: '',
    category: '',
    subProject: '',
    program: '',
    status: ''
  });
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDisplayName, setNewCategoryDisplayName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newSubProjectName, setNewSubProjectName] = useState('');
  const [newSubProjectDisplayName, setNewSubProjectDisplayName] = useState('');
  const [newSubProjectDescription, setNewSubProjectDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateSubProjectOpen, setIsCreateSubProjectOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubProject, setEditingSubProject] = useState<any>(null);
  const [editingApplication, setEditingApplication] = useState<any>(null);

  // Program management states
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDescription, setNewProgramDescription] = useState('');
  const [newProgramQualifications, setNewProgramQualifications] = useState('');
  const [selectedProgramCategoryId, setSelectedProgramCategoryId] = useState('');
  const [selectedProgramSubProjectId, setSelectedProgramSubProjectId] = useState('');
  const {
    toast
  } = useToast();

  // Team hooks
  const {
    data: teams = [],
    isLoading: teamsLoading
  } = useTeams();
  const createTeamMutation = useCreateTeam();
  const deleteTeamMutation = useDeleteTeam();
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  // Employment categories and sub-projects hooks
  const {
    data: employmentCategories = []
  } = useEmploymentCategories();
  const {
    data: allSubProjects = []
  } = useAllSubProjects();
  const createCategoryMutation = useCreateEmploymentCategory();
  const updateCategoryMutation = useUpdateEmploymentCategory();
  const deleteCategoryMutation = useDeleteEmploymentCategory();
  const createSubProjectMutation = useCreateSubProject();
  const updateSubProjectMutation = useUpdateSubProject();
  const deleteSubProjectMutation = useDeleteSubProject();

  // Application and request hooks
  const {
    data: adminApplications = [],
    isLoading: applicationsLoading
  } = useAdminApplications();
  const {
    data: adminRequests = [],
    isLoading: requestsLoading
  } = useAdminRequests();
  const updateApplicationStatusMutation = useUpdateApplicationStatus();
  const updateRequestStatusMutation = useUpdateRequestStatus();
  const deleteApplicationMutation = useDeleteApplication();
  const deleteRequestMutation = useDeleteRequest();

  // Program hooks
  const {
    data: programs = [],
    isLoading: programsLoading
  } = usePrograms();
  const createProgramMutation = useCreateProgram();
  const updateProgramMutation = useUpdateProgram();
  const deleteProgramMutation = useDeleteProgram();
  const fetchPanchayaths = async () => {
    try {
      // Create a Supabase client to fetch from external database
      const {
        createClient
      } = await import('@supabase/supabase-js');
      const externalSupabase = createClient('https://mbvxiphgomdtoaqzmbgv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo');

      // Try different column combinations as the schema might be different
      let data = null;
      let error = null;

      // First try with the expected column names
      try {
        const result = await externalSupabase.from('panchayaths').select('id, name_english, name_malayalam').order('name_english', {
          ascending: true
        });
        data = result.data;
        error = result.error;
      } catch (schemaError) {
        // If columns don't exist, try with different column names
        try {
          const result = await externalSupabase.from('panchayaths').select('id, name, display_name').order('name', {
            ascending: true
          });
          data = result.data;
          error = result.error;
        } catch (fallbackError) {
          // If still fails, try to get basic structure
          const result = await externalSupabase.from('panchayaths').select('*').limit(1);
          if (result.data && result.data.length > 0) {
            console.log('Available panchayaths columns:', Object.keys(result.data[0]));
          }
          throw new Error('Panchayaths table schema mismatch');
        }
      }
      if (error) throw error;
      setPanchayaths(data || []);
      console.log(`Loaded ${data?.length || 0} panchayaths successfully`);
    } catch (error) {
      console.error('Panchayaths fetch error:', error);
      // Set empty array instead of showing error to user, as this doesn't break core functionality
      setPanchayaths([]);
      // Only show error if it's not a schema mismatch (which is expected)
      if (!error.message?.includes('does not exist') && !error.message?.includes('schema mismatch')) {
        toast({
          title: "Warning",
          description: "Panchayaths data unavailable - other functions will work normally",
          variant: "default"
        });
      }
    }
  };
  const fetchCategories = async () => {
    try {
      // Create a Supabase client to fetch from external database
      const {
        createClient
      } = await import('@supabase/supabase-js');
      const externalSupabase = createClient('https://mbvxiphgomdtoaqzmbgv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo');
      const {
        data,
        error
      } = await externalSupabase.from('categories').select('id, *').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setCategories(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} categories`
      });
    } catch (error) {
      console.error('Categories fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive"
      });
    }
  };
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // Create a Supabase client to fetch from external database
      const {
        createClient
      } = await import('@supabase/supabase-js');
      const externalSupabase = createClient('https://mbvxiphgomdtoaqzmbgv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo');

      // First try without panchayaths to see what's available
      const {
        data,
        error
      } = await externalSupabase.from('registrations').select(`
          *, 
          categories!category_id(name_english, name_malayalam)
        `).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setRegistrations(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} registrations`
      });
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const createTeam = async () => {
    if (!newTeamName.trim() || selectedMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please provide team name and select at least one member",
        variant: "destructive"
      });
      return;
    }
    try {
      // Create team first
      const newTeam = await createTeamMutation.mutateAsync({
        name: newTeamName,
        description: `Team with ${selectedMembers.length} initial members`
      });

      // Add selected members to the team
      const selectedRegistrations = registrations.filter(reg => selectedMembers.includes(reg.id));
      for (const member of selectedRegistrations) {
        await addMemberMutation.mutateAsync({
          teamId: newTeam.id,
          memberId: member.id,
          memberName: member.full_name || 'N/A',
          memberMobile: member.mobile_number
        });
      }
      setNewTeamName('');
      setSelectedMembers([]);
      setMemberSearchTerm('');
      setIsCreateTeamOpen(false);
    } catch (error) {
      console.error('Team creation error:', error);
    }
  };
  const deleteTeam = (teamId: string) => {
    deleteTeamMutation.mutate(teamId);
  };
  const openAddMemberDialog = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsAddMemberOpen(true);
    setSelectedMembers([]);
  };
  const addMembersToTeam = async () => {
    if (!selectedTeamId || selectedMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one member",
        variant: "destructive"
      });
      return;
    }
    try {
      const selectedRegistrations = registrations.filter(reg => selectedMembers.includes(reg.id));
      for (const member of selectedRegistrations) {
        await addMemberMutation.mutateAsync({
          teamId: selectedTeamId,
          memberId: member.id,
          memberName: member.full_name || 'N/A',
          memberMobile: member.mobile_number
        });
      }
      setSelectedMembers([]);
      setMemberSearchTerm('');
      setIsAddMemberOpen(false);
      setSelectedTeamId(null);
    } catch (error) {
      console.error('Add members error:', error);
    }
  };
  const removeMemberFromTeam = (teamId: string, memberId: string) => {
    removeMemberMutation.mutate({
      teamId,
      memberId
    });
  };

  // Employment category handlers
  const createEmploymentCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryDisplayName.trim()) {
      toast({
        title: "Error",
        description: "Please provide category name and display name",
        variant: "destructive"
      });
      return;
    }
    try {
      await createCategoryMutation.mutateAsync({
        name: newCategoryName,
        display_name: newCategoryDisplayName,
        description: newCategoryDescription || null
      });
      setNewCategoryName('');
      setNewCategoryDisplayName('');
      setNewCategoryDescription('');
      setIsCreateCategoryOpen(false);
    } catch (error) {
      console.error('Create category error:', error);
    }
  };
  const updateEmploymentCategory = async () => {
    if (!editingCategory || !editingCategory.name || !editingCategory.display_name) {
      toast({
        title: "Error",
        description: "Please provide category name and display name",
        variant: "destructive"
      });
      return;
    }
    try {
      await updateCategoryMutation.mutateAsync(editingCategory);
      setEditingCategory(null);
    } catch (error) {
      console.error('Update category error:', error);
    }
  };
  const deleteEmploymentCategory = (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId);
  };

  // Sub-project handlers
  const createSubProject = async () => {
    if (!newSubProjectName.trim() || !newSubProjectDisplayName.trim() || !selectedCategoryId) {
      toast({
        title: "Error",
        description: "Please provide sub-project name, display name, and select a category",
        variant: "destructive"
      });
      return;
    }
    try {
      await createSubProjectMutation.mutateAsync({
        category_id: selectedCategoryId,
        name: newSubProjectName,
        display_name: newSubProjectDisplayName,
        description: newSubProjectDescription || null
      });
      setNewSubProjectName('');
      setNewSubProjectDisplayName('');
      setNewSubProjectDescription('');
      setSelectedCategoryId('');
      setIsCreateSubProjectOpen(false);
    } catch (error) {
      console.error('Create sub-project error:', error);
    }
  };
  const updateSubProject = async () => {
    if (!editingSubProject || !editingSubProject.name || !editingSubProject.display_name) {
      toast({
        title: "Error",
        description: "Please provide sub-project name and display name",
        variant: "destructive"
      });
      return;
    }
    try {
      await updateSubProjectMutation.mutateAsync(editingSubProject);
      setEditingSubProject(null);
    } catch (error) {
      console.error('Update sub-project error:', error);
    }
  };
  const deleteSubProject = (subProjectId: string) => {
    deleteSubProjectMutation.mutate(subProjectId);
  };

  // Program handlers
  const createProgram = async () => {
    if (!newProgramName.trim() || !newProgramDescription.trim() || !selectedProgramCategoryId) {
      toast({
        title: "Error",
        description: "Please provide program name, description, and select a category",
        variant: "destructive"
      });
      return;
    }
    try {
      await createProgramMutation.mutateAsync({
        category_id: selectedProgramCategoryId,
        sub_project_id: selectedProgramSubProjectId || undefined,
        program_name: newProgramName,
        description: newProgramDescription,
        qualifications: newProgramQualifications || undefined
      });
      setNewProgramName('');
      setNewProgramDescription('');
      setNewProgramQualifications('');
      setSelectedProgramCategoryId('');
      setSelectedProgramSubProjectId('');
      setIsCreateProgramOpen(false);
    } catch (error) {
      console.error('Create program error:', error);
    }
  };
  const updateProgram = async () => {
    if (!editingProgram || !editingProgram.program_name || !editingProgram.description || !editingProgram.category_id) {
      toast({
        title: "Error",
        description: "Please provide program name, description, and category",
        variant: "destructive"
      });
      return;
    }
    try {
      await updateProgramMutation.mutateAsync(editingProgram);
      setEditingProgram(null);
    } catch (error) {
      console.error('Update program error:', error);
    }
  };
  const deleteProgram = (programId: string) => {
    deleteProgramMutation.mutate(programId);
  };
  const toggleMemberSelection = (registrationId: string) => {
    setSelectedMembers(prev => prev.includes(registrationId) ? prev.filter(id => id !== registrationId) : [...prev, registrationId]);
  };
  useEffect(() => {
    fetchRegistrations();
    fetchCategories();
    fetchPanchayaths();
  }, []);
  const filteredRegistrations = registrations.filter(reg => reg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || reg.mobile_number?.includes(searchTerm) || reg.address?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filter registrations for member selection by mobile number
  const filteredMemberRegistrations = registrations.filter(reg => reg.mobile_number?.includes(memberSearchTerm) || reg.full_name?.toLowerCase().includes(memberSearchTerm.toLowerCase()));

  // Helper function to get panchayath name by ID
  const getPanchayathName = (panchayathId: string) => {
    const panchayath = panchayaths.find(p => p.id === panchayathId);
    return panchayath?.name_english || panchayath?.name_malayalam || 'N/A';
  };

  // Helper function to get applicant details by user_id
  const getApplicantDetails = (userId: string) => {
    console.log('Looking for applicant with user_id:', userId);
    console.log('Available registrations:', registrations.length);
    console.log('Sample registration keys:', registrations.length > 0 ? Object.keys(registrations[0]) : 'no registrations');

    // Find registration by user_id (this should match program_applications.user_id with registrations.id)
    const registration = registrations.find(reg => reg.id === userId);
    if (registration) {
      console.log('Found matching registration:', {
        id: registration.id,
        mobile: registration.mobile_number,
        customer_id: registration.customer_id,
        full_name: registration.full_name
      });
      return {
        name: registration.full_name || 'N/A',
        mobile: registration.mobile_number || 'N/A',
        panchayath: getPanchayathName(registration.panchayath_id),
        ward: registration.ward || 'N/A',
        customerId: registration.customer_id || 'N/A',
        address: registration.address || 'N/A'
      };
    }
    console.log('No matching registration found for user_id:', userId);
    return {
      name: 'N/A',
      mobile: 'N/A',
      panchayath: 'N/A',
      ward: 'N/A',
      customerId: 'N/A',
      address: 'N/A'
    };
  };

  // Filter applications
  const filteredApplications = adminApplications.filter((application: any) => {
    if (applicationFilters.category && !application.programs?.employment_categories?.display_name?.includes(applicationFilters.category)) return false;
    if (applicationFilters.program && !application.programs?.program_name?.toLowerCase().includes(applicationFilters.program.toLowerCase())) return false;
    if (applicationFilters.status && application.status !== applicationFilters.status) return false;
    return true;
  });

  // Get unique values for filters
  const uniqueCategories = [...new Set(adminApplications.map((app: any) => app.programs?.employment_categories?.display_name).filter(Boolean))];
  const uniquePrograms = [...new Set(adminApplications.map((app: any) => app.programs?.program_name).filter(Boolean))];
  const uniqueStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
  return <div className="min-h-screen bg-gradient-to-br from-background via-purple/5 to-emerald/5 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage registrations for the self-employment program</p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6 bg-gradient-info border-info">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-info-foreground">
              <Users className="h-5 w-5" />
              Registration Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-zinc-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-info-foreground">{registrations.length}</div>
                <div className="text-sm text-info-foreground/70">Total Registrations</div>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-info-foreground">{categories.length}</div>
                <div className="text-sm text-info-foreground/70">Total Categories</div>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-info-foreground">{filteredRegistrations.length}</div>
                <div className="text-sm text-info-foreground/70">Filtered Results</div>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-info-foreground">100%</div>
                <div className="text-sm text-info-foreground/70">Data Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="mb-6 bg-gradient-orange border-orange">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-foreground/70" />
                <Input placeholder="Search by name, mobile, or address..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/10 border-white/20 text-orange-foreground placeholder:text-orange-foreground/50" />
              </div>
              <Button onClick={() => {
              fetchRegistrations();
              fetchCategories();
              fetchPanchayaths();
            }} disabled={loading} variant="outline" className="bg-white/10 border-white/20 text-orange-foreground hover:bg-white/20">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="registrations" className="w-full bg-gray-500">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Registrations ({filteredRegistrations.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categories ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Employment ({employmentCategories.length})
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Programs ({programs.length})
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Applications ({adminApplications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrations ({filteredRegistrations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {loading ? <div className="col-span-full flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading registrations...
                    </div> : filteredRegistrations.length === 0 ? <div className="col-span-full text-center py-8 text-muted-foreground">
                      No registrations found
                    </div> : filteredRegistrations.map((registration, index) => <Card key={registration.id || index} className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-sm truncate">
                                {registration.full_name || 'N/A'}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : registration.status === 'approved' ? 'bg-green-100 text-green-800' : registration.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                {registration.status || 'N/A'}
                              </span>
                            </div>
                            
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Mobile:</span>
                                <span>{registration.mobile_number || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">ID:</span>
                                <span>{registration.customer_id || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Category:</span>
                                <span className="truncate">{registration.categories?.name_english || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Panchayath:</span>
                                <span className="truncate">{getPanchayathName(registration.panchayath_id)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Ward:</span>
                                <span>{registration.ward || 'N/A'}</span>
                              </div>
                              {registration.fee && <div className="flex items-center gap-1">
                                  <span className="font-medium">Fee:</span>
                                  <span className="text-green-600 font-medium">₹{registration.fee}</span>
                                </div>}
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Created:</span>
                                <span>{registration.created_at ? new Date(registration.created_at).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                            
                            {registration.address && <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground truncate" title={registration.address}>
                                  <span className="font-medium">Address:</span> {registration.address}
                                </p>
                              </div>}
                          </div>
                        </CardContent>
                      </Card>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Categories ({categories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {loading ? <div className="col-span-full flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading categories...
                    </div> : categories.length === 0 ? <div className="col-span-full text-center py-8 text-muted-foreground">
                      No categories found
                    </div> : categories.map((category, index) => <Card key={category.id || index} className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-accent">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-sm truncate">
                                {category.name_english || 'N/A'}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {category.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">ID:</span>
                                <span className="text-primary font-medium">{category.id || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Malayalam:</span>
                                <span className="truncate">{category.name_malayalam || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Actual Fee:</span>
                                <span>{category.actual_fee ? `₹${category.actual_fee}` : 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Offer Fee:</span>
                                <span className="text-green-600 font-medium">{category.offer_fee ? `₹${category.offer_fee}` : 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Expiry:</span>
                                <span className="px-1 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                                  {category.expiry_days || 0} days
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Created:</span>
                                <span>{category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                            
                            {category.description && <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground truncate" title={category.description}>
                                  <span className="font-medium">Description:</span> {category.description}
                                </p>
                              </div>}
                          </div>
                        </CardContent>
                      </Card>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment" className="mt-6">
            <div className="space-y-6">
              {/* Employment Categories Section */}
              <Card className="bg-gradient-emerald border-emerald bg-cyan-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-emerald-foreground">
                      <Briefcase className="h-5 w-5" />
                      Categories ({categories.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="bg-white/10 border-white/20 text-emerald-foreground hover:bg-white/20">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create Employment Category</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="category-name">Name</Label>
                              <Input id="category-name" placeholder="Enter category name..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category-display">Display Name</Label>
                              <Input id="category-display" placeholder="Enter display name..." value={newCategoryDisplayName} onChange={e => setNewCategoryDisplayName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category-desc">Description</Label>
                              <Input id="category-desc" placeholder="Enter description (optional)..." value={newCategoryDescription} onChange={e => setNewCategoryDescription(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={createEmploymentCategory}>
                                Create Category
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isCreateSubProjectOpen} onOpenChange={setIsCreateSubProjectOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="bg-white/10 border-white/20 text-emerald-foreground hover:bg-white/20">
                            <FolderPlus className="h-4 w-4 mr-2" />
                            Add Sub-Project
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create Sub-Project</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="subproject-category">Category</Label>
                              <select id="subproject-category" className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background rounded-md" value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}>
                                <option value="">Select a category...</option>
                                {employmentCategories.map(category => <option key={category.id} value={category.id}>
                                    {category.display_name}
                                  </option>)}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="subproject-name">Name</Label>
                              <Input id="subproject-name" placeholder="Enter sub-project name..." value={newSubProjectName} onChange={e => setNewSubProjectName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="subproject-display">Display Name</Label>
                              <Input id="subproject-display" placeholder="Enter display name..." value={newSubProjectDisplayName} onChange={e => setNewSubProjectDisplayName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="subproject-desc">Description</Label>
                              <Input id="subproject-desc" placeholder="Enter description (optional)..." value={newSubProjectDescription} onChange={e => setNewSubProjectDescription(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsCreateSubProjectOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={createSubProject}>
                                Create Sub-Project
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {employmentCategories.length === 0 ? <div className="text-center py-8 text-emerald-foreground/70">
                        No employment categories found
                      </div> : employmentCategories.map(category => {
                    const categorySubProjects = allSubProjects.filter((subProject: any) => subProject.category_id === category.id);
                    return <Card key={category.id} className="border-l-4 border-l-emerald bg-white/10">
                            <CardHeader className="pb-3 bg-slate-800">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-lg text-emerald-foreground">{category.display_name || category.name || 'N/A'}</h3>
                                  <p className="text-sm text-emerald-foreground/70 mt-1">ID: {category.id}</p>
                                  <p className="text-xs text-emerald-foreground/50 mt-1">
                                    {categorySubProjects.length} sub-projects
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" onClick={() => setEditingCategory(category)} className="bg-white/10 border-white/20 text-emerald-foreground hover:bg-white/20">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => deleteEmploymentCategory(category.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {categorySubProjects.length === 0 ? <div className="col-span-full text-center py-4 text-emerald-foreground/50 text-sm">
                                    No sub-projects in this category
                                  </div> : categorySubProjects.map((subProject: any) => <Card key={subProject.id} className="border-emerald/30 bg-lime-700">
                                      <CardContent className="p-3">
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-sm text-emerald-foreground">{subProject.display_name}</h4>
                                            <div className="flex gap-1">
                                              <Button size="sm" variant="ghost" onClick={() => setEditingSubProject(subProject)} className="h-6 w-6 p-0 text-emerald-foreground/70 hover:text-emerald-foreground hover:bg-white/10">
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button size="sm" variant="ghost" onClick={() => deleteSubProject(subProject.id)} className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-white/10">
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                          <div className="text-xs text-emerald-foreground/60 space-y-1">
                                            <p><span className="font-medium">Name:</span> {subProject.name}</p>
                                            {subProject.description && <p><span className="font-medium">Description:</span> {subProject.description}</p>}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>)}
                              </div>
                            </CardContent>
                          </Card>;
                  })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Edit Category Dialog */}
            {editingCategory && <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Employment Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={editingCategory.name} onChange={e => setEditingCategory({
                    ...editingCategory,
                    name: e.target.value
                  })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input value={editingCategory.display_name} onChange={e => setEditingCategory({
                    ...editingCategory,
                    display_name: e.target.value
                  })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={editingCategory.description || ''} onChange={e => setEditingCategory({
                    ...editingCategory,
                    description: e.target.value
                  })} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingCategory(null)}>
                        Cancel
                      </Button>
                      <Button onClick={updateEmploymentCategory}>
                        Update Category
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>}

            {/* Edit Sub-Project Dialog */}
            {editingSubProject && <Dialog open={!!editingSubProject} onOpenChange={() => setEditingSubProject(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Sub-Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={editingSubProject.name} onChange={e => setEditingSubProject({
                    ...editingSubProject,
                    name: e.target.value
                  })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input value={editingSubProject.display_name} onChange={e => setEditingSubProject({
                    ...editingSubProject,
                    display_name: e.target.value
                  })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={editingSubProject.description || ''} onChange={e => setEditingSubProject({
                    ...editingSubProject,
                    description: e.target.value
                  })} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingSubProject(null)}>
                        Cancel
                      </Button>
                      <Button onClick={updateSubProject}>
                        Update Sub-Project
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>}
          </TabsContent>


          <TabsContent value="programs" className="mt-6">
            <Card className="bg-gradient-primary border-primary">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-primary-foreground">
                    <FolderPlus className="h-5 w-5" />
                    Programs ({programs.length})
                  </CardTitle>
                  <Dialog open={isCreateProgramOpen} onOpenChange={setIsCreateProgramOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="bg-white/20 border-white/30 text-primary-foreground hover:bg-white/30">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Program
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Program</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="program-name">Program Name</Label>
                          <Input id="program-name" value={newProgramName} onChange={e => setNewProgramName(e.target.value)} placeholder="Enter program name" />
                        </div>
                        <div>
                          <Label htmlFor="program-description">Description</Label>
                          <textarea id="program-description" value={newProgramDescription} onChange={e => setNewProgramDescription(e.target.value)} className="w-full min-h-[100px] p-2 border rounded-md" placeholder="Enter program description" />
                        </div>
                        <div>
                          <Label htmlFor="program-qualifications">Qualifications</Label>
                          <textarea id="program-qualifications" value={newProgramQualifications} onChange={e => setNewProgramQualifications(e.target.value)} className="w-full min-h-[80px] p-2 border rounded-md" placeholder="Enter qualifications (optional)" />
                        </div>
                        <div>
                          <Label htmlFor="program-category">Category</Label>
                          <Select value={selectedProgramCategoryId} onValueChange={setSelectedProgramCategoryId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {employmentCategories.map((category: any) => <SelectItem key={category.id} value={category.id}>
                                  {category.display_name}
                                </SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="program-subproject">Sub-Project (Optional)</Label>
                          <Select value={selectedProgramSubProjectId} onValueChange={(v) => setSelectedProgramSubProjectId(v === 'none' ? '' : v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-project" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {allSubProjects.filter((sub: any) => sub.category_id === selectedProgramCategoryId).map((subProject: any) => <SelectItem key={subProject.id} value={subProject.id}>
                                    {subProject.display_name}
                                  </SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={createProgram} className="w-full" disabled={createProgramMutation.isPending}>
                          {createProgramMutation.isPending ? 'Creating...' : 'Create Program'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-primary-foreground">Name</TableHead>
                        <TableHead className="text-primary-foreground">Category</TableHead>
                        <TableHead className="text-primary-foreground">Sub-Project</TableHead>
                        <TableHead className="text-primary-foreground">Description</TableHead>
                        <TableHead className="text-primary-foreground">Status</TableHead>
                        <TableHead className="text-primary-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {programsLoading ? <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-primary-foreground/70">
                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                            Loading programs...
                          </TableCell>
                        </TableRow> : programs.length === 0 ? <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-primary-foreground/70">
                            No programs found
                          </TableCell>
                        </TableRow> : programs.map((program: any) => <TableRow key={program.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="text-primary-foreground font-medium">
                              {program.program_name}
                            </TableCell>
                            <TableCell className="text-primary-foreground">
                              {program.employment_categories?.display_name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-primary-foreground">
                              {program.sub_projects?.display_name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-primary-foreground max-w-xs truncate">
                              {program.description}
                            </TableCell>
                            <TableCell className="text-primary-foreground">
                              <span className={`px-2 py-1 rounded text-xs ${program.status === 'active' ? 'bg-green-500 text-white' : program.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'}`}>
                                {program.status || 'pending'}
                              </span>
                            </TableCell>
                            <TableCell className="text-primary-foreground">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20" onClick={() => setEditingProgram(program)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteProgram(program.id)} disabled={deleteProgramMutation.isPending}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>)}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Edit Program Dialog */}
            {editingProgram && <Dialog open={!!editingProgram} onOpenChange={() => setEditingProgram(null)}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Program</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-program-name">Program Name</Label>
                      <Input id="edit-program-name" value={editingProgram.program_name || ''} onChange={e => setEditingProgram({
                    ...editingProgram,
                    program_name: e.target.value
                  })} placeholder="Enter program name" />
                    </div>
                    <div>
                      <Label htmlFor="edit-program-description">Description</Label>
                      <textarea id="edit-program-description" value={editingProgram.description || ''} onChange={e => setEditingProgram({
                    ...editingProgram,
                    description: e.target.value
                  })} className="w-full min-h-[100px] p-2 border rounded-md" placeholder="Enter program description" />
                    </div>
                    <div>
                      <Label htmlFor="edit-program-qualifications">Qualifications</Label>
                      <textarea id="edit-program-qualifications" value={editingProgram.qualifications || ''} onChange={e => setEditingProgram({
                    ...editingProgram,
                    qualifications: e.target.value
                  })} className="w-full min-h-[80px] p-2 border rounded-md" placeholder="Enter qualifications" />
                    </div>
                    <div>
                      <Label htmlFor="edit-program-category">Category</Label>
                      <Select value={editingProgram.category_id} onValueChange={value => setEditingProgram({
                    ...editingProgram,
                    category_id: value
                  })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {employmentCategories.map((category: any) => <SelectItem key={category.id} value={category.id}>
                              {category.display_name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-program-subproject">Sub-Project</Label>
                      <Select value={editingProgram.sub_project_id || ''} onValueChange={(value) => setEditingProgram({
                    ...editingProgram,
                    sub_project_id: value === 'none' ? null : value || null
                  })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {allSubProjects.filter((sub: any) => sub.category_id === editingProgram.category_id).map((subProject: any) => <SelectItem key={subProject.id} value={subProject.id}>
                                {subProject.display_name}
                              </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={updateProgram} className="w-full" disabled={updateProgramMutation.isPending}>
                      {updateProgramMutation.isPending ? 'Updating...' : 'Update Program'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>}
          </TabsContent>


          <TabsContent value="teams" className="mt-6">
            <Card className="bg-gradient-to-r from-warning to-orange border-warning">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-warning-foreground">
                    <UserPlus className="h-5 w-5" />
                    Teams ({teams.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Team
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Create New Team</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="team-name">Team Name</Label>
                            <Input id="team-name" placeholder="Enter team name..." value={newTeamName} onChange={e => setNewTeamName(e.target.value)} />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Select Members</Label>
                            <div className="space-y-2">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search by mobile number or name..." value={memberSearchTerm} onChange={e => setMemberSearchTerm(e.target.value)} className="pl-10" />
                              </div>
                              <div className="border rounded-md max-h-60 overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-12">Select</TableHead>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Mobile</TableHead>
                                      <TableHead>Category</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {filteredMemberRegistrations.length === 0 ? <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                          No members found matching search criteria
                                        </TableCell>
                                      </TableRow> : filteredMemberRegistrations.map(registration => <TableRow key={registration.id}>
                                          <TableCell>
                                            <Checkbox checked={selectedMembers.includes(registration.id)} onCheckedChange={() => toggleMemberSelection(registration.id)} />
                                          </TableCell>
                                          <TableCell className="font-medium">
                                            {registration.full_name || 'N/A'}
                                          </TableCell>
                                          <TableCell>{registration.mobile_number || 'N/A'}</TableCell>
                                          <TableCell>
                                            {registration.categories?.name_english || 'N/A'}
                                          </TableCell>
                                        </TableRow>)}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Selected: {selectedMembers.length} members | Showing: {filteredMemberRegistrations.length} of {registrations.length} total
                            </p>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={createTeam} disabled={createTeamMutation.isPending}>
                              Create Team
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" disabled={teams.length === 0}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Add Members to Team</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Select Team</Label>
                            <select className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background rounded-md" value={selectedTeamId || ''} onChange={e => setSelectedTeamId(e.target.value)}>
                              <option value="">Choose a team...</option>
                              {teams.map(team => <option key={team.id} value={team.id}>
                                  {team.name} ({team.member_count} members)
                                </option>)}
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Select Members to Add</Label>
                            <div className="space-y-2">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search by mobile number or name..." value={memberSearchTerm} onChange={e => setMemberSearchTerm(e.target.value)} className="pl-10" />
                              </div>
                              <div className="border rounded-md max-h-60 overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-12">Select</TableHead>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Mobile</TableHead>
                                      <TableHead>Category</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {filteredMemberRegistrations.length === 0 ? <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                          No members found matching search criteria
                                        </TableCell>
                                      </TableRow> : filteredMemberRegistrations.map(registration => <TableRow key={registration.id}>
                                          <TableCell>
                                            <Checkbox checked={selectedMembers.includes(registration.id)} onCheckedChange={() => toggleMemberSelection(registration.id)} />
                                          </TableCell>
                                          <TableCell className="font-medium">
                                            {registration.full_name || 'N/A'}
                                          </TableCell>
                                          <TableCell>{registration.mobile_number || 'N/A'}</TableCell>
                                          <TableCell>
                                            {registration.categories?.name_english || 'N/A'}
                                          </TableCell>
                                        </TableRow>)}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Selected: {selectedMembers.length} members
                            </p>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={addMembersToTeam} disabled={addMemberMutation.isPending}>
                              Add Members
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamsLoading ? <div className="col-span-full flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading teams...
                    </div> : teams.length === 0 ? <div className="col-span-full text-center py-8 text-muted-foreground">
                      No teams created yet. Click "Create Team" to get started.
                    </div> : teams.map(team => <Card key={team.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-secondary">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-sm truncate">
                                {team.name}
                              </h3>
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" onClick={() => openAddMemberDialog(team.id)} className="h-6 w-6 p-0">
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteTeam(team.id)} className="h-6 w-6 p-0">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Members:</span>
                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  {team.member_count} members
                                </span>
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Created:</span>
                                <span className="ml-1">{new Date(team.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Team Members:</p>
                              <div className="space-y-1">
                                {team.members.length === 0 ? <p className="text-xs text-muted-foreground">No members yet</p> : <>
                                    {team.members.slice(0, 3).map((member, index) => <div key={index} className="flex items-center justify-between">
                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 truncate flex-1 mr-1">
                                          {member.member_name}
                                        </span>
                                        <Button variant="ghost" size="sm" onClick={() => removeMemberFromTeam(team.id, member.member_id)} className="h-5 w-5 p-0 text-red-500 hover:text-red-700">
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                      </div>)}
                                    {team.members.length > 3 && <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                        +{team.members.length - 3} more
                                      </span>}
                                  </>}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <Card className="bg-gradient-to-r from-success to-emerald border-success">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 text-success-foreground">
                    <CheckCircle className="h-5 w-5" />
                    Program Applications ({filteredApplications.length} of {adminApplications.length})
                  </CardTitle>
                  
                  {/* Filter Controls */}
                  <div className="flex flex-wrap gap-2">
                    <Select value={applicationFilters.category || "all-categories"} onValueChange={value => setApplicationFilters(prev => ({
                    ...prev,
                    category: value === "all-categories" ? "" : value
                  }))}>
                      <SelectTrigger className="w-48 bg-white/10 border-white/20 text-success-foreground">
                        <SelectValue placeholder="Filter by Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">All Categories</SelectItem>
                        {uniqueCategories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={applicationFilters.program || "all-programs"} onValueChange={value => setApplicationFilters(prev => ({
                    ...prev,
                    program: value === "all-programs" ? "" : value
                  }))}>
                      <SelectTrigger className="w-48 bg-white/10 border-white/20 text-success-foreground">
                        <SelectValue placeholder="Filter by Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-programs">All Programs</SelectItem>
                        {uniquePrograms.map(program => <SelectItem key={program} value={program}>{program}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={applicationFilters.status || "all-statuses"} onValueChange={value => setApplicationFilters(prev => ({
                    ...prev,
                    status: value === "all-statuses" ? "" : value
                  }))}>
                      <SelectTrigger className="w-48 bg-white/10 border-white/20 text-success-foreground">
                        <SelectValue placeholder="Filter by Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-statuses">All Statuses</SelectItem>
                        {uniqueStatuses.map(status => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" onClick={() => setApplicationFilters({
                    panchayath: '',
                    category: '',
                    subProject: '',
                    program: '',
                    status: ''
                  })} className="bg-white/10 border-white/20 text-success-foreground hover:bg-white/20">
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {applicationsLoading ? <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading applications...
                  </div> : filteredApplications.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    {adminApplications.length === 0 ? "No applications submitted yet." : "No applications match the current filters."}
                  </div> : <div className="rounded-md border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Category</TableHead>
                          <TableHead className="font-semibold">Sub-Project</TableHead>
                          <TableHead className="font-semibold">Applied Program</TableHead>
                          <TableHead className="font-semibold">Applicant Details</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Applied Date</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((application: any) => <TableRow key={application.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {application.programs?.employment_categories?.display_name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {application.programs?.sub_project_id ? allSubProjects.find((sp: any) => sp.id === application.programs.sub_project_id)?.display_name || 'N/A' : 'N/A'}
                            </TableCell>
                            <TableCell className="font-medium">
                              {application.programs?.program_name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {(() => {
                            const applicantDetails = getApplicantDetails(application.user_id);
                            return <>
                                      <div className="font-medium">{applicantDetails.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Mobile: {applicantDetails.mobile}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Customer ID: {applicantDetails.customerId}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Panchayath: {applicantDetails.panchayath}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Ward: {applicantDetails.ward}
                                      </div>
                                      {applicantDetails.address !== 'N/A' && <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate" title={applicantDetails.address}>
                                          Address: {applicantDetails.address}
                                        </div>}
                                    </>;
                          })()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : application.status === 'approved' ? 'bg-green-100 text-green-800' : application.status === 'rejected' ? 'bg-red-100 text-red-800' : application.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                                {application.status}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(application.applied_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {/* Edit Button - Always available */}
                                <Button size="sm" variant="outline" onClick={() => setEditingApplication(application)} className="h-7 px-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                
                                {/* Delete Button - Always available */}
                                <Button size="sm" variant="destructive" onClick={() => deleteApplicationMutation.mutate(application.id)} disabled={deleteApplicationMutation.isPending} className="h-7 px-2">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                                
                                {/* Status Actions - Only for pending applications */}
                                {application.status === 'pending' && <>
                                    <Button size="sm" onClick={() => updateApplicationStatusMutation.mutate({
                              applicationId: application.id,
                              status: 'approved'
                            })} disabled={updateApplicationStatusMutation.isPending} className="bg-green-600 hover:bg-green-700 h-7 px-2">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => updateApplicationStatusMutation.mutate({
                              applicationId: application.id,
                              status: 'rejected'
                            })} disabled={updateApplicationStatusMutation.isPending} className="h-7 px-2">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => updateApplicationStatusMutation.mutate({
                              applicationId: application.id,
                              status: 'cancelled'
                            })} disabled={updateApplicationStatusMutation.isPending} className="h-7 px-2">
                                      Cancel
                                    </Button>
                                  </>}
                              </div>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>}
              </CardContent>
            </Card>

            {/* Program Requests */}
            <Card className="bg-gradient-to-r from-warning to-orange border-warning mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning-foreground">
                  <Clock className="h-5 w-5" />
                  Program Requests ({adminRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading requests...
                  </div> : adminRequests.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    No requests submitted yet.
                  </div> : <div className="space-y-4">
                    {adminRequests.map((request: any) => <div key={request.id} className="bg-card border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-foreground capitalize">
                                {request.request_type.replace('-', ' ')} Request
                              </h4>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : request.status === 'approved' ? 'bg-green-100 text-green-800' : request.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                {request.status}
                              </div>
                            </div>
                            {request.message && <p className="text-sm text-muted-foreground mt-1">
                                Message: {request.message}
                              </p>}
                            <p className="text-sm text-muted-foreground">
                              User ID: {request.user_id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Requested on: {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {/* Delete Button - Always available */}
                            <Button size="sm" variant="destructive" onClick={() => deleteRequestMutation.mutate(request.id)} disabled={deleteRequestMutation.isPending} className="h-7 px-2">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                            
                            {/* Status Actions - Only for pending requests */}
                            {request.status === 'pending' && <>
                                <Button size="sm" onClick={() => updateRequestStatusMutation.mutate({
                          requestId: request.id,
                          status: 'approved'
                        })} disabled={updateRequestStatusMutation.isPending} className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => updateRequestStatusMutation.mutate({
                          requestId: request.id,
                          status: 'rejected'
                        })} disabled={updateRequestStatusMutation.isPending}>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>}
                          </div>
                        </div>
                      </div>)}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={open => !open && setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employment Category</DialogTitle>
            </DialogHeader>
            {editingCategory && <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category-name">Name</Label>
                  <Input id="edit-category-name" value={editingCategory.name} onChange={e => setEditingCategory({
                ...editingCategory,
                name: e.target.value
              })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category-display">Display Name</Label>
                  <Input id="edit-category-display" value={editingCategory.display_name} onChange={e => setEditingCategory({
                ...editingCategory,
                display_name: e.target.value
              })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category-desc">Description</Label>
                  <Input id="edit-category-desc" value={editingCategory.description || ''} onChange={e => setEditingCategory({
                ...editingCategory,
                description: e.target.value
              })} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </Button>
                  <Button onClick={updateEmploymentCategory}>
                    Update Category
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Edit Sub-Project Dialog */}
        <Dialog open={!!editingSubProject} onOpenChange={open => !open && setEditingSubProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Sub-Project</DialogTitle>
            </DialogHeader>
            {editingSubProject && <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-subproject-name">Name</Label>
                  <Input id="edit-subproject-name" value={editingSubProject.name} onChange={e => setEditingSubProject({
                ...editingSubProject,
                name: e.target.value
              })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subproject-display">Display Name</Label>
                  <Input id="edit-subproject-display" value={editingSubProject.display_name} onChange={e => setEditingSubProject({
                ...editingSubProject,
                display_name: e.target.value
              })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subproject-desc">Description</Label>
                  <Input id="edit-subproject-desc" value={editingSubProject.description || ''} onChange={e => setEditingSubProject({
                ...editingSubProject,
                description: e.target.value
              })} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingSubProject(null)}>
                    Cancel
                  </Button>
                  <Button onClick={updateSubProject}>
                    Update Sub-Project
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Edit Application Dialog */}
        <Dialog open={!!editingApplication} onOpenChange={open => !open && setEditingApplication(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
            </DialogHeader>
            {editingApplication && <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Applicant Details</Label>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {(() => {
                  const applicantDetails = getApplicantDetails(editingApplication.user_id);
                  return <>
                          <p><strong>Name:</strong> {applicantDetails.name}</p>
                          <p><strong>Mobile:</strong> {applicantDetails.mobile}</p>
                          <p><strong>Customer ID:</strong> {applicantDetails.customerId}</p>
                          <p><strong>Panchayath:</strong> {applicantDetails.panchayath}</p>
                          <p><strong>Ward:</strong> {applicantDetails.ward}</p>
                        </>;
                })()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Program</Label>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p><strong>Program:</strong> {editingApplication.programs?.program_name || 'N/A'}</p>
                    <p><strong>Category:</strong> {editingApplication.programs?.employment_categories?.display_name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-application-status">Status</Label>
                  <Select value={editingApplication.status} onValueChange={value => setEditingApplication({
                ...editingApplication,
                status: value
              })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingApplication(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                updateApplicationStatusMutation.mutate({
                  applicationId: editingApplication.id,
                  status: editingApplication.status
                });
                setEditingApplication(null);
              }} disabled={updateApplicationStatusMutation.isPending}>
                    Update Application
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>
      </div>
    </div>;
};
export default Admin;