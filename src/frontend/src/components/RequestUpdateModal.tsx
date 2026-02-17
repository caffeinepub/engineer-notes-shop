import { useState } from 'react';
import { Copy, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface RequestUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RequestUpdateModal({ open, onOpenChange }: RequestUpdateModalProps) {
  const [instructions, setInstructions] = useState('');

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(instructions);
      toast.success('Copied to clipboard!', {
        description: 'Your update request has been copied.',
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy', {
        description: 'Could not copy to clipboard. Please try again.',
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setInstructions('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request an Update</DialogTitle>
          <DialogDescription>
            Describe the changes or improvements you'd like to see in the application.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Enter your update instructions here..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="min-h-[200px] resize-none"
          />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button
            onClick={handleCopyToClipboard}
            disabled={!instructions.trim()}
            className="w-full sm:w-auto"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy to Clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
