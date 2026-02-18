import { Link, useNavigate } from '@tanstack/react-router';
import { BookOpen, Library, LayoutDashboard, Loader2, ShieldAlert, ChevronDown, Info, Mail, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetCategories } from '../hooks/useQueries';
import { useState } from 'react';

export default function BrandHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, isError: adminError } = useIsCallerAdmin();
  const { data: categories } = useGetCategories();
  const isAuthenticated = !!identity;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  const renderAdminButton = () => {
    if (!isAuthenticated) return null;

    // Still checking admin status
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

  const renderMobileAdminItem = () => {
    if (!isAuthenticated) return null;

    // Still checking
    if (adminLoading) {
      return (
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="w-full justify-start"
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Admin (Checking...)
        </Button>
      );
    }

    // Admin check error
    if (adminError) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation('/admin')}
          className="w-full justify-start text-destructive"
        >
          <ShieldAlert className="h-4 w-4 mr-2" />
          Admin (Check failed)
        </Button>
      );
    }

    // Not an admin
    if (isAdmin === false) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation('/admin')}
          className="w-full justify-start opacity-50"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Admin (Not authorized)
        </Button>
      );
    }

    // Is admin
    if (isAdmin === true) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation('/admin')}
          className="w-full justify-start"
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

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Storefront
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Categories
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Browse by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => navigate({ to: `/category/${category.id}` })}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No categories available</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/library' })}
              >
                <Library className="h-4 w-4 mr-2" />
                My Library
              </Button>
            )}

            {renderAdminButton()}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/about' })}
            >
              <Info className="h-4 w-4 mr-2" />
              About
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/contact' })}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </Button>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <LoginButton />
          </nav>

          {/* Mobile Navigation */}
          <div className="sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation('/')}
                    className="w-full justify-start"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Storefront
                  </Button>

                  <Separator className="my-2" />

                  <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                    Categories
                  </div>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <Button
                        key={category.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigation(`/category/${category.id}`)}
                        className="w-full justify-start pl-6"
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </Button>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground px-6 py-2">
                      No categories available
                    </div>
                  )}

                  <Separator className="my-2" />

                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavigation('/library')}
                      className="w-full justify-start"
                    >
                      <Library className="h-4 w-4 mr-2" />
                      My Library
                    </Button>
                  )}

                  {renderMobileAdminItem()}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation('/about')}
                    className="w-full justify-start"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    About
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation('/contact')}
                    className="w-full justify-start"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>

                  <Separator className="my-2" />

                  <LoginButton variant="mobile" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
