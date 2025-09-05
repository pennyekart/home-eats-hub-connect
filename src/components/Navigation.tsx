import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Briefcase, Plus, User, LogOut } from 'lucide-react';

interface NavigationProps {
  userData: any;
  onLogout: () => void;
  currentView: 'dashboard' | 'jobs' | 'programs' | 'profile';
  onViewChange: (view: 'dashboard' | 'jobs' | 'programs' | 'profile') => void;
}

const Navigation = ({ userData, onLogout, currentView, onViewChange }: NavigationProps) => {
  const navItems = [
    { id: 'dashboard', label: 'ഡാഷ്ബോർഡ്', icon: Home },
    { id: 'jobs', label: 'തൊഴിലവസരങ്ങൾ', icon: Briefcase },
    { id: 'programs', label: 'പദ്ധതികൾ', icon: Plus },
    { id: 'profile', label: 'പ്രൊഫൈൽ', icon: User },
  ] as const;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{userData?.name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">സ്വയം തൊഴിൽ പദ്ധതി</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewChange(item.id)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                );
              })}
            </div>
            
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Navigation;