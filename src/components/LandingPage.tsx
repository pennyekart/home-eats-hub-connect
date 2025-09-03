import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, LogOut } from 'lucide-react';

interface LandingPageProps {
  userData: any;
  onLogout: () => void;
}

const LandingPage = ({ userData, onLogout }: LandingPageProps) => {
  const handleSelectJob = () => {
    console.log('Navigate to job selection');
    // Add job selection logic here
  };

  const handleAddProgram = () => {
    console.log('Navigate to add program');
    // Add program addition logic here
  };

  return (
    <div className="min-h-screen bg-background">
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
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Empowering Women Through Self-Employment
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose your path to success. Select a job opportunity or add your own program to our platform.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Select Job Card */}
          <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-job-selection border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-job-card">
                <Briefcase className="h-8 w-8 text-job-card-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-job-card-foreground">
                Select Your Job
              </CardTitle>
              <CardDescription className="text-job-card-foreground/80">
                Browse available job opportunities and find the perfect match for your skills
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={handleSelectJob}
                size="lg"
                className="bg-job-card text-job-card-foreground hover:bg-job-card/90"
              >
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
              <CardTitle className="text-2xl font-bold text-program-card-foreground">
                Add Your Program
              </CardTitle>
              <CardDescription className="text-program-card-foreground/80">
                Create and share your own self-employment program with other women
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={handleAddProgram}
                size="lg"
                className="bg-program-card text-program-card-foreground hover:bg-program-card/90"
              >
                Add Program
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;