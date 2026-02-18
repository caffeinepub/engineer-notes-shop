import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';

interface AccessDeniedScreenProps {
  message?: string;
  customAction?: ReactNode;
}

export default function AccessDeniedScreen({ message, customAction }: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="page-container section-spacing">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-3xl font-semibold mb-3">Access Denied</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {message || 'You do not have permission to access the admin dashboard. The first authenticated user to access admin features will automatically become the owner.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate({ to: '/' })} variant="outline">
            Return to Storefront
          </Button>
          {customAction}
        </div>
      </div>
    </div>
  );
}
