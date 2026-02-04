import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { data: products, isLoading } = useProducts(selectedCategory);
  const { data: categories } = useCategories();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        {/* Page Header */}
        <div className="bg-gradient-hero py-12">
          <div className="container">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
              All Products
            </h1>
            <p className="text-primary-foreground/80 mt-2">
              Add these to your kit or buy separately. Same day delivery!
            </p>
          </div>
        </div>

        <div className="container py-8">
          {/* Category Filters */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={selectedCategory === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
                className={selectedCategory === undefined ? 'bg-gradient-hero' : ''}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-gradient-hero' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background rounded-2xl">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold text-foreground">No Products Found</h2>
              <p className="text-muted-foreground mt-2">
                {selectedCategory ? `No products in "${selectedCategory}" category.` : 'Products will appear here soon!'}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
