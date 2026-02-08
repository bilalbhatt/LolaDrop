import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Clock, Truck, ShieldCheck } from 'lucide-react';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-background/20" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-background/20" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-background/20" />
      </div>

      <div className="container relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="text-primary-foreground space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/20 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-lola-yellow-400" />
              <span className="text-sm font-medium">Same Day Delivery Guaranteed</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Daily Essentials,
              <br />
              <span className="text-lola-yellow-400">Delivered Fast</span>
            </h1>

            <p className="text-lg text-primary-foreground/80 max-w-md">
              Pre-built kits with all your daily needs. Oil, chai, atta, sugar - everything in one order. 
              You can add more, never less!
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/kits">
                <Button 
                  size="lg" 
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-lg"
                >
                  Explore Kits
                </Button>
              </Link>
              <Link to="/products">
                <Button 
                  size="lg" 
                  className="bg-lola-yellow-400 text-foreground hover:bg-lola-yellow-500 font-semibold shadow-lg"
                >
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>

          {/* Right - Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard 
              icon={<Clock className="h-6 w-6" />}
              title="Same Day"
              description="Order by 2 PM"
            />
            <FeatureCard 
              icon={<Truck className="h-6 w-6" />}
              title="Free Delivery"
              description="On orders ₹500+"
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Quality Assured"
              description="Fresh products"
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6" />}
              title="Easy Kits"
              description="Pre-built bundles"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-5 border border-background/20 hover:bg-background/20 transition-all duration-300">
      <div className="text-lola-yellow-400 mb-3">{icon}</div>
      <h3 className="font-display font-semibold text-primary-foreground">{title}</h3>
      <p className="text-sm text-primary-foreground/70">{description}</p>
    </div>
  );
}
