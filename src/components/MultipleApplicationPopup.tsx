import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCreateRequest } from '@/hooks/useProgramApplications';

interface MultipleApplicationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const MultipleApplicationPopup = ({ isOpen, onClose }: MultipleApplicationPopupProps) => {
  const createRequestMutation = useCreateRequest();

  const handleCancelRequest = async () => {
    try {
      await createRequestMutation.mutateAsync({
        requestType: 'cancel',
        message: 'User requested to cancel existing program application to apply for a new one'
      });
      onClose();
    } catch (error) {
      console.error('Error submitting cancel request:', error);
    }
  };

  const handleMultiProgramRequest = async () => {
    try {
      await createRequestMutation.mutateAsync({
        requestType: 'multi-program',
        message: 'User requested permission to apply for multiple programs'
      });
      onClose();
    } catch (error) {
      console.error('Error submitting multi-program request:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Multiple Application Alert</DialogTitle>
          <DialogDescription className="text-center pt-4">
            You have only allowed a single program at a time. If you want to apply another please request cancel or multi-program.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleCancelRequest}
            variant="destructive"
            className="w-full"
            disabled={createRequestMutation.isPending}
          >
            Request Cancel
          </Button>
          
          <Button 
            onClick={handleMultiProgramRequest}
            variant="outline"
            className="w-full"
            disabled={createRequestMutation.isPending}
          >
            Request Multi-Program
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultipleApplicationPopup;