import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, LogOut, User, Phone, MapPin, FileText, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
interface LandingPageProps {
  userData: any;
  onLogout: () => void;
}
const LandingPage = ({
  userData,
  onLogout
}: LandingPageProps) => {
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(true);
  const [showAddProgramForm, setShowAddProgramForm] = useState(false);
  const [programForm, setProgramForm] = useState({
    programName: '',
    description: '',
    qualifications: '',
    employmentCategory: '',
    subProject: ''
  });
  const { toast } = useToast();

  const employmentCategories = ['farmelife', 'entrelife', 'organelife', 'foodelife'];
  const subProjects = ['Sub Project 1', 'Sub Project 2', 'Sub Project 3', 'Sub Project 4'];
  
  const categorySubProjects = {
    farmelife: ['Organic Farming', 'Dairy Farming', 'Poultry Farming', 'Fish Farming'],
    entrelife: ['Small Business', 'Online Store', 'Service Business', 'Consulting'],
    organelife: ['Organic Products', 'Natural Medicine', 'Eco Farming', 'Green Energy'],
    foodelife: ['Restaurant', 'Catering', 'Food Processing', 'Bakery']
  };

  const handleSelectJob = () => {
    console.log('Navigate to job selection');
    // Add job selection logic here
  };

  const handleAddProgram = () => {
    setShowAddProgramForm(true);
  };

  const handleCategorySelect = (category: string, subProject: string) => {
    setProgramForm(prev => ({
      ...prev,
      employmentCategory: category,
      subProject: subProject
    }));
    setShowAddProgramForm(true);
  };

  const handleProgramSubmit = async () => {
    if (!programForm.programName || !programForm.description || !programForm.employmentCategory) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Here you would submit the program data to your database
      console.log('Program data:', programForm);
      
      toast({
        title: "Success",
        description: "Program added successfully",
      });
      
      // Reset form
      setProgramForm({
        programName: '',
        description: '',
        qualifications: '',
        employmentCategory: '',
        subProject: ''
      });
      setShowAddProgramForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add program",
        variant: "destructive"
      });
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setProgramForm(prev => ({ ...prev, [field]: value }));
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Self-Employment Program</h1>
            <p className="text-muted-foreground">Welcome, {userData?.name || 'User'}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader 
              className="bg-gradient-to-r from-primary/5 to-secondary/5 cursor-pointer"
              onClick={() => setIsProfileCollapsed(!isProfileCollapsed)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                    <User className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-foreground">{userData?.name || 'User Name'}</CardTitle>
                    <CardDescription className="text-muted-foreground">Profile Details</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {isProfileCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {!isProfileCollapsed && (
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
            )}
          </Card>
        </div>

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
                    <Select onValueChange={(value) => handleFormChange('employmentCategory', value)} value={programForm.employmentCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment category" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Sub Project</label>
                    <Select onValueChange={(value) => handleFormChange('subProject', value)} value={programForm.subProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub project" />
                      </SelectTrigger>
                      <SelectContent>
                        {programForm.employmentCategory && categorySubProjects[programForm.employmentCategory as keyof typeof categorySubProjects] ? 
                          categorySubProjects[programForm.employmentCategory as keyof typeof categorySubProjects].map((project) => (
                            <SelectItem key={project} value={project}>
                              {project}
                            </SelectItem>
                          )) :
                          subProjects.map((project) => (
                            <SelectItem key={project} value={project}>
                              {project}
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
              <CardTitle className="text-2xl font-bold text-job-card-foreground">ലഭ്യമായ തൊഴിലവസരങ്ങൾ</CardTitle>
              <CardDescription className="text-job-card-foreground/80">ഇവിടെ വിരലമർത്തിയാൽ നിങ്ങൾക്ക് അനുയോജ്യമായ തൊഴിലവസരങ്ങൾ കണ്ടെത്താവുന്നതാണ് </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleSelectJob} size="lg" className="bg-job-card text-job-card-foreground hover:bg-job-card/90">
                Browse Jobs
              </Button>
            </CardContent>
          </Card>

          {/* Add Program Card */}
          <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-add-program border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-program-card">
                <Plus className="h-8 w-8 text-program-card-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-program-card-foreground">പുതിയ പദ്ധതികൾ ചേർക്കാൻ</CardTitle>
              <CardDescription className="text-program-card-foreground/80">നിങ്ങള്ക്ക് സ്വന്തമായി എന്തെങ്കിലും പദ്ധതിയുണ്ടെങ്കിൽ ഇവിടെ ചേർക്കാവുന്നതാണ്</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Employment Categories */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-program-card-foreground mb-2">തൊഴിൽ വിഭാഗങ്ങൾ</h3>
                  <p className="text-sm text-program-card-foreground/80">നിങ്ങൾക്ക് അനുയോജ്യമായ വിഭാഗം തിരഞ്ഞെടുക്കുക</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(categorySubProjects).map(([category, subProjects]) => (
                    <Card key={category} className="p-3 hover:shadow-md transition-all bg-card/50 border border-program-card-foreground/20">
                      <div className="text-center mb-3">
                        <h4 className="font-semibold text-foreground capitalize text-sm">{category}</h4>
                      </div>
                      <div className="space-y-2">
                        {subProjects.map((subProject) => (
                          <Button
                            key={subProject}
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategorySelect(category, subProject)}
                            className="w-full text-xs h-8 hover:bg-program-card hover:text-program-card-foreground"
                          >
                            {subProject}
                          </Button>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center pt-4 border-t border-program-card-foreground/20">
                  <Button onClick={handleAddProgram} size="lg" className="bg-program-card text-program-card-foreground hover:bg-program-card/90">
                    Add Custom Program
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>;
};
export default LandingPage;