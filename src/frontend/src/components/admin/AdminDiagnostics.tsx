import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface AdminDiagnosticsProps {
  isAuthenticated: boolean;
  principalText?: string;
  adminCheckLoading: boolean;
  adminCheckError: boolean;
  adminCheckErrorMessage?: string;
  isAdmin?: boolean;
  productsLoading: boolean;
  productsError: boolean;
  productsErrorMessage?: string;
  productsCount?: number;
}

export default function AdminDiagnostics({
  isAuthenticated,
  principalText,
  adminCheckLoading,
  adminCheckError,
  adminCheckErrorMessage,
  isAdmin,
  productsLoading,
  productsError,
  productsErrorMessage,
  productsCount,
}: AdminDiagnosticsProps) {
  return (
    <Card className="mb-6 border-dashed">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Admin Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Authentication:</span>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <Badge variant="outline" className="text-green-600">Signed In</Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">Not Signed In</Badge>
              </>
            )}
          </div>
        </div>

        {/* Principal */}
        {isAuthenticated && principalText && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground">Principal:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded break-all max-w-[60%] text-right">
              {principalText}
            </code>
          </div>
        )}

        {/* Admin Check Status */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Admin Check:</span>
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">Unavailable (not authenticated)</Badge>
              </>
            ) : adminCheckLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <Badge variant="outline">Loading...</Badge>
              </>
            ) : adminCheckError ? (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <Badge variant="destructive">Error</Badge>
              </>
            ) : isAdmin === true ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <Badge variant="outline" className="text-green-600">Admin</Badge>
              </>
            ) : isAdmin === false ? (
              <>
                <XCircle className="h-4 w-4 text-orange-600" />
                <Badge variant="outline" className="text-orange-600">Not Admin</Badge>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">Unknown</Badge>
              </>
            )}
          </div>
        </div>

        {/* Admin Check Error Message */}
        {adminCheckError && adminCheckErrorMessage && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            <strong>Admin Check Error:</strong> {adminCheckErrorMessage}
          </div>
        )}

        {/* Products Query Status */}
        {isAuthenticated && isAdmin === true && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Products Query:</span>
            <div className="flex items-center gap-2">
              {productsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <Badge variant="outline">Loading...</Badge>
                </>
              ) : productsError ? (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <Badge variant="destructive">Error</Badge>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <Badge variant="outline" className="text-green-600">
                    {productsCount ?? 0} product{productsCount !== 1 ? 's' : ''}
                  </Badge>
                </>
              )}
            </div>
          </div>
        )}

        {/* Products Query Error Message */}
        {productsError && productsErrorMessage && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            <strong>Products Query Error:</strong> {productsErrorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
