import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, LogOut, User, Phone, MapPin, FileText } from 'lucide-react';
interface LandingPageProps {
  userData: any;
  onLogout: () => void;
}
const LandingPage = ({
  userData,
  onLogout
}: LandingPageProps) => {
  const handleSelectJob = () => {
    console.log('Navigate to job selection');
    // Add job selection logic here
  };
  const handleAddProgram = () => {
    console.log('Navigate to add program');
    // Add program addition logic here
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
        </div>

        <div className="text-center mb-12">
          <h2 className="font-bold text-foreground mb-4 text-3xl">സ്വയംതൊഴിൽ സാധ്യതകളുടെ മഹാലോകം </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-base">നിങ്ങൾക്ക് അനുയോജ്യമായ തൊഴിലവസരം ഏതാണെന്ന് 'ലഭ്യമായ തൊഴിലവസരങ്ങൾ' എന്ന വിഭാഗത്തിൽ വിരലമർത്തിയാൽ കാണാവുന്നതാണ് </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
              <CardTitle className="text-2xl font-bold text-program-card-foreground">പുതിയ പദ്ധതികൾ ചേർക്കാൻ </CardTitle>
              <CardDescription className="text-program-card-foreground/80">നിങ്ങള്ക്ക് സ്വന്തമായി എന്തെങ്കിലും പദ്ധതിയുണ്ടെങ്കിൽ ഇവിടെ ചേർക്കാവുന്നതാണ് </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleAddProgram} size="lg" className="bg-program-card text-program-card-foreground hover:bg-program-card/90">
                Add Program
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>;
};
export default LandingPage;