import { usePrograms } from "@/hooks/usePrograms";
import { useEmploymentCategories } from "@/hooks/useEmploymentCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, FileText, Tag } from "lucide-react";

const MyPrograms = () => {
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: categories } = useEmploymentCategories();

  if (programsLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">പദ്ധതികൾ</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">പദ്ധതികൾ</h2>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">ഇപ്പോൾ പദ്ധതികളൊന്നുമില്ല</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">പദ്ധതികൾ</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => {
          const category = categories?.find(c => c.id === program.category_id);
          
          return (
            <Card key={program.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{program.program_name}</CardTitle>
                  <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                    {program.status}
                  </Badge>
                </div>
                {category && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <Badge variant="outline" className="w-fit">
                      {category.display_name}
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {program.description}
                </p>
                
                {program.qualifications && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">യോഗ്യതകൾ:</h4>
                    <p className="text-sm text-muted-foreground">
                      {program.qualifications}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>ചേർത്തത്: {new Date(program.created_at).toLocaleDateString('ml-IN')}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MyPrograms;