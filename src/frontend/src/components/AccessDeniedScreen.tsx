import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

interface AccessDeniedScreenProps {
  message?: string;
}

export default function AccessDeniedScreen({ message }: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="page-container section-spacing">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-3xl font-semibold mb-3">Access Denied</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {message || 'You do not have permission to access this page. Please contact an administrator if you believe this is an error.'}
        </p>
        <Button onClick={() => navigate({ to: '/' })}>
          Return to Storefront
        </Button>
      </div>
    </div>
  );
}
