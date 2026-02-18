import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, AlertCircle, HelpCircle } from 'lucide-react';

interface AdminDiagnosticsProps {
  isAuthenticated: boolean;
  principalText?: string;
  profileName?: string;
  adminCheckLoading: boolean;
  adminCheckError: boolean;
  adminCheckErrorMessage?: string;
  isAdmin?: boolean;
  productsLoading: boolean;
  productsError: boolean;
  productsErrorMessage?: string;
  productsCount?: number;
  adminSystemInitLoading?: boolean;
  adminSystemInitError?: boolean;
  adminSystemInitErrorMessage?: string;
  isAdminSystemInitialized?: boolean;
}

export default function AdminDiagnostics({
  isAuthenticated,
  principalText,
  profileName,
  adminCheckLoading,
  adminCheckError,
  adminCheckErrorMessage,
  isAdmin,
  productsLoading,
  productsError,
  productsErrorMessage,
  productsCount,
  adminSystemInitLoading,
  adminSystemInitError,
  adminSystemInitErrorMessage,
  isAdminSystemInitialized,
}: AdminDiagnosticsProps) {
  const getAuthStatus = () => {
    if (!isAuthenticated) {
      return { icon: <XCircle className="h-4 w-4" />, text: 'Not signed in', variant: 'destructive' as const };
    }
    return { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Signed in', variant: 'default' as const };
  };

  const getAdminSystemStatus = () => {
    if (adminSystemInitLoading) {
      return { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: 'Checking...', variant: 'secondary' as const };
    }
    if (adminSystemInitError) {
      return { icon: <XCircle className="h-4 w-4" />, text: `Error: ${adminSystemInitErrorMessage}`, variant: 'destructive' as const };
    }
    if (isAdminSystemInitialized === true) {
      return { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Initialized', variant: 'default' as const };
    }
    if (isAdminSystemInitialized === false) {
      return { icon: <XCircle className="h-4 w-4" />, text: 'Not initialized', variant: 'destructive' as const };
    }
    return { icon: <HelpCircle className="h-4 w-4" />, text: 'Unknown', variant: 'secondary' as const };
  };

  const getAdminStatus = () => {
    if (!isAuthenticated) {
      return { icon: <HelpCircle className="h-4 w-4" />, text: 'N/A (not signed in)', variant: 'secondary' as const };
    }
    if (adminCheckLoading) {
      return { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: 'Checking...', variant: 'secondary' as const };
    }
    if (adminCheckError) {
      return { icon: <XCircle className="h-4 w-4" />, text: `Error: ${adminCheckErrorMessage}`, variant: 'destructive' as const };
    }
    if (isAdmin === true) {
      return { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Admin', variant: 'default' as const };
    }
    if (isAdmin === false) {
      return { icon: <XCircle className="h-4 w-4" />, text: 'Not admin', variant: 'destructive' as const };
    }
    return { icon: <HelpCircle className="h-4 w-4" />, text: 'Unknown', variant: 'secondary' as const };
  };

  const getProductsStatus = () => {
    if (!isAuthenticated) {
      return { icon: <HelpCircle className="h-4 w-4" />, text: 'N/A (not signed in)', variant: 'secondary' as const };
    }
    if (isAdmin === false) {
      return { icon: <HelpCircle className="h-4 w-4" />, text: 'N/A (not admin)', variant: 'secondary' as const };
    }
    if (adminCheckLoading || isAdmin === undefined) {
      return { icon: <HelpCircle className="h-4 w-4" />, text: 'Waiting for admin check', variant: 'secondary' as const };
    }
    if (productsLoading) {
      return { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: 'Loading...', variant: 'secondary' as const };
    }
    if (productsError) {
      return { icon: <XCircle className="h-4 w-4" />, text: `Error: ${productsErrorMessage}`, variant: 'destructive' as const };
    }
    if (productsCount !== undefined) {
      return { icon: <CheckCircle2 className="h-4 w-4" />, text: `Loaded (${productsCount} products)`, variant: 'default' as const };
    }
    return { icon: <HelpCircle className="h-4 w-4" />, text: 'Unknown', variant: 'secondary' as const };
  };

  const authStatus = getAuthStatus();
  const adminSystemStatus = getAdminSystemStatus();
  const adminStatus = getAdminStatus();
  const productsStatus = getProductsStatus();

  return (
    <Card className="mb-6 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Admin Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Authentication:</span>
          <Badge variant={authStatus.variant} className="flex items-center gap-1">
            {authStatus.icon}
            {authStatus.text}
          </Badge>
        </div>
        
        {isAuthenticated && principalText && (
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground">Principal:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded break-all max-w-[60%] text-right">
              {principalText}
            </code>
          </div>
        )}

        {isAuthenticated && profileName && (
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground">Profile Name:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded break-all max-w-[60%] text-right">
              {profileName}
            </code>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Admin System:</span>
          <Badge variant={adminSystemStatus.variant} className="flex items-center gap-1">
            {adminSystemStatus.icon}
            {adminSystemStatus.text}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Admin Check:</span>
          <Badge variant={adminStatus.variant} className="flex items-center gap-1">
            {adminStatus.icon}
            {adminStatus.text}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Products Query:</span>
          <Badge variant={productsStatus.variant} className="flex items-center gap-1">
            {productsStatus.icon}
            {productsStatus.text}
          </Badge>
        </div>

        {isAuthenticated && isAdmin === true && productsCount !== undefined && productsCount > 0 && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            ✓ Upload PDF buttons should be visible on all {productsCount} product card(s)
          </div>
        )}
      </CardContent>
    </Card>
  );
}
