import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListStorefrontProducts, useDownloadProductFile } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Library, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function BuyerLibraryPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: allProducts, isLoading } = useListStorefrontProducts();
  const downloadFile = useDownloadProductFile();

  if (!isAuthenticated) {
    return <AccessDeniedScreen message="Please login to access your library." />;
  }

  const handleDownload = async (productId: string, title: string) => {
    setDownloadingId(productId);
    try {
      const blob = await downloadFile.mutateAsync(productId);
      const url = blob.getDirectURL();
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started!');
    } catch (error: any) {
      if (error.message?.includes('Must purchase')) {
        toast.error('You need to purchase this product first');
      } else {
        toast.error('Download failed. Please try again.');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container section-spacing">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container section-spacing">
      <div className="flex items-center gap-3 mb-8">
        <Library className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">My Library</h1>
          <p className="text-muted-foreground">Access your purchased resources</p>
        </div>
      </div>

      {!allProducts || allProducts.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No purchases yet</AlertTitle>
          <AlertDescription>
            Visit the storefront to browse and purchase engineering resources.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProducts.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                <p className="text-sm text-muted-foreground">by {product.author}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  ${(Number(product.priceInCents) / 100).toFixed(2)}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleDownload(product.id, product.title)}
                  disabled={downloadingId === product.id}
                  className="w-full"
                  variant="outline"
                >
                  {downloadingId === product.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
