import { useState, useMemo } from 'react';
import { useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetStorefrontProductsByCategory, useGetCategories } from '../hooks/useQueries';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import ProductCard from '../components/ProductCard';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function CategoryStorefrontPage() {
  const { categoryId } = useParams({ strict: false }) as { categoryId: string };
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  const { 
    data: products, 
    isLoading, 
    error, 
    isFetching,
    isStale,
    dataUpdatedAt,
    refetch 
  } = useGetStorefrontProductsByCategory(categoryId);
  
  const [searchQuery, setSearchQuery] = useState('');

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const category = categories?.find(c => c.id === categoryId);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    console.log('[CategoryStorefront] Filtering products:', {
      categoryId,
      totalProducts: products.length,
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        isPublished: p.isPublished,
        priceInCents: p.priceInCents.toString(),
        category: p.category,
      })),
    });
    
    return products.filter((product) => {
      const matchesSearch = 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [products, searchQuery, categoryId]);

  // Show debug panel in development or when localStorage flag is set
  const showDebugPanel = import.meta.env.DEV || localStorage.getItem('showQueryDiagnostics') === 'true';

  return (
    <>
      <div className="page-container section-spacing">
        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                {categoriesLoading ? (
                  <Skeleton className="h-8 w-48 mb-2" />
                ) : (
                  <h2 className="text-3xl font-semibold">
                    {category?.icon && <span className="mr-2">{category.icon}</span>}
                    {category?.name || 'Category'}
                  </h2>
                )}
                <p className="text-muted-foreground mt-1">
                  Browse engineering books and technical notes in this category
                </p>
              </div>
            </div>

            {showDebugPanel && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Query Diagnostics</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                    disabled={isFetching}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                    Refetch
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Category ID:</span>
                    <span className="ml-2 font-mono">{categoryId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Loading:</span>
                    <span className="ml-2">{isLoading ? '✓' : '✗'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fetching:</span>
                    <span className="ml-2">{isFetching ? '✓' : '✗'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stale:</span>
                    <span className="ml-2">{isStale ? '✓' : '✗'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Products Count:</span>
                    <span className="ml-2">{products?.length ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="ml-2">
                      {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Data Source:</span>
                    <span className="ml-2">
                      {isFetching ? 'Fetching from backend...' : isStale ? 'Stale cache' : 'Fresh cache'}
                    </span>
                  </div>
                  {products && products.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Products:</span>
                      <div className="ml-2 mt-1 space-y-1">
                        {products.map(p => (
                          <div key={p.id} className="text-xs">
                            • {p.title} - Published: {p.isPublished ? '✓' : '✗'} - Price: ${(Number(p.priceInCents) / 100).toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <SearchAndFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load products. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                {searchQuery ? 'No products match your search.' : 'No products available in this category yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProfileSetupModal open={showProfileSetup} />
    </>
  );
}
