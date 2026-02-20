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
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched, isError: adminError } = useIsCallerAdmin();
  const { data: categories } = useGetCategories();
  const isAuthenticated = !!identity;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  const renderAdminButton = () => {
    if (!isAuthenticated) return null;

    // Still checking admin status - don't show button yet
    if (!adminFetched || adminLoading) {
      return null;
    }

    // Admin check error - show error state
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

    // Not an admin - hide the button completely
    if (isAdmin === false) {
      return null;
    }

    // Is admin - show active button
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

  const renderMobileAdminButton = () => {
    if (!isAuthenticated) return null;

    // Still checking admin status - don't show button yet
    if (!adminFetched || adminLoading) {
      return null;
    }

    // Admin check error - show error state
    if (adminError) {
      return (
        <Button
          variant="ghost"
          className="justify-start text-destructive"
          onClick={() => handleNavigation('/admin')}
        >
          <ShieldAlert className="h-4 w-4 mr-2" />
          Admin (Error)
        </Button>
      );
    }

    // Not an admin - hide completely
    if (isAdmin === false) {
      return null;
    }

    // Is admin - show active button
    if (isAdmin === true) {
      return (
        <Button
          variant="ghost"
          className="justify-start"
          onClick={() => handleNavigation('/admin')}
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
      <div className="page-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/assets/generated/logo-engineer-notes.dim_512x512.png" 
            alt="Engineer Notes" 
            className="h-8 w-8"
          />
          <span className="font-bold text-xl">Engineer Notes</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })}>
            <BookOpen className="h-4 w-4 mr-2" />
            Storefront
          </Button>

          {/* Categories Dropdown */}
          {categories && categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Categories
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Browse by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => navigate({ to: `/category/${category.id}` })}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isAuthenticated && (
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/library' })}>
              <Library className="h-4 w-4 mr-2" />
              My Library
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/about' })}>
            <Info className="h-4 w-4 mr-2" />
            About
          </Button>

          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/contact' })}>
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>

          {renderAdminButton()}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <LoginButton />

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNavigation('/')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Storefront
                </Button>

                {categories && categories.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-sm font-medium text-muted-foreground px-2">Categories</p>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant="ghost"
                        className="justify-start pl-6"
                        onClick={() => handleNavigation(`/category/${category.id}`)}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </Button>
                    ))}
                    <Separator className="my-2" />
                  </>
                )}

                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleNavigation('/library')}
                  >
                    <Library className="h-4 w-4 mr-2" />
                    My Library
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNavigation('/about')}
                >
                  <Info className="h-4 w-4 mr-2" />
                  About
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNavigation('/contact')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>

                {renderMobileAdminButton()}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
