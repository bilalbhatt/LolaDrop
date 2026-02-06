import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroBanner } from '@/components/home/HeroBanner';
import { KitCard } from '@/components/kits/KitCard';
import { ProductCard } from '@/components/products/ProductCard';
import { useKits } from '@/hooks/useKits';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Package, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { data: kits, isLoading: kitsLoading } = useKits();
  const { data: products, isLoading: productsLoading } = useProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroBanner />

        {/* Featured Kits Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Daily Essentials Kits
                </h2>
                <p className="text-muted-foreground mt-1">
                  Pre-built bundles you can only add to, never remove from
                </p>
              </div>
              <Link to="/kits">
                <Button variant="ghost" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {kitsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            ) : kits && kits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kits.slice(0, 3).map((kit) => (
                  <KitCard key={kit.id} kit={kit} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-2xl">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-lg font-semibold text-foreground">No Kits Available</h3>
                <p className="text-muted-foreground mt-1">Check back soon for daily essentials kits!</p>
              </div>
            )}
          </div>
        </section>

        {/* Popular Products Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Popular Products
                </h2>
                <p className="text-muted-foreground mt-1">
                  Add these to your kit or buy separately
                </p>
              </div>
              <Link to="/products">
                <Button variant="ghost" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-56 rounded-xl" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {products.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-background rounded-2xl">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-lg font-semibold text-foreground">No Products Yet</h3>
                <p className="text-muted-foreground mt-1">Products will appear here soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-orange">
          <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            Ready to Save Time & Money?
          </h2>
          <p className="text-secondary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust LolaDrop for their daily essentials. 
            Same day delivery, every day!
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-semibold">
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
