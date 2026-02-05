 import { useState } from 'react';
 import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { Plus, Trash2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
 import { ImageUpload } from './ImageUpload';
 import { Kit, KitItem, Product } from '@/lib/types';
 
 export function KitsTab() {
   const queryClient = useQueryClient();
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
   const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
   const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
   const [kitImageUrl, setKitImageUrl] = useState<string>('');
 
   const { data: kits, isLoading } = useQuery({
     queryKey: ['admin-kits'],
     queryFn: async () => {
       const { data, error } = await supabase.from('kits').select('*').order('created_at', { ascending: false });
       if (error) throw error;
       return data as Kit[];
     },
   });
 
   const { data: products } = useQuery({
     queryKey: ['admin-products-for-kits'],
     queryFn: async () => {
       const { data, error } = await supabase.from('products').select('*');
       if (error) throw error;
       return data as Product[];
     },
   });
 
   const { data: kitItems } = useQuery({
     queryKey: ['admin-kit-items', selectedKitId],
     queryFn: async () => {
       if (!selectedKitId) return [];
       const { data, error } = await supabase
         .from('kit_items')
         .select('*, product:products(*)')
         .eq('kit_id', selectedKitId);
       if (error) throw error;
       return data as KitItem[];
     },
     enabled: !!selectedKitId,
   });
 
   const addKitMutation = useMutation({
     mutationFn: async (kit: { name: string; description?: string; image_url?: string | null }) => {
       const { data, error } = await supabase.from('kits').insert([kit]).select().single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-kits'] });
       queryClient.invalidateQueries({ queryKey: ['kits'] });
       setIsAddDialogOpen(false);
       setKitImageUrl('');
       toast.success('Kit created!');
     },
     onError: (error) => {
       toast.error('Failed to create kit: ' + error.message);
     },
   });
 
   const deleteKitMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase.from('kits').delete().eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-kits'] });
       queryClient.invalidateQueries({ queryKey: ['kits'] });
       setSelectedKitId(null);
       toast.success('Kit deleted!');
     },
     onError: (error) => {
       toast.error('Failed to delete kit: ' + error.message);
     },
   });
 
   const addKitItemMutation = useMutation({
     mutationFn: async (item: { kit_id: string; product_id: string; quantity: number }) => {
       const { data, error } = await supabase.from('kit_items').insert(item).select().single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-kit-items', selectedKitId] });
       queryClient.invalidateQueries({ queryKey: ['kits'] });
       setIsAddItemDialogOpen(false);
       toast.success('Item added to kit!');
     },
     onError: (error) => {
       toast.error('Failed to add item: ' + error.message);
     },
   });
 
   const deleteKitItemMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase.from('kit_items').delete().eq('id', id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-kit-items', selectedKitId] });
       queryClient.invalidateQueries({ queryKey: ['kits'] });
       toast.success('Item removed from kit!');
     },
     onError: (error) => {
       toast.error('Failed to remove item: ' + error.message);
     },
   });
 
   const handleAddKit = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const formData = new FormData(e.currentTarget);
     addKitMutation.mutate({
       name: formData.get('name') as string,
       description: formData.get('description') as string,
       image_url: kitImageUrl || null,
     });
   };
 
   const handleAddKitItem = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const formData = new FormData(e.currentTarget);
     if (!selectedKitId) return;
     addKitItemMutation.mutate({
       kit_id: selectedKitId,
       product_id: formData.get('product_id') as string,
       quantity: parseInt(formData.get('quantity') as string),
     });
   };
 
   return (
     <div className="grid lg:grid-cols-2 gap-6">
       {/* Kits List */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle>Kits</CardTitle>
           <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setKitImageUrl(''); }}>
             <DialogTrigger asChild>
               <Button className="bg-gradient-hero hover:opacity-90">
                 <Plus className="h-4 w-4 mr-2" /> Add Kit
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Create New Kit</DialogTitle>
               </DialogHeader>
               <form onSubmit={handleAddKit} className="space-y-4">
                 <div className="space-y-2">
                   <Label>Kit Image</Label>
                   <ImageUpload currentUrl={null} onUpload={setKitImageUrl} folder="kits" />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="kit-name">Kit Name</Label>
                   <Input id="kit-name" name="name" placeholder="Monthly Essentials Kit" required />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="kit-description">Description</Label>
                   <Textarea id="kit-description" name="description" placeholder="Everything you need for the month..." />
                 </div>
                 <DialogFooter>
                   <Button type="submit" disabled={addKitMutation.isPending}>
                     {addKitMutation.isPending ? 'Creating...' : 'Create Kit'}
                   </Button>
                 </DialogFooter>
               </form>
             </DialogContent>
           </Dialog>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="text-center py-8">Loading kits...</div>
           ) : kits && kits.length > 0 ? (
             <div className="space-y-2">
               {kits.map((kit) => (
                 <div
                   key={kit.id}
                   className={`p-4 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
                     selectedKitId === kit.id ? 'border-primary bg-accent' : 'hover:bg-muted'
                   }`}
                   onClick={() => setSelectedKitId(kit.id)}
                 >
                   {kit.image_url ? (
                     <img src={kit.image_url} alt={kit.name} className="h-12 w-12 object-cover rounded" />
                   ) : (
                     <div className="h-12 w-12 bg-muted rounded flex items-center justify-center text-xs">No img</div>
                   )}
                   <div className="flex-1">
                     <h3 className="font-medium">{kit.name}</h3>
                     <p className="text-sm text-muted-foreground line-clamp-1">{kit.description}</p>
                   </div>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="text-destructive"
                     onClick={(e) => { e.stopPropagation(); deleteKitMutation.mutate(kit.id); }}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-8 text-muted-foreground">
               No kits yet. Create your first kit!
             </div>
           )}
         </CardContent>
       </Card>
 
       {/* Kit Items */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle>
             {selectedKitId ? 'Kit Items' : 'Select a Kit'}
           </CardTitle>
           {selectedKitId && (
             <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
               <DialogTrigger asChild>
                 <Button size="sm" className="bg-gradient-hero hover:opacity-90">
                   <Plus className="h-4 w-4 mr-2" /> Add Item
                 </Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>Add Item to Kit</DialogTitle>
                 </DialogHeader>
                 <form onSubmit={handleAddKitItem} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="product_id">Product</Label>
                     <select
                       id="product_id"
                       name="product_id"
                       className="w-full rounded-md border border-input bg-background px-3 py-2"
                       required
                     >
                       <option value="">Select a product</option>
                       {products?.map((product) => (
                         <option key={product.id} value={product.id}>
                           {product.name} - ₹{Number(product.price).toFixed(0)}/{product.unit}
                         </option>
                       ))}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="quantity">Quantity</Label>
                     <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
                   </div>
                   <DialogFooter>
                     <Button type="submit" disabled={addKitItemMutation.isPending}>
                       {addKitItemMutation.isPending ? 'Adding...' : 'Add Item'}
                     </Button>
                   </DialogFooter>
                 </form>
               </DialogContent>
             </Dialog>
           )}
         </CardHeader>
         <CardContent>
           {!selectedKitId ? (
             <div className="text-center py-8 text-muted-foreground">
               Select a kit to manage its items
             </div>
           ) : kitItems && kitItems.length > 0 ? (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Product</TableHead>
                   <TableHead>Quantity</TableHead>
                   <TableHead>Price</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {kitItems.map((item) => (
                   <TableRow key={item.id}>
                     <TableCell className="font-medium">{item.product?.name}</TableCell>
                     <TableCell>{item.quantity} {item.product?.unit}</TableCell>
                     <TableCell>₹{(Number(item.product?.price || 0) * item.quantity).toFixed(0)}</TableCell>
                     <TableCell className="text-right">
                       <Button
                         variant="ghost"
                         size="icon"
                         className="text-destructive"
                         onClick={() => deleteKitItemMutation.mutate(item.id)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           ) : (
             <div className="text-center py-8 text-muted-foreground">
               No items in this kit. Add some products!
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }