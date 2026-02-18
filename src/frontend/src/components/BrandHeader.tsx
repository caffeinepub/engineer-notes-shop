import { Link, useNavigate } from '@tanstack/react-router';
import { BookOpen, Library, LayoutDashboard, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';

export default function BrandHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading, isError: adminError } = useIsCallerAdmin();
  const isAuthenticated = !!identity;

  const renderAdminButton = () => {
    if (!isAuthenticated) return null;

    // Admin check loading
    if (adminLoading) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="hidden sm:inline-flex"
              >
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Admin
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Checking permissions...</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Admin check error
    if (adminError) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/admin' })}
                className="hidden sm:inline-flex text-destructive"
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Permission status could not be determined</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Not an admin
    if (isAdmin === false) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/admin' })}
                className="hidden sm:inline-flex opacity-50"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Not authorized as store owner</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Is admin
    if (isAdmin === true) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/admin' })}
          className="hidden sm:inline-flex"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Admin
        </Button>
      );
    }

    return null;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/assets/generated/logo-engineer-notes.dim_512x512.png" 
              alt="Engineer Notes Shop" 
              className="h-10 w-10"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-lg leading-none">Engineer Notes</span>
              <span className="text-xs text-muted-foreground">Technical Resources</span>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="hidden sm:inline-flex"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Storefront
            </Button>

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/library' })}
                className="hidden sm:inline-flex"
              >
                <Library className="h-4 w-4 mr-2" />
                My Library
              </Button>
            )}

            {renderAdminButton()}

            {isAuthenticated && userProfile && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm">
                <span className="text-muted-foreground">Hello,</span>
                <span className="font-medium">{userProfile.name}</span>
              </div>
            )}

            <LoginButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
