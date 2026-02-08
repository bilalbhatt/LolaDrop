import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useKit } from '@/hooks/useKits';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Plus, Lock, ArrowLeft, Percent, ShoppingBag } from 'lucide-react';

export default function KitDetail() {
  const { kitId } = useParams<{ kitId: string }>();
  const { data: kit, isLoading } = useKit(kitId || '');
  const { addKitToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = () => {
    if (!user || !kit) return;
    addKitToCart(kit);
  };

  // Calculate pricing
  const originalTotal = kit?.kit_items.reduce((sum, item) => {
    const originalPrice = item.product?.original_price || item.product?.price || 0;
    return sum + (Number(originalPrice) * item.quantity);
  }, 0) || 0;

  const offeredTotal = kit?.total_price || 0;
  const savings = originalTotal - offeredTotal;
  const discountPercent = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <Link to="/kits" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Kits
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : !kit ? (
            <div className="text-center py-16 bg-background rounded-2xl">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold">Kit Not Found</h2>
              <p className="text-muted-foreground mt-2">This kit doesn't exist or has been removed.</p>
              <Link to="/kits">
                <Button className="mt-4">Browse Kits</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Kit Image & Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-accent to-muted rounded-2xl overflow-hidden flex items-center justify-center">
                  {kit.image_url ? (
                    <img src={kit.image_url} alt={kit.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-24 w-24 text-primary/30" />
                  )}
                  {discountPercent > 0 && (
                    <Badge className="absolute top-4 left-4 bg-green-600 text-white font-bold text-sm gap-1 px-3 py-1">
                      <Percent className="h-4 w-4" />
                      {discountPercent}% OFF
                    </Badge>
                  )}
                </div>

                <div>
                  <h1 className="font-display text-3xl font-bold text-foreground">{kit.name}</h1>
                  {kit.description && (
                    <p className="text-muted-foreground mt-2 text-lg">{kit.description}</p>
                  )}
                </div>

                {/* All Kit Items */}
                <div className="space-y-3">
                  <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Items in this Kit ({kit.kit_items.length})
                  </h2>
                  <div className="grid gap-3">
                    {kit.kit_items.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            {item.product?.image_url ? (
                              <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground">{item.product?.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{Number(item.product?.price || 0).toFixed(0)}/{item.product?.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-semibold text-primary">
                              ₹{(Number(item.product?.price || 0) * item.quantity).toFixed(0)}
                            </p>
                            {item.product?.original_price && Number(item.product.original_price) > Number(item.product.price) && (
                              <p className="text-xs text-muted-foreground line-through">
                                ₹{(Number(item.product.original_price) * item.quantity).toFixed(0)}
                              </p>
                            )}
                          </div>
                          {item.is_mandatory && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Required
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Sidebar */}
              <div>
                <Card className="sticky top-24">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="font-display text-lg font-semibold">Kit Price</h2>
                    
                    {savings > 0 && (
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                        <p className="text-green-700 dark:text-green-400 font-promo text-lg font-bold">
                          You save ₹{savings.toFixed(0)}!
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {savings > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Actual Price (MRP)</span>
                          <span className="line-through text-muted-foreground">₹{originalTotal.toFixed(0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Kit Price</span>
                        <span className="text-primary font-display text-2xl">₹{offeredTotal.toFixed(0)}</span>
                      </div>
                    </div>

                    {user ? (
                      <Button
                        onClick={handleAddToCart}
                        className="w-full bg-gradient-hero hover:opacity-90"
                        size="lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Kit to Cart
                      </Button>
                    ) : (
                      <Link to="/auth" className="w-full">
                        <Button className="w-full bg-gradient-hero hover:opacity-90" size="lg">
                          Sign in to Add
                        </Button>
                      </Link>
                    )}

                    <p className="text-xs text-muted-foreground text-center">
                      You can add more items to the kit but can't remove mandatory ones.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
