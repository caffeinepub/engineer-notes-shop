import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useSetProductPublished, useUploadProductFile, useGetCategories, useIsAdminSystemInitialized, useGetCallerUserProfile, useInitializeStore } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import SafeProductUploadAction from '../components/admin/SafeProductUploadAction';
import AdminDiagnostics from '../components/admin/AdminDiagnostics';
import AdminUploadsTroubleshootingHint from '../components/admin/AdminUploadsTroubleshootingHint';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutDashboard, Plus, Edit, Trash2, Loader2, Eye, EyeOff, AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import type { Product } from '../backend';
import { Progress } from '@/components/ui/progress';
import { translateAdminError } from '../utils/adminErrors';

interface UploadState {
  isUploading: boolean;
  progress: number;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched, isError: adminError, error: adminErrorObj, refetch: refetchAdmin } = useIsCallerAdmin();
  const { data: products, isLoading: productsLoading, isError: productsError, error: productsErrorObj, refetch: refetchProducts } = useGetAdminProducts();
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  const { data: isAdminSystemInitialized, isLoading: adminSystemInitLoading, isError: adminSystemInitError, error: adminSystemInitErrorObj, refetch: refetchAdminSystemInit } = useIsAdminSystemInitialized();
  const initializeStore = useInitializeStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const setPublished = useSetProductPublished();
  const uploadFile = useUploadProductFile();

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    author: '',
    priceInCents: '',
    categoryId: '',
  });

  // Auto-select first category when categories load or dialog opens
  useEffect(() => {
    if (showCreateDialog && categories && categories.length > 0 && !formData.categoryId) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [showCreateDialog, categories, formData.categoryId]);

  // Auto-select first category when editing
  useEffect(() => {
    if (editingProduct && categories && categories.length > 0) {
      setFormData({
        id: editingProduct.id,
        title: editingProduct.title,
        author: editingProduct.author,
        priceInCents: editingProduct.priceInCents.toString(),
        categoryId: editingProduct.category,
      });
    }
  }, [editingProduct, categories]);

  const principalText = identity?.getPrincipal().toString();
  const adminErrorMessage = adminErrorObj ? translateAdminError(String(adminErrorObj)) : undefined;
  const productsErrorMessage = productsErrorObj ? translateAdminError(String(productsErrorObj)) : undefined;
  const adminSystemInitErrorMessage = adminSystemInitErrorObj ? translateAdminError(String(adminSystemInitErrorObj)) : undefined;

  const isAuthenticated = !!identity;

  const handleInitializeStore = async () => {
    try {
      await initializeStore.mutateAsync();
      toast.success('Admin system initialized successfully');
      // Refetch all admin-related queries
      await Promise.all([
        refetchAdmin(),
        refetchAdminSystemInit(),
        refetchProducts(),
      ]);
    } catch (error: any) {
      const errorMessage = translateAdminError(String(error));
      toast.error('Initialization failed', {
        description: errorMessage,
      });
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="page-container section-spacing">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <LogIn className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Authentication Required</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Please sign in with Internet Identity to access the admin dashboard.
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Go to Storefront
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while checking admin status
  if (!adminFetched || adminLoading) {
    return (
      <div className="page-container section-spacing">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin (after loading completes and query is fetched)
  if (adminFetched && !adminLoading && isAdmin === false) {
    return <AccessDeniedScreen />;
  }

  // Show error state if admin check failed
  if (adminError) {
    return (
      <div className="page-container section-spacing">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Admin Access Check Failed</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>{adminErrorMessage || 'Could not verify admin access. Please try again.'}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetchAdmin()}>
                <RefreshCw className="h-3 w-3 mr-2" />
                Retry
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate({ to: '/' })}>
                Go to Storefront
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      author: '',
      priceInCents: '',
      categoryId: categories && categories.length > 0 ? categories[0].id : '',
    });
  };

  const handleCreateProduct = async () => {
    try {
      await createProduct.mutateAsync({
        id: formData.id,
        title: formData.title,
        author: formData.author,
        priceInCents: BigInt(formData.priceInCents),
        categoryId: formData.categoryId,
      });
      toast.success('Product created successfully');
      setShowCreateDialog(false);
      resetForm();
    } catch (error: any) {
      const errorMessage = translateAdminError(String(error));
      toast.error('Failed to create product', {
        description: errorMessage,
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      await updateProduct.mutateAsync({
        id: formData.id,
        title: formData.title,
        author: formData.author,
        priceInCents: BigInt(formData.priceInCents),
        categoryId: formData.categoryId,
      });
      toast.success('Product updated successfully');
      setEditingProduct(null);
      resetForm();
    } catch (error: any) {
      const errorMessage = translateAdminError(String(error));
      toast.error('Failed to update product', {
        description: errorMessage,
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct.mutateAsync(deletingProduct.id);
      toast.success('Product deleted successfully');
      setDeletingProduct(null);
    } catch (error: any) {
      const errorMessage = translateAdminError(String(error));
      toast.error('Failed to delete product', {
        description: errorMessage,
      });
    }
  };

  const handleTogglePublished = async (product: Product) => {
    try {
      await setPublished.mutateAsync({
        id: product.id,
        isPublished: !product.isPublished,
      });
      toast.success(
        product.isPublished
          ? 'Product unpublished successfully'
          : 'Product published successfully'
      );
    } catch (error: any) {
      const errorMessage = translateAdminError(String(error));
      toast.error('Failed to update product status', {
        description: errorMessage,
      });
    }
  };

  const handleFileSelected = (productId: string) => async (file: File) => {
    setUploadStates(prev => ({
      ...prev,
      [productId]: { isUploading: true, progress: 0 },
    }));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
        (percentage) => {
          setUploadStates(prev => ({
            ...prev,
            [productId]: { isUploading: true, progress: percentage },
          }));
        }
      );

      await uploadFile.mutateAsync({ id: productId, blob });

      toast.success('File uploaded successfully');
      setUploadStates(prev => {
        const newStates = { ...prev };
        delete newStates[productId];
        return newStates;
      });
    } catch (error: any) {
      const errorMessage = translateAdminError(String(error));
      toast.error('Failed to upload file', {
        description: errorMessage,
      });
      setUploadStates(prev => {
        const newStates = { ...prev };
        delete newStates[productId];
        return newStates;
      });
    }
  };

  return (
    <div className="page-container section-spacing">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="h-8 w-8" />
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      </div>

      <AdminDiagnostics
        isAuthenticated={isAuthenticated}
        principalText={principalText}
        profileName={userProfile?.name}
        adminCheckLoading={adminLoading}
        adminCheckError={adminError}
        adminCheckErrorMessage={adminErrorMessage}
        isAdmin={isAdmin}
        productsLoading={productsLoading}
        productsError={productsError}
        productsErrorMessage={productsErrorMessage}
        productsCount={products?.length}
        adminSystemInitLoading={adminSystemInitLoading}
        adminSystemInitError={adminSystemInitError}
        adminSystemInitErrorMessage={adminSystemInitErrorMessage}
        isAdminSystemInitialized={isAdminSystemInitialized}
        onRefreshAdminStatus={refetchAdmin}
      />

      <AdminUploadsTroubleshootingHint
        isAuthenticated={isAuthenticated}
        adminCheckLoading={adminLoading}
        adminCheckError={adminError}
        isAdmin={isAdmin}
        productsLoading={productsLoading}
        productsError={productsError}
        adminSystemInitLoading={adminSystemInitLoading}
        adminSystemInitError={adminSystemInitError}
        isAdminSystemInitialized={isAdminSystemInitialized}
        onRetryAdminCheck={refetchAdmin}
        onRetryProducts={refetchProducts}
        onRetryAdminSystemInit={refetchAdminSystemInit}
        onRetryInitialization={handleInitializeStore}
        isInitializing={initializeStore.isPending}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Button
          onClick={() => {
            resetForm();
            setShowCreateDialog(true);
          }}
          disabled={!isAdmin || categoriesLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Product
        </Button>
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : productsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Products</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{productsErrorMessage || 'Failed to load products'}</span>
            <Button variant="outline" size="sm" onClick={() => refetchProducts()}>
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : !products || products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Button
              onClick={() => {
                resetForm();
                setShowCreateDialog(true);
              }}
              disabled={categoriesLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const uploadState = uploadStates[product.id];
            const categoryName = categories?.find(c => c.id === product.category)?.name || product.category;

            return (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{product.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublished(product)}
                      disabled={setPublished.isPending}
                      title={product.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {product.isPublished ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Author</p>
                    <p className="font-medium">{product.author}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{categoryName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">
                      ${(Number(product.priceInCents) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">File</p>
                    {uploadState?.isUploading ? (
                      <div className="space-y-2">
                        <Progress value={uploadState.progress} />
                        <p className="text-xs text-muted-foreground text-center">
                          Uploading... {uploadState.progress}%
                        </p>
                      </div>
                    ) : product.file ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600">✓ Uploaded</span>
                        <SafeProductUploadAction
                          productId={product.id}
                          onFileSelected={handleFileSelected(product.id)}
                          disabled={uploadFile.isPending}
                        />
                      </div>
                    ) : (
                      <SafeProductUploadAction
                        productId={product.id}
                        onFileSelected={handleFileSelected(product.id)}
                        disabled={uploadFile.isPending}
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingProduct(product);
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingProduct(product)}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your store
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="id">Product ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                placeholder="unique-product-id"
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Product Title"
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Author Name"
              />
            </div>
            <div>
              <Label htmlFor="price">Price (cents)</Label>
              <Input
                id="price"
                type="number"
                value={formData.priceInCents}
                onChange={(e) =>
                  setFormData({ ...formData, priceInCents: e.target.value })
                }
                placeholder="999"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProduct}
              disabled={
                !formData.id ||
                !formData.title ||
                !formData.author ||
                !formData.priceInCents ||
                !formData.categoryId ||
                createProduct.isPending
              }
            >
              {createProduct.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-id">Product ID</Label>
              <Input
                id="edit-id"
                value={formData.id}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Product Title"
              />
            </div>
            <div>
              <Label htmlFor="edit-author">Author</Label>
              <Input
                id="edit-author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Author Name"
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Price (cents)</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.priceInCents}
                onChange={(e) =>
                  setFormData({ ...formData, priceInCents: e.target.value })
                }
                placeholder="999"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingProduct(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProduct}
              disabled={
                !formData.title ||
                !formData.author ||
                !formData.priceInCents ||
                !formData.categoryId ||
                updateProduct.isPending
              }
            >
              {updateProduct.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProduct?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
