import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';

interface AdminUploadsTroubleshootingHintProps {
  isAuthenticated: boolean;
  adminCheckLoading: boolean;
  adminCheckError: boolean;
  isAdmin: boolean | undefined;
  productsLoading: boolean;
  productsError: boolean;
  adminSystemInitLoading: boolean;
  adminSystemInitError: boolean;
  isAdminSystemInitialized: boolean | undefined;
  onRetryAdminCheck: () => void;
  onRetryProducts: () => void;
  onRetryAdminSystemInit: () => void;
  onRetryInitialization?: () => void;
  isInitializing?: boolean;
}

export default function AdminUploadsTroubleshootingHint({
  isAuthenticated,
  adminCheckLoading,
  adminCheckError,
  isAdmin,
  productsLoading,
  productsError,
  adminSystemInitLoading,
  adminSystemInitError,
  isAdminSystemInitialized,
  onRetryAdminCheck,
  onRetryProducts,
  onRetryAdminSystemInit,
  onRetryInitialization,
  isInitializing = false,
}: AdminUploadsTroubleshootingHintProps) {
  // Not signed in
  if (!isAuthenticated) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription>
          You must be signed in to upload product files. Please sign in using the button in the header. Once signed in, the admin system will be initialized automatically.
        </AlertDescription>
      </Alert>
    );
  }

  // Admin system initialization loading
  if (adminSystemInitLoading) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Checking Admin System</AlertTitle>
        <AlertDescription>
          Verifying admin system configuration. Upload functionality will be available once the check completes.
        </AlertDescription>
      </Alert>
    );
  }

  // Admin system initialization error
  if (adminSystemInitError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Admin System Check Failed</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Unable to verify the admin system configuration. Upload functionality is unavailable.</p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetryAdminSystemInit}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry Check
            </Button>
            {onRetryInitialization && (
              <Button
                variant="default"
                size="sm"
                onClick={onRetryInitialization}
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3 w-3 mr-2" />
                    Initialize Now
                  </>
                )}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Admin system not initialized
  if (isAdminSystemInitialized === false) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Admin System Not Initialized</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>The admin system needs to be initialized before you can upload product files. Click the button below to initialize it now.</p>
          {onRetryInitialization && (
            <Button
              variant="default"
              size="sm"
              onClick={onRetryInitialization}
              disabled={isInitializing}
              className="mt-2"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3 w-3 mr-2" />
                  Initialize Admin System
                </>
              )}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Admin check loading
  if (adminCheckLoading) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Checking Permissions</AlertTitle>
        <AlertDescription>
          Verifying your admin permissions. Upload functionality will be available once the check completes.
        </AlertDescription>
      </Alert>
    );
  }

  // Admin check error
  if (adminCheckError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Permission Check Failed</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Unable to verify your admin permissions. Upload functionality is unavailable. Check the <strong>Admin Diagnostics</strong> section below for details.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetryAdminCheck}
            className="mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry Permission Check
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Not admin
  if (isAdmin === false) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription>
          You are not recognized as an admin. To gain admin access, set your profile name to the owner email address. Check the <strong>Store Owner Verification</strong> section above.
        </AlertDescription>
      </Alert>
    );
  }

  // Products loading
  if (productsLoading) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Loading Products</AlertTitle>
        <AlertDescription>
          Loading your product list. Upload functionality will be available once products are loaded.
        </AlertDescription>
      </Alert>
    );
  }

  // Products error
  if (productsError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to Load Products</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Unable to retrieve your product list. Upload functionality is unavailable. Check the <strong>Admin Diagnostics</strong> section below for details.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetryProducts}
            className="mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry Loading Products
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // All checks passed - no hint needed
  return null;
}
