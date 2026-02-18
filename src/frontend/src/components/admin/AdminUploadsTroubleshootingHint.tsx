import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AdminUploadsTroubleshootingHintProps {
  isAuthenticated: boolean;
  adminCheckLoading: boolean;
  adminCheckError: boolean;
  isAdmin?: boolean;
  productsLoading: boolean;
  productsError: boolean;
  adminSystemInitLoading?: boolean;
  adminSystemInitError?: boolean;
  isAdminSystemInitialized?: boolean;
  onRetryAdminCheck?: () => void;
  onRetryProducts?: () => void;
  onRetryAdminSystemInit?: () => void;
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
}: AdminUploadsTroubleshootingHintProps) {
  // Not signed in
  if (!isAuthenticated) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription>
          Product uploads are only available to the store owner. Please sign in to continue.
          Check the <strong>Admin Diagnostics</strong> section above for detailed status information.
        </AlertDescription>
      </Alert>
    );
  }

  // Admin system initialization loading
  if (adminSystemInitLoading) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription>
          Checking admin system configuration. Product uploads will be available once the check completes.
          Check the <strong>Admin Diagnostics</strong> section above for detailed status information.
        </AlertDescription>
      </Alert>
    );
  }

  // Admin system initialization error
  if (adminSystemInitError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Product uploads are unavailable because the admin system configuration check failed. 
            This may be a temporary network issue.
          </p>
          <p>
            Check the <strong>Admin Diagnostics</strong> section above for detailed error information.
          </p>
          {onRetryAdminSystemInit && (
            <Button onClick={onRetryAdminSystemInit} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Admin System Check
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Admin system not initialized
  if (isAdminSystemInitialized === false) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            The admin system has not been initialized yet. Please contact the store owner to initialize the admin system before uploading products.
          </p>
          <p>
            Check the <strong>Admin Diagnostics</strong> section above to see the admin system initialization status.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Admin check loading
  if (adminCheckLoading) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription>
          Verifying your admin permissions. Product uploads will be available once the check completes.
          Check the <strong>Admin Diagnostics</strong> section above for detailed status information.
        </AlertDescription>
      </Alert>
    );
  }

  // Admin check error
  if (adminCheckError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Product uploads are unavailable because the admin permission check failed. 
            This may be a temporary network issue.
          </p>
          <p>
            Check the <strong>Admin Diagnostics</strong> section above for detailed error information.
          </p>
          {onRetryAdminCheck && (
            <Button onClick={onRetryAdminCheck} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Admin Check
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Not an admin
  if (isAdmin === false) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Only the store owner or administrator can upload product files. 
            Your current principal is not recognized as an admin.
          </p>
          <p>
            Check the <strong>Admin Diagnostics</strong> section above to see your principal ID and admin status.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Products query error
  if (productsError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Product uploads are unavailable because the products list failed to load. 
            This may be a temporary network issue.
          </p>
          <p>
            Check the <strong>Admin Diagnostics</strong> section above for detailed error information.
          </p>
          {onRetryProducts && (
            <Button onClick={onRetryProducts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading Products
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Products loading
  if (productsLoading) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Upload Unavailable</AlertTitle>
        <AlertDescription>
          Loading products. Product uploads will be available once loading completes.
          Check the <strong>Admin Diagnostics</strong> section above for detailed status information.
        </AlertDescription>
      </Alert>
    );
  }

  // All checks passed - uploads should be available
  return null;
}
