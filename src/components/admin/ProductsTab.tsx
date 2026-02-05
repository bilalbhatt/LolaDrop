 import { useState } from 'react';
 import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { Plus, Trash2, Edit } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Badge } from '@/components/ui/badge';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
 import { ImageUpload } from './ImageUpload';
 import { Product } from '@/lib/types';
 
 export function ProductsTab() {
   const queryClient = useQueryClient();
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
   const [imageUrl, setImageUrl] = useState<string>('');
 
   const { data: products, isLoading } = useQuery({
     queryKey: ['admin-products'],
     queryFn: async () => {
       const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
       if (error) throw error;
       return data as Product[];
     },
   });
 
   const addProductMutation = useMutation({
     mutationFn: async (product: { 
       name: string; 
       description?: string; 
       price: number; 
       original_price?: number;
       discount_percentage?: number;
       unit: string; 
       category?: string; 
       image_url?: string | null 
     }) => {
       const { data, error } = await supabase.from('products').insert([product]).select().single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-products'] });
       queryClient.invalidateQueries({ queryKey: ['products'] });
       setIsAddDialogOpen(false);
       setImageUrl('');
       toast.success('Product added!');
     },
     onError: (error) => {
       toast.error('Failed to add product: ' + error.message);
     },
   });
 
   const updateProductMutation = useMutation({
     mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
       const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-products'] });
       queryClient.invalidateQueries({ queryKey: ['products'] });
       setEditingProduct(null);
       setImageUrl('');
       toast.success('Product updated!');
     },
     onError: (error) => {
       toast.error('Failed to update product: ' + error.message);
     },
   });
 
   const deleteProductMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase.from('products').delete().eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-products'] });
       queryClient.invalidateQueries({ queryKey: ['products'] });
       toast.success('Product deleted!');
     },
     onError: (error) => {
       toast.error('Failed to delete product: ' + error.message);
     },
   });
 
   const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const formData = new FormData(e.currentTarget);
     const price = parseFloat(formData.get('price') as string);
     const originalPrice = parseFloat(formData.get('original_price') as string) || undefined;
     const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
     
     addProductMutation.mutate({
       name: formData.get('name') as string,
       description: formData.get('description') as string,
       price,
       original_price: originalPrice,
       discount_percentage: discountPercentage,
       unit: formData.get('unit') as string,
       category: formData.get('category') as string,
       image_url: imageUrl || null,
     });
   };
 
   const handleEditProduct = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     if (!editingProduct) return;
     
     const formData = new FormData(e.currentTarget);
     const price = parseFloat(formData.get('price') as string);
     const originalPrice = parseFloat(formData.get('original_price') as string) || undefined;
     const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
     
     updateProductMutation.mutate({
       id: editingProduct.id,
       name: formData.get('name') as string,
       description: formData.get('description') as string,
       price,
       original_price: originalPrice,
       discount_percentage: discountPercentage,
       unit: formData.get('unit') as string,
       category: formData.get('category') as string,
       image_url: imageUrl || editingProduct.image_url,
       in_stock: (formData.get('in_stock') as string) === 'true',
     });
   };
 
   const openEditDialog = (product: Product) => {
     setEditingProduct(product);
     setImageUrl(product.image_url || '');
   };
 
   return (
     <Card>
       <CardHeader className="flex flex-row items-center justify-between">
         <CardTitle>Products</CardTitle>
         <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setImageUrl(''); }}>
           <DialogTrigger asChild>
             <Button className="bg-gradient-hero hover:opacity-90">
               <Plus className="h-4 w-4 mr-2" /> Add Product
             </Button>
           </DialogTrigger>
           <DialogContent className="max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>Add New Product</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleAddProduct} className="space-y-4">
               <div className="space-y-2">
                 <Label>Product Image</Label>
                 <ImageUpload currentUrl={null} onUpload={setImageUrl} folder="products" />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="name">Name</Label>
                 <Input id="name" name="name" required />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="description">Description</Label>
                 <Textarea id="description" name="description" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="price">Selling Price (₹)</Label>
                   <Input id="price" name="price" type="number" step="0.01" required />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="original_price">Original Price (₹)</Label>
                   <Input id="original_price" name="original_price" type="number" step="0.01" placeholder="For discount" />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="unit">Unit</Label>
                   <Input id="unit" name="unit" placeholder="kg, piece, pack" required />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="category">Category</Label>
                   <Input id="category" name="category" placeholder="Oil, Spices, Grains..." />
                 </div>
               </div>
               <DialogFooter>
                 <Button type="submit" disabled={addProductMutation.isPending}>
                   {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
                 </Button>
               </DialogFooter>
             </form>
           </DialogContent>
         </Dialog>
       </CardHeader>
       <CardContent>
         {isLoading ? (
           <div className="text-center py-8">Loading products...</div>
         ) : products && products.length > 0 ? (
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Image</TableHead>
                 <TableHead>Name</TableHead>
                 <TableHead>Category</TableHead>
                 <TableHead>Price</TableHead>
                 <TableHead>Discount</TableHead>
                 <TableHead>Stock</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {products.map((product) => (
                 <TableRow key={product.id}>
                   <TableCell>
                     {product.image_url ? (
                       <img src={product.image_url} alt={product.name} className="h-10 w-10 object-cover rounded" />
                     ) : (
                       <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xs">No img</div>
                     )}
                   </TableCell>
                   <TableCell className="font-medium">{product.name}</TableCell>
                   <TableCell>{product.category || '-'}</TableCell>
                   <TableCell>
                     <div className="flex flex-col">
                       <span>₹{Number(product.price).toFixed(0)}</span>
                       {product.original_price && (
                         <span className="text-xs text-muted-foreground line-through">₹{Number(product.original_price).toFixed(0)}</span>
                       )}
                     </div>
                   </TableCell>
                   <TableCell>
                     {product.discount_percentage && product.discount_percentage > 0 ? (
                       <Badge variant="secondary" className="bg-secondary/20">{product.discount_percentage}%</Badge>
                     ) : '-'}
                   </TableCell>
                   <TableCell>
                     <Badge variant={product.in_stock ? 'default' : 'destructive'}>
                       {product.in_stock ? 'In Stock' : 'Out'}
                     </Badge>
                   </TableCell>
                   <TableCell className="text-right">
                     <div className="flex justify-end gap-1">
                       <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                         <DialogTrigger asChild>
                           <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                             <Edit className="h-4 w-4" />
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="max-h-[90vh] overflow-y-auto">
                           <DialogHeader>
                             <DialogTitle>Edit Product</DialogTitle>
                           </DialogHeader>
                           <form onSubmit={handleEditProduct} className="space-y-4">
                             <div className="space-y-2">
                               <Label>Product Image</Label>
                               <ImageUpload currentUrl={imageUrl} onUpload={setImageUrl} folder="products" />
                             </div>
                             <div className="space-y-2">
                               <Label htmlFor="edit-name">Name</Label>
                               <Input id="edit-name" name="name" defaultValue={editingProduct?.name} required />
                             </div>
                             <div className="space-y-2">
                               <Label htmlFor="edit-description">Description</Label>
                               <Textarea id="edit-description" name="description" defaultValue={editingProduct?.description || ''} />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <Label htmlFor="edit-price">Selling Price (₹)</Label>
                                 <Input id="edit-price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                               </div>
                               <div className="space-y-2">
                                 <Label htmlFor="edit-original_price">Original Price (₹)</Label>
                                 <Input id="edit-original_price" name="original_price" type="number" step="0.01" defaultValue={editingProduct?.original_price || ''} />
                               </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <Label htmlFor="edit-unit">Unit</Label>
                                 <Input id="edit-unit" name="unit" defaultValue={editingProduct?.unit} required />
                               </div>
                               <div className="space-y-2">
                                 <Label htmlFor="edit-category">Category</Label>
                                 <Input id="edit-category" name="category" defaultValue={editingProduct?.category || ''} />
                               </div>
                             </div>
                             <div className="space-y-2">
                               <Label htmlFor="edit-in_stock">Stock Status</Label>
                               <select id="edit-in_stock" name="in_stock" className="w-full rounded-md border border-input bg-background px-3 py-2" defaultValue={editingProduct?.in_stock ? 'true' : 'false'}>
                                 <option value="true">In Stock</option>
                                 <option value="false">Out of Stock</option>
                               </select>
                             </div>
                             <DialogFooter>
                               <Button type="submit" disabled={updateProductMutation.isPending}>
                                 {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
                               </Button>
                             </DialogFooter>
                           </form>
                         </DialogContent>
                       </Dialog>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="text-destructive"
                         onClick={() => deleteProductMutation.mutate(product.id)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         ) : (
           <div className="text-center py-8 text-muted-foreground">
             No products yet. Add your first product!
           </div>
         )}
       </CardContent>
     </Card>
   );
 }