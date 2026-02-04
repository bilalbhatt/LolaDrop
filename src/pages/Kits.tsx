import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { KitCard } from '@/components/kits/KitCard';
import { useKits } from '@/hooks/useKits';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

export default function Kits() {
  const { data: kits, isLoading } = useKits();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        {/* Page Header */}
        <div className="bg-gradient-hero py-12">
          <div className="container">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
              Daily Essentials Kits
            </h1>
            <p className="text-primary-foreground/80 mt-2 max-w-2xl">
              Pre-built bundles with minimum quantities you need. Can't remove items, 
              but you can always add more to your order!
            </p>
          </div>
        </div>

        {/* Kits Grid */}
        <div className="container py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : kits && kits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kits.map((kit) => (
                <KitCard key={kit.id} kit={kit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background rounded-2xl">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold text-foreground">No Kits Available</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Our team is preparing fresh daily kits for you. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
