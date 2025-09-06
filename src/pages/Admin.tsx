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
import { Search, RefreshCw, Users, Tag, UserPlus, Trash2, Plus, Minus } from 'lucide-react';
import { useTeams, useCreateTeam, useDeleteTeam, useAddTeamMember, useRemoveTeamMember } from '@/hooks/useTeams';

const Admin = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [panchayaths, setPanchayaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Team hooks
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const createTeamMutation = useCreateTeam();
  const deleteTeamMutation = useDeleteTeam();
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  const fetchPanchayaths = async () => {
    try {
      // Create a Supabase client to fetch from external database
      const { createClient } = await import('@supabase/supabase-js');
      const externalSupabase = createClient(
        'https://mbvxiphgomdtoaqzmbgv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo'
      );
      
      const { data, error } = await externalSupabase
        .from('panchayaths')
        .select('id, name_english, name_malayalam')
        .order('name_english', { ascending: true });

      if (error) throw error;

      setPanchayaths(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} panchayaths`,
      });
    } catch (error) {
      console.error('Panchayaths fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch panchayaths",
        variant: "destructive"
      });
    }
  };

  const fetchCategories = async () => {
    try {
      // Create a Supabase client to fetch from external database
      const { createClient } = await import('@supabase/supabase-js');
      const externalSupabase = createClient(
        'https://mbvxiphgomdtoaqzmbgv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo'
      );
      
      const { data, error } = await externalSupabase
        .from('categories')
        .select('id, *')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCategories(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} categories`,
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
      const { createClient } = await import('@supabase/supabase-js');
      const externalSupabase = createClient(
        'https://mbvxiphgomdtoaqzmbgv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo'
      );
      
      // First try without panchayaths to see what's available
      const { data, error } = await externalSupabase
        .from('registrations')
        .select(`
          *, 
          categories!category_id(name_english, name_malayalam)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} registrations`,
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
      const selectedRegistrations = registrations.filter(reg => 
        selectedMembers.includes(reg.id)
      );

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
      const selectedRegistrations = registrations.filter(reg => 
        selectedMembers.includes(reg.id)
      );

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
    removeMemberMutation.mutate({ teamId, memberId });
  };

  const toggleMemberSelection = (registrationId: string) => {
    setSelectedMembers(prev => 
      prev.includes(registrationId)
        ? prev.filter(id => id !== registrationId)
        : [...prev, registrationId]
    );
  };

  useEffect(() => {
    fetchRegistrations();
    fetchCategories();
    fetchPanchayaths();
  }, []);

  const filteredRegistrations = registrations.filter(reg =>
    reg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.mobile_number?.includes(searchTerm) ||
    reg.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter registrations for member selection by mobile number
  const filteredMemberRegistrations = registrations.filter(reg =>
    reg.mobile_number?.includes(memberSearchTerm) ||
    reg.full_name?.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  // Helper function to get panchayath name by ID
  const getPanchayathName = (panchayathId: string) => {
    const panchayath = panchayaths.find(p => p.id === panchayathId);
    return panchayath?.name_english || panchayath?.name_malayalam || 'N/A';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage registrations for the self-employment program</p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registration Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{registrations.length}</div>
                <div className="text-sm text-muted-foreground">Total Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Total Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{filteredRegistrations.length}</div>
                <div className="text-sm text-muted-foreground">Filtered Results</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">100%</div>
                <div className="text-sm text-muted-foreground">Data Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => { fetchRegistrations(); fetchCategories(); fetchPanchayaths(); }} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Registrations ({filteredRegistrations.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categories ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Teams ({teams.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrations ({filteredRegistrations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {loading ? (
                    <div className="col-span-full flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading registrations...
                    </div>
                  ) : filteredRegistrations.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No registrations found
                    </div>
                  ) : (
                    filteredRegistrations.map((registration, index) => (
                      <Card 
                        key={registration.id || index} 
                        className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-sm truncate">
                                {registration.full_name || 'N/A'}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                registration.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : registration.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : registration.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'}`
                              }>
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
                              {registration.fee && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Fee:</span>
                                  <span className="text-green-600 font-medium">₹{registration.fee}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Created:</span>
                                <span>{registration.created_at ? new Date(registration.created_at).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                            
                            {registration.address && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground truncate" title={registration.address}>
                                  <span className="font-medium">Address:</span> {registration.address}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
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
                  {loading ? (
                    <div className="col-span-full flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading categories...
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No categories found
                    </div>
                  ) : (
                    categories.map((category, index) => (
                      <Card 
                        key={category.id || index}
                        className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-accent"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-sm truncate">
                                {category.name_english || 'N/A'}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                category.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'}`
                              }>
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
                            
                            {category.description && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground truncate" title={category.description}>
                                  <span className="font-medium">Description:</span> {category.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
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
                            <Input
                              id="team-name"
                              placeholder="Enter team name..."
                              value={newTeamName}
                              onChange={(e) => setNewTeamName(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Select Members</Label>
                            <div className="space-y-2">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search by mobile number or name..."
                                  value={memberSearchTerm}
                                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                                  className="pl-10"
                                />
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
                                    {filteredMemberRegistrations.length === 0 ? (
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                          No members found matching search criteria
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      filteredMemberRegistrations.map((registration) => (
                                        <TableRow key={registration.id}>
                                          <TableCell>
                                            <Checkbox
                                              checked={selectedMembers.includes(registration.id)}
                                              onCheckedChange={() => toggleMemberSelection(registration.id)}
                                            />
                                          </TableCell>
                                          <TableCell className="font-medium">
                                            {registration.full_name || 'N/A'}
                                          </TableCell>
                                          <TableCell>{registration.mobile_number || 'N/A'}</TableCell>
                                          <TableCell>
                                            {registration.categories?.name_english || 'N/A'}
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    )}
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
                            <select 
                              className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background rounded-md"
                              value={selectedTeamId || ''}
                              onChange={(e) => setSelectedTeamId(e.target.value)}
                            >
                              <option value="">Choose a team...</option>
                              {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                  {team.name} ({team.member_count} members)
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Select Members to Add</Label>
                            <div className="space-y-2">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search by mobile number or name..."
                                  value={memberSearchTerm}
                                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                                  className="pl-10"
                                />
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
                                    {filteredMemberRegistrations.length === 0 ? (
                                      <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                          No members found matching search criteria
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      filteredMemberRegistrations.map((registration) => (
                                        <TableRow key={registration.id}>
                                          <TableCell>
                                            <Checkbox
                                              checked={selectedMembers.includes(registration.id)}
                                              onCheckedChange={() => toggleMemberSelection(registration.id)}
                                            />
                                          </TableCell>
                                          <TableCell className="font-medium">
                                            {registration.full_name || 'N/A'}
                                          </TableCell>
                                          <TableCell>{registration.mobile_number || 'N/A'}</TableCell>
                                          <TableCell>
                                            {registration.categories?.name_english || 'N/A'}
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    )}
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
                  {teamsLoading ? (
                    <div className="col-span-full flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading teams...
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No teams created yet. Click "Create Team" to get started.
                    </div>
                  ) : (
                    teams.map((team) => (
                      <Card 
                        key={team.id}
                        className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-secondary"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-sm truncate">
                                {team.name}
                              </h3>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAddMemberDialog(team.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteTeam(team.id)}
                                  className="h-6 w-6 p-0"
                                >
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
                                {team.members.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No members yet</p>
                                ) : (
                                  <>
                                    {team.members.slice(0, 3).map((member, index) => (
                                      <div key={index} className="flex items-center justify-between">
                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 truncate flex-1 mr-1">
                                          {member.member_name}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeMemberFromTeam(team.id, member.member_id)}
                                          className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    {team.members.length > 3 && (
                                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                        +{team.members.length - 3} more
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;