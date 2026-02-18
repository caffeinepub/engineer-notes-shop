import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useSetProductPublished, useUploadProductFile } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import ProductFileUploadButton from '../components/admin/ProductFileUploadButton';
import AdminDiagnostics from '../components/admin/AdminDiagnostics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LayoutDashboard, Plus, Edit, Trash2, Loader2, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
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
  });

  const principalText = identity?.getPrincipal().toString();
  const adminErrorMessage = adminErrorObj instanceof Error ? adminErrorObj.message : String(adminErrorObj || 'Unknown error');
  const productsErrorMessage = productsErrorObj instanceof Error ? productsErrorObj.message : String(productsErrorObj || 'Unknown error');

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
    />
  );

  // Not signed in
  if (!identity) {
    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
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

  // Admin check loading
  if (adminLoading) {
    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
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

  // Not an admin
  if (isAdmin === false) {
    return (
      <div className="page-container section-spacing">
        {diagnosticsSection}
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
    setFormData({ id: '', title: '', author: '', priceInCents: '' });
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploadStates(prev => {
        const newStates = { ...prev };
        delete newStates[productId];
        return newStates;
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      title: product.title,
      author: product.author,
      priceInCents: (Number(product.priceInCents) / 100).toFixed(2),
    });
  };

  return (
    <div className="page-container section-spacing">
      {diagnosticsSection}
      
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
          New Product
        </Button>
      </div>

      {productsLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No products yet. Create your first product to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const uploadState = uploadStates[product.id];
            const isUploading = uploadState?.isUploading || false;
            const uploadProgress = uploadState?.progress || 0;

            return (
              <Card key={product.id} data-testid={`product-card-${product.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublish(product)}
                        disabled={setPublished.isPending}
                      >
                        {product.isPublished ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">by {product.author}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold">
                        ${(Number(product.priceInCents) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={product.isPublished ? 'text-green-600' : 'text-muted-foreground'}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">File:</span>
                      <span className={product.file ? 'text-green-600' : 'text-muted-foreground'}>
                        {product.file ? 'Uploaded' : 'Not uploaded'}
                      </span>
                    </div>
                    
                    {isUploading && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} />
                        <p className="text-xs text-muted-foreground text-center">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(product)}
                    className="flex-1 min-w-[80px]"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <div 
                    className="flex-1 min-w-[120px]" 
                    data-testid={`upload-action-${product.id}`}
                  >
                    <ProductFileUploadButton
                      productId={product.id}
                      onFileSelected={(file) => handleFileUpload(product.id, file)}
                      disabled={isUploading}
                      isLoading={isUploading}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingProduct(product)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingProduct} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <form onSubmit={editingProduct ? handleUpdate : handleCreate}>
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product details' : 'Add a new product to your store'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!editingProduct && (
                <div>
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
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Product title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.priceInCents}
                  onChange={(e) => setFormData({ ...formData, priceInCents: e.target.value })}
                  placeholder="9.99"
                  required
                />
              </div>
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingProduct?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteProduct.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
