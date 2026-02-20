import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetStorefrontProducts, useGetCategories } from '../hooks/useQueries';
import StorefrontHero from '../components/StorefrontHero';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import ProductCard from '../components/ProductCard';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

export default function StorefrontPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: products, isLoading, error } = useGetStorefrontProducts();
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  
  const [searchQuery, setSearchQuery] = useState('');

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter((product) => {
      const matchesSearch = 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [products, searchQuery]);

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
