import { useState, useMemo } from 'react';
import { useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useListStorefrontProductsByCategory, useGetCategory } from '../hooks/useQueries';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import ProductCard from '../components/ProductCard';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CategoryStorefrontPage() {
  const { categoryId } = useParams({ strict: false }) as { categoryId: string };
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: category, isLoading: categoryLoading } = useGetCategory(categoryId);
  const { data: products, isLoading, error } = useListStorefrontProductsByCategory(categoryId);
  
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
      <div className="page-container section-spacing">
        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                {categoryLoading ? (
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
