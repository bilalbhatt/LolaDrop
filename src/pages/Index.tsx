import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryBar } from '@/components/home/CategoryBar';
import { PromoBanner } from '@/components/home/PromoBanner';
import { MakeYourOrder } from '@/components/home/MakeYourOrder';
import { KitCard } from '@/components/kits/KitCard';
import { ProductCard } from '@/components/products/ProductCard';
import { useKits } from '@/hooks/useKits';
import { useProducts } from '@/hooks/useProducts';
import { useActivePromotions } from '@/hooks/usePromotions';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Package, ShoppingBag, Sparkles, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { data: kits, isLoading: kitsLoading } = useKits();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: activePromotions } = useActivePromotions();

  // Filter promotions that could be special occasions (with banner images)
  const specialOccasions = activePromotions?.filter(p => p.banner_image_url || p.description) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PromoBanner />
      <CategoryBar />
      
      <main className="flex-1">
        <HeroBanner />

        {/* Special Occasions Section */}
        {specialOccasions.length > 0 && (
          <section className="py-10 bg-gradient-to-b from-lola-orange-50 to-background">
            <div className="container">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-secondary" />
                <h2 className="font-promo text-2xl md:text-3xl font-bold text-foreground">
                  Special Offers & Occasions
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialOccasions.map((promo) => (
                  <div
                    key={promo.id}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/10 to-accent border-2 border-secondary/20 p-6 hover:shadow-hover transition-all group"
                  >
                    {promo.banner_image_url && (
                      <img 
                        src={promo.banner_image_url} 
                        alt={promo.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                      />
                    )}
                    <div className="relative z-10">
                      <h3 className="font-promo text-xl font-bold text-foreground">{promo.title}</h3>
                      {promo.description && (
                        <p className="text-sm text-muted-foreground mt-1">{promo.description}</p>
                      )}
                      {promo.discount_percentage && promo.discount_percentage > 0 && (
                        <span className="inline-block mt-3 bg-secondary text-secondary-foreground font-promo font-bold text-lg px-4 py-1 rounded-full">
                          {promo.discount_percentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Kits Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Daily Essentials Kits
                </h2>
                <p className="text-muted-foreground mt-1">
                  Pre-built bundles — add more items, manage what you need!
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

        {/* Make Your Own Order */}
        <MakeYourOrder />

        {/* Become a Seller CTA */}
        <section className="py-12 bg-background">
          <div className="container">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 to-accent border-2 border-primary/20 p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                      Want to Sell on LolaDrop?
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Join our marketplace and reach thousands of customers in your area.
                    </p>
                  </div>
                </div>
                <Link to="/become-seller">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2 font-semibold whitespace-nowrap">
                    <Store className="h-5 w-5" />
                    Become a Seller
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
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
            <Link to="/products">
              <Button size="lg" className="bg-lola-yellow-400 text-foreground hover:bg-lola-yellow-500 font-semibold shadow-lg">
                Browse Products
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
