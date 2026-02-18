import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Product, UserRole, Category } from '../backend';
import { ExternalBlob } from '../backend';

// Query Keys
const KEYS = {
  userProfile: ['currentUserProfile'],
  userRole: ['currentUserRole'],
  isAdmin: ['isAdmin'],
  adminSystemInitialized: ['adminSystemInitialized'],
  storeClaimable: ['storeClaimable'],
  storefrontProducts: ['storefrontProducts'],
  storefrontProductsByCategory: (categoryId: string) => ['storefrontProducts', 'category', categoryId],
  adminProducts: ['adminProducts'],
  purchasedProductIds: ['purchasedProductIds'],
  purchasedProducts: ['purchasedProducts'],
  product: (id: string) => ['product', id],
  categories: ['categories'],
  category: (id: string) => ['category', id],
};

// Auth & Profile Hooks
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: KEYS.userProfile,
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
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.userProfile });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: KEYS.userRole,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: KEYS.isAdmin,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useIsAdminSystemInitialized() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: KEYS.adminSystemInitialized,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isAdminSystemInitialized();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useInitializeAdminSystem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAdminInitialized();
    },
    onSuccess: async () => {
      // Invalidate and refetch all admin-related queries
      await queryClient.invalidateQueries({ queryKey: KEYS.adminSystemInitialized });
      await queryClient.invalidateQueries({ queryKey: KEYS.isAdmin });
      await queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      await queryClient.invalidateQueries({ queryKey: KEYS.storeClaimable });
      await queryClient.refetchQueries({ queryKey: KEYS.adminSystemInitialized });
      await queryClient.refetchQueries({ queryKey: KEYS.isAdmin });
    },
  });
}

export function useIsStoreClaimable() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: KEYS.storeClaimable,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isStoreClaimable();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useClaimStoreOwnership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimStoreOwnership();
    },
    onSuccess: async () => {
      // Invalidate and refetch all admin-related queries
      await queryClient.invalidateQueries({ queryKey: KEYS.isAdmin });
      await queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      await queryClient.invalidateQueries({ queryKey: KEYS.adminSystemInitialized });
      await queryClient.invalidateQueries({ queryKey: KEYS.storeClaimable });
      await queryClient.refetchQueries({ queryKey: KEYS.isAdmin });
      await queryClient.refetchQueries({ queryKey: KEYS.adminProducts });
      await queryClient.refetchQueries({ queryKey: KEYS.adminSystemInitialized });
      await queryClient.refetchQueries({ queryKey: KEYS.storeClaimable });
    },
  });
}

// Category Hooks
export function useGetCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: KEYS.categories,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCategory(categoryId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Category>({
    queryKey: KEYS.category(categoryId),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCategory(categoryId);
    },
    enabled: !!actor && !isFetching && !!categoryId,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; name: string; icon: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCategory(params.id, params.name, params.icon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.categories });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.categories });
    },
  });
}

// Product Hooks - Public Storefront (published only)
export function useListStorefrontProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: KEYS.storefrontProducts,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStorefrontProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListStorefrontProductsByCategory(categoryId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: KEYS.storefrontProductsByCategory(categoryId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStorefrontProductsByCategory(categoryId);
    },
    enabled: !!actor && !isFetching && !!categoryId,
  });
}

// Admin Product Hooks - All products (including drafts)
export function useGetAdminProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: KEYS.adminProducts,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useGetProduct(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product>({
    queryKey: KEYS.product(productId),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProduct(productId);
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

// Admin Product Management
export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; title: string; author: string; priceInCents: bigint; categoryId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(params.id, params.title, params.author, params.priceInCents, params.categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.storefrontProducts });
      // Invalidate all category-specific queries
      queryClient.invalidateQueries({ queryKey: ['storefrontProducts', 'category'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; title: string; author: string; priceInCents: bigint; categoryId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(params.id, params.title, params.author, params.priceInCents, params.categoryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.storefrontProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.product(variables.id) });
      // Invalidate all category-specific queries
      queryClient.invalidateQueries({ queryKey: ['storefrontProducts', 'category'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.storefrontProducts });
      // Invalidate all category-specific queries
      queryClient.invalidateQueries({ queryKey: ['storefrontProducts', 'category'] });
    },
  });
}

export function useSetProductPublished() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; isPublished: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setProductPublished(params.id, params.isPublished);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.storefrontProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.product(variables.id) });
      // Invalidate all category-specific queries
      queryClient.invalidateQueries({ queryKey: ['storefrontProducts', 'category'] });
    },
  });
}

export function useUploadProductFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; blob: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadProductFile(params.id, params.blob);
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch admin products to ensure file status updates immediately
      await queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      await queryClient.refetchQueries({ queryKey: KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.product(variables.id) });
    },
  });
}

// Purchase & Download Hooks
export function usePurchaseProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.purchaseProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.purchasedProductIds });
      queryClient.invalidateQueries({ queryKey: KEYS.purchasedProducts });
    },
  });
}

export function useGetPurchasedProductIds() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string[]>({
    queryKey: KEYS.purchasedProductIds,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPurchasedProductIds();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetPurchasedProducts() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Product[]>({
    queryKey: KEYS.purchasedProducts,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const productIds = await actor.getPurchasedProductIds();
      
      if (productIds.length === 0) {
        return [];
      }

      const products = await Promise.all(
        productIds.map(id => actor.getProduct(id))
      );
      
      return products;
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useDownloadProductFile() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.downloadProductFile(productId);
    },
  });
}
