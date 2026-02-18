import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

interface LoginButtonProps {
  variant?: 'default' | 'mobile';
  onAuthComplete?: () => void;
}

export default function LoginButton({ variant = 'default', onAuthComplete }: LoginButtonProps = {}) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      onAuthComplete?.();
    } else {
      try {
        await login();
        onAuthComplete?.();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  if (variant === 'mobile') {
    return (
      <Button
        onClick={handleAuth}
        disabled={isLoggingIn}
        variant={isAuthenticated ? 'outline' : 'default'}
        size="sm"
        className="w-full"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Signing in...
          </>
        ) : isAuthenticated ? (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4 mr-2" />
            Sign in
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoggingIn}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Signing in...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4 mr-2" />
          Sign in
        </>
      )}
    </Button>
  );
}
