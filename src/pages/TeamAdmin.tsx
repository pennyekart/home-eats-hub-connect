import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Users, FileText, Calendar, Eye, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePrograms, useCreateProgram, useUpdateProgram, useDeleteProgram } from '@/hooks/usePrograms';
import { useAllApplications, useUpdateApplicationStatus } from '@/hooks/useProgramApplications';
import { useTeams } from '@/hooks/useTeams';
import { useEmploymentCategories, useAllSubProjects } from '@/hooks/useEmploymentCategories';
import { format } from 'date-fns';

const TeamAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  
  // Program management states
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDescription, setNewProgramDescription] = useState('');
  const [newProgramQualifications, setNewProgramQualifications] = useState('');
  const [selectedProgramCategoryId, setSelectedProgramCategoryId] = useState('');
  const [selectedProgramSubProjectId, setSelectedProgramSubProjectId] = useState('');

  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: applications, isLoading: applicationsLoading } = useAllApplications();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: employmentCategories = [] } = useEmploymentCategories();
  const { data: allSubProjects = [] } = useAllSubProjects();
  
  // Mutations
  const createProgramMutation = useCreateProgram();
  const updateProgramMutation = useUpdateProgram();
  const deleteProgramMutation = useDeleteProgram();
  const updateApplicationStatusMutation = useUpdateApplicationStatus();

  const filteredPrograms = programs?.filter(program =>
    program.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications?.filter(app =>
    app.programs?.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgramApplications = (programId: string) => {
    return applications?.filter(app => app.program_id === programId) || [];
  };

  // Program handlers
  const createProgram = async () => {
    if (!newProgramName.trim() || !newProgramDescription.trim() || !selectedProgramCategoryId) {
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

  const updateApplicationStatus = (applicationId: string, status: string) => {
    updateApplicationStatusMutation.mutate({ applicationId, status });
  };

  // Group programs by category
  const programsByCategory = employmentCategories.reduce((acc, category) => {
    const categoryPrograms = filteredPrograms?.filter(program => 
      program.category_id === category.id
    ) || [];
    if (categoryPrograms.length > 0) {
      acc[category.id] = {
        category,
        programs: categoryPrograms
      };
    }
    return acc;
  }, {} as Record<string, { category: any, programs: any[] }>);

  // Group sub-projects by category for display
  const subProjectsByCategory = allSubProjects.reduce((acc, subProject) => {
    if (!acc[subProject.category_id]) {
      acc[subProject.category_id] = [];
    }
    acc[subProject.category_id].push(subProject);
    return acc;
  }, {} as Record<string, any[]>);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (programsLoading || applicationsLoading || teamsLoading) {
    return (
      <div className="container mx-auto max-w-7xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Team Admin Panel</h1>
        <p className="text-muted-foreground">Manage programs and track applications</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">Programs Management</div>
            <Dialog open={isCreateProgramOpen} onOpenChange={setIsCreateProgramOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Program</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="program-name">Program Name</Label>
                    <Input
                      id="program-name"
                      value={newProgramName}
                      onChange={(e) => setNewProgramName(e.target.value)}
                      placeholder="Enter program name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="program-description">Description</Label>
                    <Textarea
                      id="program-description"
                      value={newProgramDescription}
                      onChange={(e) => setNewProgramDescription(e.target.value)}
                      placeholder="Enter program description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="program-category">Employment Category</Label>
                    <Select value={selectedProgramCategoryId} onValueChange={setSelectedProgramCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="program-subproject">Sub Project (Optional)</Label>
                    <Select value={selectedProgramSubProjectId} onValueChange={setSelectedProgramSubProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub project" />
                      </SelectTrigger>
                      <SelectContent>
                        {allSubProjects.map((subProject) => (
                          <SelectItem key={subProject.id} value={subProject.id}>
                            {subProject.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="program-qualifications">Qualifications (Optional)</Label>
                    <Textarea
                      id="program-qualifications"
                      value={newProgramQualifications}
                      onChange={(e) => setNewProgramQualifications(e.target.value)}
                      placeholder="Enter required qualifications"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsCreateProgramOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createProgram}>Create Program</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {Object.entries(programsByCategory).map(([categoryId, { category, programs }]) => {
              const categorySubProjects = subProjectsByCategory[categoryId] || [];
              const isExpanded = expandedCategories[categoryId];
              
              return (
                <Card key={categoryId} className="overflow-hidden">
                  <Collapsible 
                    open={isExpanded} 
                    onOpenChange={() => toggleCategory(categoryId)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <FolderOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{category.display_name}</CardTitle>
                              <CardDescription>
                                {category.description || 'Employment category'}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {programs.length} programs
                            </Badge>
                            {isExpanded ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {/* Sub-projects */}
                        {categorySubProjects.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Sub-projects:</h4>
                            <div className="flex flex-wrap gap-2">
                              {categorySubProjects.map((subProject) => (
                                <Badge key={subProject.id} variant="outline" className="text-xs">
                                  {subProject.display_name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Programs Table */}
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Program Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Sub-project</TableHead>
                                <TableHead>Applications</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {programs.map((program) => {
                                const programApplications = getProgramApplications(program.id);
                                const subProject = allSubProjects.find(sp => sp.id === program.sub_project_id);
                                
                                return (
                                  <TableRow key={program.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                      {program.program_name}
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                      <div className="truncate" title={program.description}>
                                        {program.description}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {subProject ? (
                                        <Badge variant="outline" className="text-xs">
                                          {subProject.display_name}
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          {programApplications.length}
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSelectedProgram(selectedProgram === program.id ? null : program.id)}
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                                        {program.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {format(new Date(program.created_at), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex gap-1 justify-end">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setEditingProgram(program)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteProgram(program.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* Application Details */}
                        {selectedProgram && programs.some(p => p.id === selectedProgram) && (
                          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                            <h4 className="font-medium mb-3">Applications for {programs.find(p => p.id === selectedProgram)?.program_name}</h4>
                            {getProgramApplications(selectedProgram).length > 0 ? (
                              <div className="space-y-2">
                                {getProgramApplications(selectedProgram).map((app) => (
                                  <div key={app.id} className="flex items-center justify-between p-3 bg-background rounded-md border">
                                    <div className="text-sm">
                                      <div className="font-medium">Application #{app.id.slice(0, 8)}</div>
                                      <div className="text-muted-foreground text-xs">
                                        Applied: {format(new Date(app.applied_at), 'MMM dd, yyyy HH:mm')}
                                      </div>
                                      <div className="text-muted-foreground text-xs">
                                        User: {app.user_id.slice(0, 8)}...
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getStatusColor(app.status)}>
                                        {app.status}
                                      </Badge>
                                      {app.status === 'pending' && (
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateApplicationStatus(app.id, 'approved')}
                                          >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Approve
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                          >
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Reject
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No applications yet.</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
            
            {Object.keys(programsByCategory).length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No programs found</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="text-lg font-semibold">Applications Management</div>
          <div className="grid gap-4">
            {filteredApplications?.map((application) => (
              <Card key={application.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Application #{application.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        Program: {application.programs?.program_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Applied: {format(new Date(application.applied_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        User ID: {application.user_id.slice(0, 8)}...
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                      {application.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateApplicationStatus(application.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams?.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  {team.description && (
                    <CardDescription>{team.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{team.member_count} members</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Created: {format(new Date(team.created_at), 'MMM dd, yyyy')}
                    </div>

                    {team.members.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Members:</h4>
                        {team.members.slice(0, 3).map((member) => (
                          <div key={member.id} className="text-sm p-2 bg-muted rounded-md">
                            <div className="font-medium">{member.member_name}</div>
                            {member.member_mobile && (
                              <div className="text-muted-foreground text-xs">{member.member_mobile}</div>
                            )}
                          </div>
                        ))}
                        {team.members.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{team.members.length - 3} more members
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Program Dialog */}
      {editingProgram && (
        <Dialog open={!!editingProgram} onOpenChange={() => setEditingProgram(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-program-name">Program Name</Label>
                <Input
                  id="edit-program-name"
                  value={editingProgram.program_name}
                  onChange={(e) => setEditingProgram({...editingProgram, program_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-program-description">Description</Label>
                <Textarea
                  id="edit-program-description"
                  value={editingProgram.description}
                  onChange={(e) => setEditingProgram({...editingProgram, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-program-category">Employment Category</Label>
                <Select 
                  value={editingProgram.category_id} 
                  onValueChange={(value) => setEditingProgram({...editingProgram, category_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-program-qualifications">Qualifications</Label>
                <Textarea
                  id="edit-program-qualifications"
                  value={editingProgram.qualifications || ''}
                  onChange={(e) => setEditingProgram({...editingProgram, qualifications: e.target.value})}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingProgram(null)}>
                  Cancel
                </Button>
                <Button onClick={updateProgram}>Update Program</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamAdmin;