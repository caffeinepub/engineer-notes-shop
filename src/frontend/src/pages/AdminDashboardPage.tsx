import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useSetProductPublished, useUploadProductFile, useGetCategories, useIsAdminSystemInitialized, useInitializeAdminSystem, useIsStoreClaimable, useClaimStoreOwnership } from '../hooks/useQueries';
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
import { LayoutDashboard, Plus, Edit, Trash2, Loader2, Eye, EyeOff, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import type { Product } from '../backend';
import { Progress } from '@/components/ui/progress';

interface UploadState {
  isUploading: boolean;
  progress: number;
}

export default function AdminDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, isError: adminError, error: adminErrorObj, refetch: refetchAdmin } = useIsCallerAdmin();
  const { data: products, isLoading: productsLoading, isError: productsError, error: productsErrorObj, refetch: refetchProducts } = useGetAdminProducts();
  const { data: categories } = useGetCategories();
  const { data: isAdminSystemInitialized, isLoading: adminSystemInitLoading, isError: adminSystemInitError, error: adminSystemInitErrorObj, refetch: refetchAdminSystemInit } = useIsAdminSystemInitialized();
  const { data: isStoreClaimable, isLoading: storeClaimableLoading } = useIsStoreClaimable();
  const initializeAdminSystem = useInitializeAdminSystem();
  const claimStoreOwnership = useClaimStoreOwnership();

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
    categoryId: 'default',
  });

  const principalText = identity?.getPrincipal().toString();
  const adminErrorMessage = adminErrorObj instanceof Error ? adminErrorObj.message : String(adminErrorObj || 'Unknown error');
  const productsErrorMessage = productsErrorObj instanceof Error ? productsErrorObj.message : String(productsErrorObj || 'Unknown error');
  const adminSystemInitErrorMessage = adminSystemInitErrorObj instanceof Error ? adminSystemInitErrorObj.message : String(adminSystemInitErrorObj || 'Unknown error');

  // Always show diagnostics at the top
  const diagnosticsSection = (
    <AdminDiagnostics
      isAuthenticated={!!identity}
      principalText={principalText}
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
    />
  );

  // Always show troubleshooting hint
  const troubleshootingHint = (
    <AdminUploadsTroubleshootingHint
      isAuthenticated={!!identity}
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
    />
  );

  // Not signed in
  if (!identity) {
    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
        {troubleshootingHint}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in to access the Admin Dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Admin system initialization loading
  if (adminSystemInitLoading) {
    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
        {troubleshootingHint}
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Checking admin system configuration...</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  // Admin system initialization error
  if (adminSystemInitError) {
    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
        {troubleshootingHint}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Admin System Check Failed</AlertTitle>
          <AlertDescription className="mt-2">
            Unable to verify the admin system configuration. This may be a temporary network issue.
            <div className="mt-3">
              <strong>Error:</strong> {adminSystemInitErrorMessage}
            </div>
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => refetchAdminSystemInit()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Admin System Check
          </Button>
        </div>
      </div>
    );
  }

  // Admin system not initialized - show initialization screen
  if (isAdminSystemInitialized !== undefined && !isAdminSystemInitialized) {
    const handleInitialize = async () => {
      try {
        await initializeAdminSystem.mutateAsync();
        toast.success('Admin system initialized successfully! You are now the store owner.');
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to initialize admin system';
        toast.error(errorMessage);
      }
    };

    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
        {troubleshootingHint}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Initialize Admin System</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Welcome! The admin system needs to be initialized. Click the button below to set yourself as the store owner and begin managing products.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>First-Time Setup</AlertTitle>
              <AlertDescription>
                This is a one-time setup process. Once initialized, you will have full administrative access to manage products, categories, and store settings.
              </AlertDescription>
            </Alert>

            {initializeAdminSystem.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Initialization Failed</AlertTitle>
                <AlertDescription>
                  {initializeAdminSystem.error instanceof Error 
                    ? initializeAdminSystem.error.message 
                    : 'An error occurred during initialization. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleInitialize}
              className="w-full" 
              disabled={initializeAdminSystem.isPending}
            >
              {initializeAdminSystem.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initializing Admin System...
                </>
              ) : (
                'Initialize Admin System'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Admin check loading
  if (adminLoading) {
    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
        {troubleshootingHint}
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  // Admin check error
  if (adminError) {
    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
        {troubleshootingHint}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Check Failed</AlertTitle>
          <AlertDescription className="mt-2">
            Unable to verify your admin permissions. This may be a temporary network issue.
            <div className="mt-3">
              <strong>Error:</strong> {adminErrorMessage}
            </div>
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => refetchAdmin()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Permission Check
          </Button>
        </div>
      </div>
    );
  }

  // Not an admin - check if store is claimable
  if (isAdmin === false) {
    // Show claim button if store is claimable
    if (storeClaimableLoading) {
      return (
        <div className="page-container section-spacing">
          {diagnosticsSection}
          {troubleshootingHint}
          <div className="flex items-center gap-3 mb-8">
            <LayoutDashboard className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Checking store ownership status...</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      );
    }

    if (isStoreClaimable === true) {
      const handleClaimOwnership = async () => {
        try {
          await claimStoreOwnership.mutateAsync();
          toast.success('Store ownership claimed successfully! You are now the store owner.');
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to claim store ownership';
          toast.error(errorMessage);
        }
      };

      return (
        <div className="page-container section-spacing">
          {diagnosticsSection}
          {troubleshootingHint}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Claim Store Owner Access</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    The store owner role is available. Claim it now to manage products and inventory.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Store Ownership Available</AlertTitle>
                <AlertDescription>
                  You can claim the store owner role and gain full administrative access. This action will grant you permissions to manage products, categories, and all store settings.
                </AlertDescription>
              </Alert>

              {claimStoreOwnership.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Claim Failed</AlertTitle>
                  <AlertDescription>
                    {claimStoreOwnership.error instanceof Error 
                      ? claimStoreOwnership.error.message 
                      : 'An error occurred while claiming store ownership. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleClaimOwnership}
                className="w-full" 
                size="lg"
                disabled={claimStoreOwnership.isPending}
              >
                {claimStoreOwnership.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Claiming Store Ownership...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    Claim Store Owner Access
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // Store is not claimable - show access denied
    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
        {troubleshootingHint}
        <AccessDeniedScreen 
          message="You are not authorized as the store owner or administrator. Only the store owner can access the Admin Dashboard to manage products and inventory."
        />
      </div>
    );
  }

  // Admin products query error
  if (productsError) {
    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
        {troubleshootingHint}
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and inventory</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to Load Products</AlertTitle>
          <AlertDescription className="mt-2">
            Unable to retrieve your product list. This may be a temporary network issue.
            <div className="mt-3">
              <strong>Error:</strong> {productsErrorMessage}
            </div>
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => refetchProducts()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading Products
          </Button>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({ id: '', title: '', author: '', priceInCents: '', categoryId: 'default' });
    setEditingProduct(null);
    setShowCreateDialog(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct.mutateAsync({
        id: formData.id,
        title: formData.title,
        author: formData.author,
        priceInCents: BigInt(Math.round(parseFloat(formData.priceInCents) * 100)),
        categoryId: formData.categoryId,
      });
      toast.success('Product created successfully');
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        title: formData.title,
        author: formData.author,
        priceInCents: BigInt(Math.round(parseFloat(formData.priceInCents) * 100)),
        categoryId: formData.categoryId,
      });
      toast.success('Product updated successfully');
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    
    try {
      await deleteProduct.mutateAsync(deletingProduct.id);
      toast.success('Product deleted successfully');
      setDeletingProduct(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      await setPublished.mutateAsync({
        id: product.id,
        isPublished: !product.isPublished,
      });
      toast.success(product.isPublished ? 'Product unpublished' : 'Product published');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
    }
  };

  const handleFileUpload = async (productId: string, file: File) => {
    setUploadStates(prev => ({
      ...prev,
      [productId]: { isUploading: true, progress: 0 }
    }));
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadStates(prev => ({
          ...prev,
          [productId]: { isUploading: true, progress: percentage }
        }));
      });

      await uploadFile.mutateAsync({ id: productId, blob });
      
      toast.success('File uploaded successfully');
      setUploadStates(prev => ({
        ...prev,
        [productId]: { isUploading: false, progress: 100 }
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
      setUploadStates(prev => ({
        ...prev,
        [productId]: { isUploading: false, progress: 0 }
      }));
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      title: product.title,
      author: product.author,
      priceInCents: (Number(product.priceInCents) / 100).toFixed(2),
      categoryId: product.category,
    });
  };

  return (
    <div className="page-container section-spacing">
      {diagnosticsSection}
      {troubleshootingHint}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and inventory</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {productsLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : products && products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No products yet. Create your first product to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => {
            const uploadState = uploadStates[product.id];
            return (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingProduct(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">by {product.author}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Price:</span>
                    <span className="text-sm">${(Number(product.priceInCents) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`text-sm ${product.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                      {product.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">File:</span>
                    <span className="text-sm">{product.file ? 'Uploaded' : 'Not uploaded'}</span>
                  </div>
                  
                  {uploadState?.isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadState.progress}%</span>
                      </div>
                      <Progress value={uploadState.progress} />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <SafeProductUploadAction
                    productId={product.id}
                    onFileSelected={(file) => handleFileUpload(product.id, file)}
                    disabled={uploadState?.isUploading}
                  />
                  <Button
                    variant={product.isPublished ? 'outline' : 'default'}
                    className="w-full"
                    onClick={() => handleTogglePublish(product)}
                    disabled={setPublished.isPending}
                  >
                    {product.isPublished ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Product Dialog */}
      <Dialog open={showCreateDialog || !!editingProduct} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the product details below.' : 'Fill in the details to create a new product.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingProduct ? handleUpdate : handleCreate} className="space-y-4">
            {!editingProduct && (
              <div className="space-y-2">
                <Label htmlFor="id">Product ID</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="unique-product-id"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Product title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.priceInCents}
                onChange={(e) => setFormData({ ...formData, priceInCents: e.target.value })}
                placeholder="9.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                {(createProduct.isPending || updateProduct.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProduct?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteProduct.isPending}>
              {deleteProduct.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
