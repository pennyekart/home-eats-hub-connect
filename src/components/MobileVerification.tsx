import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone } from 'lucide-react';

interface MobileVerificationProps {
  onVerified: (userData: any) => void;
  onNotRegistered: () => void;
}

const MobileVerification = ({ onVerified, onNotRegistered }: MobileVerificationProps) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerification = async () => {
    if (!mobile.trim()) {
      toast({
        title: "Error",
        description: "Please enter your mobile number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create a Supabase client to fetch from external database
      const { createClient } = await import('@supabase/supabase-js');
      const externalSupabase = createClient(
        'https://mbvxiphgomdtoaqzmbgv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idnhpcGhnb21kdG9hcXptYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjI5MzAsImV4cCI6MjA2OTk5ODkzMH0.k4JOmqn3q0bu2_txC5XxBfgb9YDyqrdK6YmJwSsjKlo'
      );
      
      const { data, error } = await externalSupabase
        .from('registrations')
        .select('*')
        .eq('mobile_number', mobile)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        onVerified(data);
        toast({
          title: "Success",
          description: "Welcome! Registration found.",
        });
      } else {
        onNotRegistered();
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: "Failed to verify registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Phone className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Self-Employment Program</CardTitle>
          <CardDescription>
            Enter your mobile number to verify your registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="text-center"
            />
          </div>
          <Button 
            onClick={handleVerification} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Registration'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileVerification;