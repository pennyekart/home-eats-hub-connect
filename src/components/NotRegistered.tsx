import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface NotRegisteredProps {
  onBack: () => void;
}

const NotRegistered = ({ onBack }: NotRegisteredProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive">
            <AlertCircle className="h-6 w-6 text-destructive-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">Not Registered</CardTitle>
          <CardDescription>
            You are not registered in our system. Please complete your registration first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotRegistered;