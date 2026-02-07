import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Heart, Users, ShieldCheck, Truck, Clock, Target, Store, Home } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-hero py-16 md:py-24">
          <div className="container text-center text-primary-foreground">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              About LolaDrop
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              LolaDrop is a modern hyperlocal delivery platform built to make everyday essentials 
              simple, fast, and affordable for everyone. Whether you are a household ordering monthly 
              ration packs or a shopkeeper stocking wholesale items, LolaDrop connects you directly 
              with trusted local stores and suppliers — with transparent pricing, on-time delivery, 
              and seamless experience.
            </p>
            <p className="text-primary-foreground/70 mt-4 max-w-2xl mx-auto">
              Built with love and a mission to support local communities, LolaDrop brings the 
              convenience of online shopping to the doorstep of every home and business.
            </p>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              What LolaDrop Offers
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* For Households */}
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                      <Home className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">For Households</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Monthly ration packs curated for real needs',
                      'Daily essentials at fair, honest prices',
                      'Fast delivery driven by verified partners',
                      'Easy re-orders and smooth checkout',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* For Shopkeepers */}
              <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-lola-orange-50 flex items-center justify-center">
                      <Store className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">For Shopkeepers / Retailers</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Wholesale prices with reliable supply',
                      'Bulk ordering made simple',
                      'Real-time stock visibility',
                      'Dedicated delivery support',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <Zap className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="py-16 bg-muted/30">
          <div className="container text-center max-w-3xl">
            <Target className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Our Vision</h2>
            <p className="text-lg text-muted-foreground">
              To create a unified platform that empowers both families and local businesses, ensuring 
              that quality essentials are accessible, affordable, and always delivered on time.
            </p>
          </div>
        </section>

        {/* Why We Built LolaDrop */}
        <section className="py-16 bg-background">
          <div className="container">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              Why We Built LolaDrop
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Heart, text: 'To solve the struggle of managing monthly ration' },
                { icon: Store, text: 'To help small shopkeepers get wholesale material without extra cost' },
                { icon: Zap, text: 'To bring digital convenience to everyday purchasing' },
                { icon: Users, text: 'To support local economies' },
                { icon: ShieldCheck, text: 'To build a trusted ecosystem that grows with the community' },
              ].map(({ icon: Icon, text }, i) => (
                <Card key={i} className="hover:shadow-card transition-shadow">
                  <CardContent className="p-6 flex items-start gap-3">
                    <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Our Promise */}
        <section className="py-16 bg-gradient-orange">
          <div className="container text-center">
            <h2 className="font-display text-3xl font-bold text-secondary-foreground mb-10">
              Our Promise
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { icon: Zap, label: 'Fast' },
                { icon: ShieldCheck, label: 'Reliable' },
                { icon: Target, label: 'Transparent' },
                { icon: Users, label: 'Community-focused' },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="bg-background/10 backdrop-blur-sm rounded-2xl p-6 border border-background/20">
                  <Icon className="h-8 w-8 text-secondary-foreground mx-auto mb-3" />
                  <p className="font-display font-semibold text-secondary-foreground">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-secondary-foreground/80 max-w-2xl mx-auto text-lg">
              LolaDrop is not just another delivery app — it is your neighbourhood's digital 
              assistant, designed to make life easier for both homes and shops.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
