import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, User, Phone, MapPin, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEmploymentCategories, useAllSubProjects } from '@/hooks/useEmploymentCategories';
import { usePrograms, useCreateProgram } from '@/hooks/usePrograms';
import { useUserApplications, useApplyToProgram, useCreateRequest } from '@/hooks/useProgramApplications';
import Navigation from '@/components/Navigation';
import MultipleApplicationPopup from '@/components/MultipleApplicationPopup';

interface LandingPageProps {
  userData: any;
  onLogout: () => void;
}

const LandingPage = ({
  userData,
  onLogout
}: LandingPageProps) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'jobs' | 'programs' | 'profile'>('dashboard');
  const [showAddProgramForm, setShowAddProgramForm] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showMultipleApplicationPopup, setShowMultipleApplicationPopup] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [programForm, setProgramForm] = useState({
    programName: '',
    description: '',
    qualifications: '',
    categoryId: '',
    subProjectId: ''
  });
  const { toast } = useToast();

  // Fetch employment categories, sub-projects, and programs from database
  const { data: categories = [], isLoading: categoriesLoading } = useEmploymentCategories();
  const { data: allSubProjects = [], isLoading: subProjectsLoading } = useAllSubProjects();
  // Filter programs based on user's registration category
  console.log("userData in LandingPage:", userData);
  console.log("userData.category_name:", userData?.categories?.name_english);
  const { data: programs = [], isLoading: programsLoading } = usePrograms(userData?.categories?.name_english);
  const createProgramMutation = useCreateProgram();
  
  // Program applications
  const { data: userApplications = [], isLoading: applicationsLoading } = useUserApplications(userData);
  const applyToProgramMutation = useApplyToProgram(userData);
  const createRequestMutation = useCreateRequest(userData);

  // Group sub-projects by category for easy access
  const categorySubProjects = allSubProjects.reduce((acc, subProject) => {
    const categoryName = subProject.employment_categories?.name;
    if (categoryName) {
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(subProject);
    }
    return acc;
  }, {} as Record<string, any[]>);

  const handleSelectJob = () => {
    setCurrentView('jobs');
  };

  const handleAddProgram = () => {
    setShowAddProgramForm(true);
  };

  const handleCategorySelect = (categoryId: string, subProjectId: string) => {
    setProgramForm(prev => ({
      ...prev,
      categoryId: categoryId,
      subProjectId: subProjectId
    }));
    setShowAddProgramForm(true);
  };

  const handleProgramSubmit = async () => {
    if (!programForm.programName || !programForm.description || !programForm.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createProgramMutation.mutateAsync({
        category_id: programForm.categoryId,
        sub_project_id: programForm.subProjectId || undefined,
        program_name: programForm.programName,
        description: programForm.description,
        qualifications: programForm.qualifications || undefined,
      });
      
      // Reset form
      setProgramForm({
        programName: '',
        description: '',
        qualifications: '',
        categoryId: '',
        subProjectId: ''
      });
      setShowAddProgramForm(false);
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Program submission error:', error);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setProgramForm(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyToProgram = async (programId: string) => {
    // Check if user already has an application
    if (userApplications.length > 0) {
      setShowMultipleApplicationPopup(true);
      return;
    }

    try {
      await applyToProgramMutation.mutateAsync(programId);
    } catch (error) {
      console.error('Error applying to program:', error);
    }
  };

  const handleRequestCancel = async (applicationId: string) => {
    try {
      await createRequestMutation.mutateAsync({
        requestType: 'cancel',
        message: `Request to cancel application ${applicationId}`
      });
    } catch (error) {
      console.error('Error submitting cancel request:', error);
    }
  };

  const handleRequestMultiProgram = async () => {
    try {
      await createRequestMutation.mutateAsync({
        requestType: 'multi-program',
        message: 'Request permission to apply for multiple programs'
      });
    } catch (error) {
      console.error('Error submitting multi-program request:', error);
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Helper function to group programs by category
  const groupProgramsByCategory = (programs: any[]) => {
    return programs.reduce((acc: any, program: any) => {
      const categoryId = program.category_id;
      const categoryName = program.employment_categories?.display_name || 'Unknown Category';
      
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: {
            id: categoryId,
            name: categoryName
          },
          subProjects: {}
        };
      }
      
      const subProjectId = program.sub_project_id || 'no-subproject';
      const subProjectName = program.sub_projects?.display_name || 'General Programs';
      
      if (!acc[categoryId].subProjects[subProjectId]) {
        acc[categoryId].subProjects[subProjectId] = {
          subProject: {
            id: subProjectId,
            name: subProjectName
          },
          programs: []
        };
      }
      
      acc[categoryId].subProjects[subProjectId].programs.push(program);
      return acc;
    }, {});
  };

  const renderProfileView = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">{userData?.name || 'User Name'}</CardTitle>
              <CardDescription className="text-muted-foreground">Profile Details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mobile Number</p>
                  <p className="font-semibold text-foreground">{userData?.mobile_number || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Panchayath</p>
                  <p className="font-semibold text-foreground">{userData?.panchayath || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ward</p>
                  <p className="font-semibold text-foreground">{userData?.ward || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applied Category</p>
                  <p className="font-semibold text-foreground capitalize">{userData?.applied_category || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applied Programs Section */}
      <Card className="border-secondary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Applied Programs
          </CardTitle>
          <CardDescription className="text-muted-foreground">Programs you have applied to</CardDescription>
        </CardHeader>
        <CardContent>
          {applicationsLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : userApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No program applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userApplications.map((application: any) => (
                <div key={application.id} className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{application.programs?.program_name}</h4>
                      <p className="text-sm text-muted-foreground">{application.programs?.employment_categories?.display_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied on: {new Date(application.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {application.status}
                    </div>
                  </div>
                  
                  {/* Request Actions */}
                  <div className="flex gap-2 pt-3 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestCancel(application.id)}
                      disabled={createRequestMutation.isPending}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Request Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRequestMultiProgram}
                      disabled={createRequestMutation.isPending}
                      className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Request Multi-Program
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboardView = () => (
    <>
      <div className="text-center mb-12">
        <h2 className="font-bold text-foreground mb-4 text-3xl">സ്വയംതൊഴിൽ സാധ്യതകളുടെ മഹാലോകം </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto text-base">നിങ്ങൾക്ക് അനുയോജ്യമായ തൊഴിലവസരം ഏതാണെന്ന് 'ലഭ്യമായ തൊഴിലവസരങ്ങൾ' എന്ന വിഭാഗത്തിൽ വിരലമർത്തിയാൽ കാണാവുന്നതാണ് </p>
      </div>

      {/* Action Cards */}
      <div className="grid lg:grid-cols-2 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Select Job Card */}
        <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-job-selection border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-job-card">
              <Briefcase className="h-8 w-8 text-job-card-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-job-card-foreground whitespace-nowrap">ലഭ്യമായ തൊഴിലവസരങ്ങൾ</CardTitle>
            <CardDescription className="text-job-card-foreground/80">ഇവിടെ വിരലമർത്തിയാൽ നിങ്ങൾക്ക് അനുയോജ്യമായ തൊഴിലവസരങ്ങൾ കണ്ടെത്താവുന്നതാണ് </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleSelectJob} size="lg" className="bg-job-card text-job-card-foreground hover:bg-job-card/90">
              Browse Jobs
            </Button>
          </CardContent>
        </Card>

        {/* Add Program Card */}
        <Dialog open={showCategoriesModal} onOpenChange={setShowCategoriesModal}>
          <DialogTrigger asChild>
            <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-add-program border-0">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-program-card">
                  <Plus className="h-8 w-8 text-program-card-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold text-program-card-foreground">പുതിയ പദ്ധതികൾ ചേർക്കാൻ</CardTitle>
                <CardDescription className="text-program-card-foreground/80">നിങ്ങള്ക്ക് സ്വന്തമായി എന്തെങ്കിലും പദ്ധതിയുണ്ടെങ്കിൽ ഇവിടെ ചേർക്കാവുന്നതാണ്</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button size="lg" className="bg-program-card text-program-card-foreground hover:bg-program-card/90">
                  Open Categories
                </Button>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">പുതിയ പദ്ധതികൾ ചേർക്കാൻ</DialogTitle>
              <DialogDescription className="text-center">
                നിങ്ങൾക്ക് അനുയോജ്യമായ വിഭാഗം തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ കസ്റ്റം പ്രോഗ്രാം ചേർക്കുക
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Employment Categories */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 text-center">തൊഴിൽ വിഭാഗങ്ങൾ</h3>
                {categoriesLoading || subProjectsLoading ? (
                  <div className="text-center py-8">Loading categories...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <Card key={category.id} className="p-4 hover:shadow-md transition-all">
                        <div className="text-center mb-3">
                          <h4 className="font-semibold text-foreground text-lg">{category.display_name}</h4>
                        </div>
                        <div className="space-y-2">
                          {allSubProjects
                            .filter(subProject => subProject.category_id === category.id)
                            .map((subProject) => (
                              <Button
                                key={subProject.id}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  handleCategorySelect(category.id, subProject.id);
                                  setShowCategoriesModal(false);
                                }}
                                className="w-full text-sm h-10 hover:bg-primary hover:text-primary-foreground"
                              >
                                {subProject.display_name}
                              </Button>
                            ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-center pt-4 border-t">
                <Button 
                  onClick={() => {
                    handleAddProgram();
                    setShowCategoriesModal(false);
                  }} 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Custom Program
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Sticky at top */}
      <Navigation 
        userData={userData} 
        onLogout={onLogout} 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Content based on current view */}
        {currentView === 'dashboard' && renderDashboardView()}
        {currentView === 'profile' && renderProfileView()}
        {currentView === 'jobs' && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 whitespace-nowrap">ലഭ്യമായ തൊഴിലവസരങ്ങൾ</h2>
              <p className="text-muted-foreground">Available job opportunities and programs organized by categories</p>
            </div>
            
            {programsLoading || categoriesLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading programs...</p>
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No programs available yet. Be the first to add one!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {(Object.values(groupProgramsByCategory(programs)) as any[]).map((categoryGroup: any) => {
                  const isExpanded = expandedCategories[categoryGroup.category.id];
                  const totalPrograms = Object.values(categoryGroup.subProjects).reduce((sum: number, sp: any) => sum + (sp?.programs?.length || 0), 0);
                  
                  return (
                    <Card key={categoryGroup.category.id} className="border-primary/20 shadow-lg">
                      <CardHeader 
                        className="bg-gradient-to-r from-primary/5 to-secondary/5 cursor-pointer hover:from-primary/10 hover:to-secondary/10 transition-colors"
                        onClick={() => toggleCategoryExpansion(categoryGroup.category.id)}
                      >
                        <CardTitle className="text-2xl text-foreground flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                              <Briefcase className="h-6 w-6 text-primary-foreground" />
                            </div>
                            {categoryGroup.category.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-sm">
                              {String(totalPrograms)} programs
                            </Badge>
                            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </div>
                          </div>
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Click to view employment programs and opportunities in this category
                        </CardDescription>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="pt-6">
                          <div className="space-y-8">
                            {(Object.values(categoryGroup.subProjects) as any[]).map((subProjectGroup: any) => (
                              <div key={subProjectGroup.subProject.id}>
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-4 h-4 bg-secondary rounded-full"></div>
                                  <h4 className="text-lg font-semibold text-foreground">
                                    {subProjectGroup.subProject.name}
                                  </h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {subProjectGroup.programs.length} programs
                                  </Badge>
                                </div>
                                
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Program Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Qualifications</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {subProjectGroup.programs.map((program: any) => (
                                        <TableRow key={program.id}>
                                          <TableCell className="font-medium">{program.program_name}</TableCell>
                                          <TableCell>
                                            <div className="max-w-xs text-sm" title={program.description}>
                                              {program.description}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="max-w-xs text-sm" title={program.qualifications}>
                                              {program.qualifications || 'No specific requirements'}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant={program.status === 'pending' ? 'secondary' : program.status === 'approved' ? 'default' : 'outline'}>
                                              {program.status}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <Button 
                                              onClick={() => handleApplyToProgram(program.id)}
                                              disabled={applyToProgramMutation.isPending || applicationsLoading}
                                              size="sm"
                                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                                            >
                                              {applyToProgramMutation.isPending ? 'Applying...' : 'Apply'}
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {currentView === 'programs' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">എന്റെ പദ്ധതികൾ</h2>
            <p className="text-muted-foreground">Your programs will be displayed here</p>
          </div>
        )}

      {/* Multiple Application Popup */}
      <MultipleApplicationPopup 
        isOpen={showMultipleApplicationPopup} 
        onClose={() => setShowMultipleApplicationPopup(false)} 
        userData={userData}
      />

        {/* Add Program Form */}
        {showAddProgramForm && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="border-secondary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-secondary/5 to-accent/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-foreground">പുതിയ പദ്ധതി ചേർക്കുക</CardTitle>
                    <CardDescription className="text-muted-foreground">Add New Program Details</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setShowAddProgramForm(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Program Name *</label>
                    <Input
                      value={programForm.programName}
                      onChange={(e) => handleFormChange('programName', e.target.value)}
                      placeholder="Enter program name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Description *</label>
                    <Textarea
                      value={programForm.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Enter program description"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Qualifications</label>
                    <Textarea
                      value={programForm.qualifications}
                      onChange={(e) => handleFormChange('qualifications', e.target.value)}
                      placeholder="Enter required qualifications"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Employment Category *</label>
                    <Select onValueChange={(value) => handleFormChange('categoryId', value)} value={programForm.categoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Sub Project</label>
                    <Select onValueChange={(value) => handleFormChange('subProjectId', value)} value={programForm.subProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub project" />
                      </SelectTrigger>
                      <SelectContent>
                        {programForm.categoryId ? 
                          allSubProjects
                            .filter(subProject => subProject.category_id === programForm.categoryId)
                            .map((subProject) => (
                              <SelectItem key={subProject.id} value={subProject.id}>
                                {subProject.display_name}
                              </SelectItem>
                            )) :
                          allSubProjects.map((subProject) => (
                            <SelectItem key={subProject.id} value={subProject.id}>
                              {subProject.display_name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleProgramSubmit} className="flex-1">
                      Submit Program
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddProgramForm(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;