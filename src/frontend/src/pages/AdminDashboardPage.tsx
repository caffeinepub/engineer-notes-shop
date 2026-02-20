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
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LayoutDashboard, Plus, Edit, Trash2, Loader2, Eye, EyeOff, AlertCircle, RefreshCw, LogIn, DollarSign, AlertTriangle } from 'lucide-react';
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
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceEditValue, setPriceEditValue] = useState('');

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
    // Validate that category is selected
    if (!formData.categoryId) {
      toast.error('Category required', {
        description: 'Please select a category for the product',
      });
      return;
    }

    console.log('[AdminDashboard] Creating product with data:', {
      id: formData.id,
      title: formData.title,
      author: formData.author,
      priceInCents: formData.priceInCents,
      categoryId: formData.categoryId,
    });

    try {
      await createProduct.mutateAsync({
        id: formData.id,
        title: formData.title,
        author: formData.author,
        priceInCents: BigInt(formData.priceInCents),
        categoryId: formData.categoryId,
      });
      
      const categoryName = categories?.find(c => c.id === formData.categoryId)?.name || formData.categoryId;
      console.log('[AdminDashboard] Product created successfully in category:', categoryName);
      
      toast.success('Product created successfully', {
        description: `Product added to ${categoryName} category`,
      });
      
      setShowCreateDialog(false);
      resetForm();
    } catch (error: any) {
      console.error('[AdminDashboard] Failed to create product:', error);
      const errorMessage = translateAdminError(String(error));
      toast.error('Failed to create product', {
        description: errorMessage,
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    // Validate that category is selected
    if (!formData.categoryId) {
      toast.error('Category required', {
        description: 'Please select a category for the product',
      });
      return;
    }

    console.log('[AdminDashboard] Updating product with data:', {
      id: formData.id,
      title: formData.title,
      author: formData.author,
      priceInCents: formData.priceInCents,
      categoryId: formData.categoryId,
    });

    try {
      await updateProduct.mutateAsync({
        id: formData.id,
        title: formData.title,
        author: formData.author,
        priceInCents: BigInt(formData.priceInCents),
        categoryId: formData.categoryId,
      });
      
      const categoryName = categories?.find(c => c.id === formData.categoryId)?.name || formData.categoryId;
      console.log('[AdminDashboard] Product updated successfully in category:', categoryName);
      
      toast.success('Product updated successfully', {
        description: `Product updated in ${categoryName} category`,
      });
      
      setEditingProduct(null);
      resetForm();
    } catch (error: any) {
      console.error('[AdminDashboard] Failed to update product:', error);
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
    // Check if product has valid price before publishing
    if (!product.isPublished && Number(product.priceInCents) === 0) {
      toast.error('Cannot publish product', {
        description: 'Please set a valid price greater than $0 before publishing',
      });
      return;
    }

    console.log('[AdminDashboard] Toggling published status for product:', {
      id: product.id,
      title: product.title,
      currentStatus: product.isPublished,
      newStatus: !product.isPublished,
      category: product.category,
      priceInCents: product.priceInCents.toString(),
    });

    try {
      await setPublished.mutateAsync({
        id: product.id,
        isPublished: !product.isPublished,
      });
      
      console.log('[AdminDashboard] Product published status updated successfully');
      
      toast.success(
        product.isPublished
          ? 'Product unpublished successfully'
          : 'Product published successfully'
      );
    } catch (error: any) {
      console.error('[AdminDashboard] Failed to update product status:', error);
      const errorMessage = translateAdminError(String(error));
      toast.error('Failed to update product status', {
        description: errorMessage,
      });
    }
  };

  const handleFileSelected = async (productId: string, file: File) => {
    const product = products?.find(p => p.id === productId);
    console.log('[AdminDashboard] Uploading file for product:', {
      productId,
      fileName: file.name,
      fileSize: file.size,
      productCategory: product?.category,
    });

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

      console.log('[AdminDashboard] File uploaded successfully for product:', productId);
      
      toast.success('File uploaded successfully');
      setUploadStates(prev => {
        const newStates = { ...prev };
        delete newStates[productId];
        return newStates;
      });
    } catch (error: any) {
      console.error('[AdminDashboard] Failed to upload file:', error);
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

  const handleStartPriceEdit = (product: Product) => {
    setEditingPrice(product.id);
    setPriceEditValue((Number(product.priceInCents) / 100).toFixed(2));
  };

  const handleSavePrice = async (product: Product) => {
    const priceInDollars = parseFloat(priceEditValue);
    
    if (isNaN(priceInDollars) || priceInDollars < 0) {
      toast.error('Invalid price', {
        description: 'Please enter a valid price (0 or greater)',
      });
      return;
    }

    const priceInCents = Math.round(priceInDollars * 100);

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        title: product.title,
        author: product.author,
        priceInCents: BigInt(priceInCents),
        categoryId: product.category,
      });

      toast.success('Price updated successfully');
      setEditingPrice(null);
      setPriceEditValue('');
    } catch (error: any) {
      const errorMessage = translateAdminError(String(error));
      toast.error('Failed to update price', {
        description: errorMessage,
      });
    }
  };

  const handleCancelPriceEdit = () => {
    setEditingPrice(null);
    setPriceEditValue('');
  };

  const formatPrice = (priceInCents: bigint): string => {
    const dollars = Number(priceInCents) / 100;
    return `$${dollars.toFixed(2)}`;
  };

  const hasValidPrice = (product: Product): boolean => {
    return Number(product.priceInCents) > 0;
  };

  return (
    <TooltipProvider>
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
              const validPrice = hasValidPrice(product);
              const isEditingThisPrice = editingPrice === product.id;

              return (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="line-clamp-2">{product.title}</div>
                        {!validPrice && (
                          <Badge variant="destructive" className="mt-2 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            No price set
                          </Badge>
                        )}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePublished(product)}
                            disabled={setPublished.isPending || (!validPrice && !product.isPublished)}
                            className="shrink-0"
                          >
                            {product.isPublished ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {!validPrice && !product.isPublished
                            ? 'Set price before publishing'
                            : product.isPublished
                            ? 'Unpublish'
                            : 'Publish'}
                        </TooltipContent>
                      </Tooltip>
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
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      {isEditingThisPrice ? (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={priceEditValue}
                              onChange={(e) => setPriceEditValue(e.target.value)}
                              className="pl-7"
                              placeholder="0.00"
                              autoFocus
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSavePrice(product)}
                            disabled={updateProduct.isPending}
                          >
                            {updateProduct.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Save'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelPriceEdit}
                            disabled={updateProduct.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${!validPrice ? 'text-muted-foreground' : ''}`}>
                            {validPrice ? formatPrice(product.priceInCents) : 'Not set'}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartPriceEdit(product)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={product.isPublished ? 'default' : 'secondary'}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </Badge>
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
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          ✓ Uploaded
                        </Badge>
                      ) : (
                        <SafeProductUploadAction
                          productId={product.id}
                          onFileSelected={(file) => handleFileSelected(product.id, file)}
                          disabled={uploadFile.isPending}
                        />
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingProduct(product)}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create/Edit Product Dialog */}
        <Dialog open={showCreateDialog || !!editingProduct} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingProduct(null);
            resetForm();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update the product details below.' : 'Fill in the details to create a new product.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="id">Product ID</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="unique-product-id"
                  disabled={!!editingProduct}
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Product title"
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceInCents ? (Number(formData.priceInCents) / 100).toFixed(2) : ''}
                    onChange={(e) => {
                      const dollars = parseFloat(e.target.value) || 0;
                      const cents = Math.round(dollars * 100);
                      setFormData({ ...formData, priceInCents: cents.toString() });
                    }}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Products must have a price greater than $0 to be published
                </p>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
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
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                disabled={
                  !formData.id ||
                  !formData.title ||
                  !formData.author ||
                  !formData.categoryId ||
                  createProduct.isPending ||
                  updateProduct.isPending
                }
              >
                {(createProduct.isPending || updateProduct.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
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
    </TooltipProvider>
  );
}
