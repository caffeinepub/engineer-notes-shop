import { useState, useEffect } from 'react';
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
import { LayoutDashboard, Plus, Edit, Trash2, Loader2, Eye, EyeOff, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
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
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading, isError: adminError, error: adminErrorObj, refetch: refetchAdmin } = useIsCallerAdmin();
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
  const adminErrorMessage = adminErrorObj instanceof Error ? adminErrorObj.message : String(adminErrorObj || 'Unknown error');
  const productsErrorMessage = productsErrorObj instanceof Error ? productsErrorObj.message : String(productsErrorObj || 'Unknown error');
  const adminSystemInitErrorMessage = adminSystemInitErrorObj instanceof Error ? adminSystemInitErrorObj.message : String(adminSystemInitErrorObj || 'Unknown error');

  const handleInitializeAsOwner = async () => {
    try {
      await initializeStore.mutateAsync();
      toast.success('Successfully initialized as owner! You now have admin access.');
      // Refresh all admin-related queries
      await refetchAdminSystemInit();
      await refetchAdmin();
      await refetchProducts();
    } catch (error: any) {
      const errorMessage = translateAdminError(error);
      toast.error(`Failed to initialize: ${errorMessage}`);
      console.error('Initialization error:', error);
    }
  };

  // Always show diagnostics at the top
  const diagnosticsSection = (
    <AdminDiagnostics
      isAuthenticated={!!identity}
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
    />
  );

  // Show loading state while checking authentication and admin status
  if (!identity || adminLoading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        {diagnosticsSection}
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Show access denied if user is not admin
  if (isAdmin === false) {
    const initializeButton = (
      <Button 
        onClick={handleInitializeAsOwner}
        disabled={initializeStore.isPending}
        className="gap-2"
      >
        {initializeStore.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Initializing...
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Initialize as Owner
          </>
        )}
      </Button>
    );

    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        {diagnosticsSection}
        <AccessDeniedScreen customAction={initializeButton} />
      </div>
    );
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setFormData({ id: '', title: '', author: '', priceInCents: '', categoryId: '' });
    } catch (error: any) {
      const errorMessage = translateAdminError(error);
      toast.error(errorMessage);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setFormData({ id: '', title: '', author: '', priceInCents: '', categoryId: '' });
    } catch (error: any) {
      const errorMessage = translateAdminError(error);
      toast.error(errorMessage);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct.mutateAsync(deletingProduct.id);
      toast.success('Product deleted successfully');
      setDeletingProduct(null);
    } catch (error: any) {
      const errorMessage = translateAdminError(error);
      toast.error(errorMessage);
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
      const errorMessage = translateAdminError(error);
      toast.error(errorMessage);
    }
  };

  const handleFileSelected = async (productId: string, file: File) => {
    setUploadStates(prev => ({
      ...prev,
      [productId]: { isUploading: true, progress: 0 },
    }));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadStates(prev => ({
          ...prev,
          [productId]: { isUploading: true, progress: percentage },
        }));
      });

      await uploadFile.mutateAsync({ id: productId, blob });
      toast.success('File uploaded successfully');
      setUploadStates(prev => {
        const newStates = { ...prev };
        delete newStates[productId];
        return newStates;
      });
    } catch (error: any) {
      const errorMessage = translateAdminError(error);
      toast.error(errorMessage);
      setUploadStates(prev => {
        const newStates = { ...prev };
        delete newStates[productId];
        return newStates;
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Product
        </Button>
      </div>

      {diagnosticsSection}

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
        onRetryInitialization={handleInitializeAsOwner}
        isInitializing={initializeStore.isPending}
      />

      {productsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : productsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading products</AlertTitle>
          <AlertDescription>{productsErrorMessage}</AlertDescription>
        </Alert>
      ) : !products || products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Button onClick={() => setShowCreateDialog(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Create your first product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const uploadState = uploadStates[product.id];
            return (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2">{product.title}</span>
                    <Button
                      variant={product.isPublished ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handleTogglePublished(product)}
                      disabled={setPublished.isPending}
                      className="shrink-0"
                    >
                      {product.isPublished ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Author:</span> {product.author}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Price:</span> $
                      {(Number(product.priceInCents) / 100).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Category:</span> {product.category}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Status:</span>{' '}
                      {product.isPublished ? 'Published' : 'Draft'}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">File:</span>{' '}
                      {product.file ? 'Uploaded' : 'Not uploaded'}
                    </p>
                  </div>

                  {uploadState?.isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uploading...</span>
                        <span className="font-medium">{uploadState.progress}%</span>
                      </div>
                      <Progress value={uploadState.progress} />
                    </div>
                  )}

                  {!uploadState?.isUploading && (
                    <SafeProductUploadAction
                      productId={product.id}
                      onFileSelected={(file) => handleFileSelected(product.id, file)}
                      disabled={uploadFile.isPending}
                    />
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                    className="flex-1 gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingProduct(product)}
                    className="flex-1 gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
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
              Add a new product to your store. You can upload the file after creation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4">
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
              <Label htmlFor="price">Price (in cents)</Label>
              <Input
                id="price"
                type="number"
                value={formData.priceInCents}
                onChange={(e) => setFormData({ ...formData, priceInCents: e.target.value })}
                placeholder="999"
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger>
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information. The product ID cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-id">Product ID</Label>
              <Input id="edit-id" value={formData.id} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Product title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-author">Author</Label>
              <Input
                id="edit-author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (in cents)</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.priceInCents}
                onChange={(e) => setFormData({ ...formData, priceInCents: e.target.value })}
                placeholder="999"
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger>
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingProduct?.title}". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
