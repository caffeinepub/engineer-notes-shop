import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetStorefrontProducts, useGetCategories } from '../hooks/useQueries';
import StorefrontHero from '../components/StorefrontHero';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import ProductCard from '../components/ProductCard';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StorefrontPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { 
    data: products, 
    isLoading, 
    error,
    isFetching,
    isStale,
    dataUpdatedAt,
    refetch 
  } = useGetStorefrontProducts();
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  
  const [searchQuery, setSearchQuery] = useState('');

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    console.log('[Storefront] Filtering products:', {
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
  }, [products, searchQuery]);

  // Show debug panel in development or when localStorage flag is set
  const showDebugPanel = import.meta.env.DEV || localStorage.getItem('showQueryDiagnostics') === 'true';

  return (
    <>
      <StorefrontHero />
      
      <div className="page-container section-spacing">
        <div className="space-y-12">
          {/* Categories Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold">Browse by Category</h2>
              <p className="text-muted-foreground mt-1">
                Explore our collection organized by topic
              </p>
            </div>

            {categoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate({ to: `/category/${category.id}` })}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="text-4xl mb-2">{category.icon}</div>
                      <div className="text-sm font-medium">{category.name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No categories available yet.</p>
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-semibold">Available Resources</h2>
                  <p className="text-muted-foreground mt-1">
                    Browse our collection of engineering books and technical notes
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
                              • {p.title} - Published: {p.isPublished ? '✓' : '✗'} - Price: ${(Number(p.priceInCents) / 100).toFixed(2)} - Category: {p.category}
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
                  {searchQuery ? 'No products match your search.' : 'No products available yet.'}
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
      </div>

      <ProfileSetupModal open={showProfileSetup} />
    </>
  );
}
