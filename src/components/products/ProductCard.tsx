import { useState } from 'react';
import { Plus, ShoppingBag, Percent, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isAdding } = useCart();
  const { user } = useAuth();
  const [localAdding, setLocalAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!user) return;
    setLocalAdding(true);
    await addToCart(product.id);
    setTimeout(() => setLocalAdding(false), 500);
  };

  return (
    <Card className={`group overflow-hidden border hover:border-primary/30 transition-all duration-300 hover:shadow-card ${localAdding ? 'animate-pulse ring-2 ring-primary' : ''}`}>
      <CardContent className="p-0">
        <div className="relative h-36 bg-gradient-to-br from-muted to-accent/50 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
          {product.category && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 text-xs bg-background/80 backdrop-blur-sm"
            >
              {product.category}
            </Badge>
          )}
          
          {/* Adding animation overlay */}
          {localAdding && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-pulse">
              <div className="bg-primary text-primary-foreground rounded-full p-2">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 space-y-2">
          <h3 className="font-medium text-sm text-foreground line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          <div className="flex items-baseline gap-1 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-primary">
                ₹{Number(product.price).toFixed(0)}
              </span>
              {product.discount_percentage && product.discount_percentage > 0 && (
                <>
                  {product.original_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{Number(product.original_price).toFixed(0)}
                    </span>
                  )}
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground text-xs">
                    <Percent className="h-3 w-3 mr-0.5" />
                    {product.discount_percentage}% OFF
                  </Badge>
                </>
              )}
            </div>
            <span className="text-xs text-muted-foreground">/{product.unit}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0">
        {user ? (
          <Button 
            onClick={handleAddToCart}
            disabled={!product.in_stock || localAdding}
            size="sm"
            className={`w-full bg-gradient-hero hover:opacity-90 disabled:opacity-50 transition-all ${localAdding ? 'scale-95' : ''}`}
          >
            {localAdding ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        ) : (
          <Link to="/auth" className="w-full">
            <Button size="sm" className="w-full bg-gradient-hero hover:opacity-90">
              Sign in
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
