import { Package, Plus, Lock } from 'lucide-react';
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
    if (!user) {
      return;
    }
    addKitToCart(kit);
  };

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

        {/* Kit Items Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Minimum items (can't remove)</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {kit.kit_items.slice(0, 4).map((item) => (
              <Badge 
                key={item.id} 
                variant="secondary" 
                className="text-xs bg-accent text-accent-foreground"
              >
                {item.product?.name} × {item.quantity}
              </Badge>
            ))}
            {kit.kit_items.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{kit.kit_items.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-primary">
            ₹{kit.total_price.toFixed(0)}
          </span>
          <span className="text-sm text-muted-foreground">total</span>
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
