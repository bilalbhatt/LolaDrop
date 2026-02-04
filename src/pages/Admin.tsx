import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Package, ShoppingBag, Edit, Users } from 'lucide-react';
import { Product, Kit, KitItem } from '@/lib/types';

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  if (!authLoading && (!user || !isAdmin)) {
    navigate('/');
    return null;
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Admin Panel
              </h1>
              <p className="text-muted-foreground mt-1">Manage kits, products, and users</p>
            </div>
            <Badge className="bg-primary">Admin</Badge>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="products" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="kits" className="gap-2">
                <Package className="h-4 w-4" />
                Kits
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ProductsTab />
            </TabsContent>

            <TabsContent value="kits">
              <KitsTab />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Products Tab Component
function ProductsTab() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (product: { name: string; description?: string; price: number; unit: string; category?: string; image_url?: string | null }) => {
      const { data, error } = await supabase.from('products').insert([product]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAddDialogOpen(false);
      toast.success('Product added!');
    },
    onError: (error) => {
      toast.error('Failed to add product: ' + error.message);
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
    addProductMutation.mutate({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      unit: formData.get('unit') as string,
      category: formData.get('category') as string,
      image_url: formData.get('image_url') as string || null,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
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
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" name="price" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" name="unit" placeholder="kg, piece, pack" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="Oil, Spices, Grains..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input id="image_url" name="image_url" type="url" />
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
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>₹{Number(product.price).toFixed(0)}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>
                    <Badge variant={product.in_stock ? 'default' : 'destructive'}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteProductMutation.mutate(product.id)}
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
            No products yet. Add your first product!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Kits Tab Component
function KitsTab() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

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
      toast.success('Kit created!');
    },
    onError: (error) => {
      toast.error('Failed to create kit: ' + error.message);
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
      image_url: formData.get('image_url') as string || null,
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  <Label htmlFor="kit-name">Kit Name</Label>
                  <Input id="kit-name" name="name" placeholder="Monthly Essentials Kit" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kit-description">Description</Label>
                  <Textarea id="kit-description" name="description" placeholder="Everything you need for the month..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kit-image">Image URL</Label>
                  <Input id="kit-image" name="image_url" type="url" />
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
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedKitId === kit.id ? 'border-primary bg-accent' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedKitId(kit.id)}
                >
                  <h3 className="font-medium">{kit.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{kit.description}</p>
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

// Users Tab Component
function UsersTab() {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : profiles && profiles.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name || 'N/A'}</TableCell>
                  <TableCell>{profile.phone || 'N/A'}</TableCell>
                  <TableCell>{profile.address || 'N/A'}</TableCell>
                  <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No users yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
