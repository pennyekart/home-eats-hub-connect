import { useState } from "react";
import { usePrograms } from "@/hooks/usePrograms";
import { useEmploymentCategories, useAllSubProjects } from "@/hooks/useEmploymentCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Phone, Filter } from "lucide-react";

const AvailablePrograms = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: programs, isLoading: programsLoading } = usePrograms("Pennyekart Free Registration");
  const { data: categories, isLoading: categoriesLoading } = useEmploymentCategories();
  const { data: subProjects, isLoading: subProjectsLoading } = useAllSubProjects();

  const handleMobileVerification = () => {
    // Simple verification - in real app, this would verify against database
    if (mobileNumber.length === 10) {
      setIsVerified(true);
    }
  };

  const filteredPrograms = programs?.filter(program => 
    !selectedCategory || program.category_id === selectedCategory
  );

  const getSubProjectsForCategory = (categoryId: string) => {
    return subProjects?.filter(sp => sp.category_id === categoryId) || [];
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Phone className="h-5 w-5" />
              Mobile Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Enter Registered Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                maxLength={10}
              />
              <p className="text-sm text-muted-foreground">
                Enter the mobile number registered under Pennyekart Free Registration
              </p>
            </div>
            <Button 
              onClick={handleMobileVerification}
              className="w-full"
              disabled={mobileNumber.length !== 10}
            >
              Verify & Access Programs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10">
      <header className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Available Programs</h1>
          <p className="text-muted-foreground">Explore employment opportunities and projects</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Tabs defaultValue="programs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="projects">Sub Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-6">
            {programsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPrograms?.map((program) => {
                  const category = categories?.find(c => c.id === program.category_id);
                  const relatedSubProjects = getSubProjectsForCategory(program.category_id);
                  
                  return (
                    <Card key={program.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{program.program_name}</CardTitle>
                          <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                            {program.status}
                          </Badge>
                        </div>
                        {category && (
                          <Badge variant="outline" className="w-fit">
                            {category.display_name}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {program.description}
                        </p>
                        
                        {program.qualifications && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Qualifications:</h4>
                            <p className="text-sm text-muted-foreground">
                              {program.qualifications}
                            </p>
                          </div>
                        )}

                        {relatedSubProjects.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Related Sub Projects:</h4>
                            <div className="flex flex-wrap gap-1">
                              {relatedSubProjects.slice(0, 3).map((sp) => (
                                <Badge key={sp.id} variant="secondary" className="text-xs">
                                  {sp.display_name}
                                </Badge>
                              ))}
                              {relatedSubProjects.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{relatedSubProjects.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <Button className="w-full" size="sm">
                          Apply Now
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {!programsLoading && (!filteredPrograms || filteredPrograms.length === 0) && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No programs found.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            {categoriesLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {categories?.map((category) => {
                  const categorySubProjects = getSubProjectsForCategory(category.id);
                  const categoryPrograms = programs?.filter(p => p.category_id === category.id) || [];
                  
                  return (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl">{category.display_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {category.description && (
                          <p className="text-muted-foreground">{category.description}</p>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span>{categoryPrograms.length} Programs</span>
                          <span>{categorySubProjects.length} Sub Projects</span>
                        </div>

                        {categorySubProjects.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Sub Projects:</h4>
                            <div className="flex flex-wrap gap-1">
                              {categorySubProjects.slice(0, 5).map((sp) => (
                                <Badge key={sp.id} variant="outline" className="text-xs">
                                  {sp.display_name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {subProjectsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-12 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subProjects?.map((subProject) => {
                  const category = categories?.find(c => c.id === subProject.category_id);
                  
                  return (
                    <Card key={subProject.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{subProject.display_name}</CardTitle>
                        {category && (
                          <Badge variant="outline" className="w-fit">
                            {category.display_name}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        {subProject.description && (
                          <p className="text-sm text-muted-foreground">
                            {subProject.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AvailablePrograms;