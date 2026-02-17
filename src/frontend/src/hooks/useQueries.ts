import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Product, UserRole } from '../backend';
import { ExternalBlob } from '../backend';

// Query Keys
const KEYS = {
  userProfile: ['currentUserProfile'],
  userRole: ['currentUserRole'],
  isAdmin: ['isAdmin'],
  storefrontProducts: ['storefrontProducts'],
  adminProducts: ['adminProducts'],
  purchasedProductIds: ['purchasedProductIds'],
  product: (id: string) => ['product', id],
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
    mutationFn: async (params: { id: string; title: string; author: string; priceInCents: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(params.id, params.title, params.author, params.priceInCents);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.storefrontProducts });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; title: string; author: string; priceInCents: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(params.id, params.title, params.author, params.priceInCents);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.storefrontProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.product(variables.id) });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.storefrontProducts });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.storefrontProducts });
      queryClient.invalidateQueries({ queryKey: KEYS.product(variables.id) });
    },
  });
}

// Purchase & Entitlements
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
  const { data: purchasedIds, isLoading: idsLoading } = useGetPurchasedProductIds();

  return useQuery<Product[]>({
    queryKey: ['purchasedProducts', purchasedIds],
    queryFn: async () => {
      if (!actor || !purchasedIds || purchasedIds.length === 0) return [];
      
      const products = await Promise.all(
        purchasedIds.map(async (id) => {
          try {
            return await actor.getProduct(id);
          } catch (error) {
            console.error(`Failed to fetch product ${id}:`, error);
            return null;
          }
        })
      );
      
      return products.filter((p): p is Product => p !== null);
    },
    enabled: !!actor && !isFetching && !idsLoading && !!purchasedIds,
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['purchasedProducts'] });
    },
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
