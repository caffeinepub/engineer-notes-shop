import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, UserProfile, Category } from '../backend';
import { ExternalBlob } from '../backend';
import { normalizeProfileName } from '../utils/normalizeProfileName';

// ============================================================================
// Admin System Initialization
// ============================================================================

export function useIsAdminSystemInitialized() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['adminSystemInitialized'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isAdminSystemInitialized();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useInitializeStore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.initializeStore();
    },
    onSuccess: () => {
      // Invalidate all admin-related queries after initialization
      queryClient.invalidateQueries({ queryKey: ['adminSystemInitialized'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ============================================================================
// Admin Access Control
// ============================================================================

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false, // Don't retry on auth failures
    staleTime: 0, // Always refetch to ensure fresh admin status
  });

  // Return composite loading state that properly reflects both actor and query status
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !actorFetching && query.isFetched,
  };
}

// ============================================================================
// User Profile
// ============================================================================

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      const normalizedProfile = {
        ...profile,
        name: normalizeProfileName(profile.name),
      };
      return actor.saveCallerUserProfile(normalizedProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminSystemInitialized'] });
    },
  });
}

// ============================================================================
// Categories
// ============================================================================

export function useGetCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCategory(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Category>({
    queryKey: ['category', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCategory(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

// ============================================================================
// Storefront Products (Public)
// ============================================================================

export function useGetStorefrontProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['storefrontProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStorefrontProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStorefrontProductsByCategory(categoryId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['storefrontProducts', 'category', categoryId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStorefrontProductsByCategory(categoryId);
    },
    enabled: !!actor && !isFetching && !!categoryId,
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export function useGetProduct(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProduct(productId);
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

// ============================================================================
// Admin Products (Private)
// ============================================================================

export function useGetAdminProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      title: string;
      author: string;
      priceInCents: bigint;
      categoryId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createProduct(
        params.id,
        params.title,
        params.author,
        params.priceInCents,
        params.categoryId
      );
    },
    onSuccess: () => {
      // Invalidate all product queries including category-specific ones
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['storefrontProducts'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminSystemInitialized'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      title: string;
      author: string;
      priceInCents: bigint;
      categoryId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProduct(
        params.id,
        params.title,
        params.author,
        params.priceInCents,
        params.categoryId
      );
    },
    onSuccess: () => {
      // Invalidate all product queries including category-specific ones
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['storefrontProducts'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteProduct(id);
    },
    onSuccess: () => {
      // Invalidate all product queries including category-specific ones
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['storefrontProducts'] });
    },
  });
}

export function useSetProductPublished() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; isPublished: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setProductPublished(params.id, params.isPublished);
    },
    onSuccess: () => {
      // Invalidate all product-related queries including category-specific ones
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['storefrontProducts'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useUploadProductFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; blob: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.uploadProductFile(params.id, params.blob);
    },
    onSuccess: () => {
      // Invalidate all product-related queries including category-specific ones
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['storefrontProducts'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

// ============================================================================
// Purchases
// ============================================================================

export function usePurchaseProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.purchaseProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchasedProductIds'] });
      queryClient.invalidateQueries({ queryKey: ['buyerLibrary'] });
    },
  });
}

export function useGetPurchasedProductIds() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['purchasedProductIds'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPurchasedProductIds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDownloadProductFile(productId: string) {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.downloadProductFile(productId);
    },
  });
}
