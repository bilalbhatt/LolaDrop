import { Package, Plus, Lock, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { KitWithItems } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface KitCardProps {
  kit: KitWithItems;
}

export function KitCard({ kit }: KitCardProps) {
  const { addKitToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = () => {
    if (!user) return;
    addKitToCart(kit);
  };

  // Calculate pricing
  const originalTotal = kit.kit_items.reduce((sum, item) => {
    const originalPrice = item.product?.original_price || item.product?.price || 0;
    return sum + (Number(originalPrice) * item.quantity);
  }, 0);

  const offeredTotal = kit.total_price;
  const savings = originalTotal - offeredTotal;
  const discountPercent = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

  return (
    <Card className="group overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-hover">
      <CardHeader className="p-0">
        <div className="relative h-40 bg-gradient-to-br from-accent to-muted flex items-center justify-center overflow-hidden">
          {kit.image_url ? (
            <img 
              src={kit.image_url} 
              alt={kit.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Package className="h-16 w-16 text-primary/40" />
          )}
          <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
            {kit.kit_items.length} items
          </Badge>
          {discountPercent > 0 && (
            <Badge className="absolute top-3 left-3 bg-green-600 text-white font-bold gap-1">
              <Percent className="h-3 w-3" />
              {discountPercent}% OFF
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground line-clamp-1">
            {kit.name}
          </h3>
          {kit.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {kit.description}
            </p>
          )}
        </div>

        {/* Kit Items - Show All */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Kit items included</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {kit.kit_items.map((item) => (
              <Badge 
                key={item.id} 
                variant="secondary" 
                className="text-xs bg-accent text-accent-foreground"
              >
                {item.product?.name} × {item.quantity}
              </Badge>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-primary">
              ₹{offeredTotal.toFixed(0)}
            </span>
            {savings > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                MRP ₹{originalTotal.toFixed(0)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-xs text-green-600 font-semibold">
              You save ₹{savings.toFixed(0)} on this kit!
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Link to={`/kits/${kit.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        {user ? (
          <Button 
            onClick={handleAddToCart}
            className="flex-1 bg-gradient-hero hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Kit
          </Button>
        ) : (
          <Link to="/auth" className="flex-1">
            <Button className="w-full bg-gradient-hero hover:opacity-90">
              Sign in to Add
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
