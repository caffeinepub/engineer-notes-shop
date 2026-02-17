import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProduct, usePurchaseProduct } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, BookOpen, FileText, ShoppingCart, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: product, isLoading, error } = useGetProduct(productId);
  const purchaseProduct = usePurchaseProduct();

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      return;
    }

    try {
      await purchaseProduct.mutateAsync(productId);
      toast.success('Purchase successful! Check your library to download.');
      setTimeout(() => {
        navigate({ to: '/library' });
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Purchase failed');
    }
  };

  if (isLoading) {
    return (
      <div className="page-container section-spacing">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container section-spacing">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || 'Product not found'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4" variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Storefront
        </Button>
      </div>
    );
  }

  const priceDisplay = `$${(Number(product.priceInCents) / 100).toFixed(2)}`;
  const isBook = product.title.toLowerCase().includes('book');

  return (
    <div className="page-container section-spacing">
      <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Storefront
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              {isBook ? <BookOpen className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              <span className="text-sm uppercase tracking-wide">
                {isBook ? 'Engineering Book' : 'Technical Notes'}
              </span>
              {product.isPublished && (
                <Badge variant="secondary" className="ml-2">
                  Available
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-3">{product.title}</h1>
            <p className="text-xl text-muted-foreground">by {product.author}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About This Resource</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                This {isBook ? 'comprehensive engineering book' : 'detailed technical notes collection'} provides 
                in-depth coverage of essential engineering concepts and practical applications. 
                Perfect for students, professionals, and anyone looking to deepen their technical knowledge.
              </p>
              <p className="mt-4">
                <strong>What you'll get:</strong>
              </p>
              <ul>
                <li>Instant digital download after purchase</li>
                <li>Lifetime access to the material</li>
                <li>Professional formatting and organization</li>
                <li>Practical examples and applications</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="text-3xl font-bold">{priceDisplay}</span>
              </div>
              
              {product.file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Digital download included</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handlePurchase}
                disabled={!isAuthenticated || purchaseProduct.isPending}
                className="w-full"
                size="lg"
              >
                {purchaseProduct.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isAuthenticated ? 'Purchase Now' : 'Login to Purchase'}
                  </>
                )}
              </Button>
            </CardFooter>
            {!isAuthenticated && (
              <div className="px-6 pb-6">
                <p className="text-xs text-muted-foreground text-center">
                  You need to be logged in to make a purchase
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
