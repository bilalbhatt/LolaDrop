import { Plus, ShoppingBag } from 'lucide-react';
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
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = () => {
    if (!user) return;
    addToCart(product.id);
  };

  return (
    <Card className="group overflow-hidden border hover:border-primary/30 transition-all duration-300 hover:shadow-card">
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
        </div>

        <div className="p-3 space-y-2">
          <h3 className="font-medium text-sm text-foreground line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          <div className="flex items-baseline gap-1">
            <span className="font-display text-lg font-bold text-primary">
              ₹{Number(product.price).toFixed(0)}
            </span>
            <span className="text-xs text-muted-foreground">/{product.unit}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0">
        {user ? (
          <Button 
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            size="sm"
            className="w-full bg-gradient-hero hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
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
