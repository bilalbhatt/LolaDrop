import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight, MessageSquare } from 'lucide-react';

export function MakeYourOrder() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-muted p-8 md:p-12 border">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Make Your Own Order
                </h2>
                <p className="text-muted-foreground mt-1">
                  Can't find what you need? Tell us what you want and we'll get it for you!
                </p>
              </div>
            </div>
            <Link to="/feedback?tab=messages">
              <Button size="lg" className="bg-gradient-hero hover:opacity-90 gap-2 font-semibold whitespace-nowrap">
                <ShoppingBag className="h-5 w-5" />
                Place Custom Order
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
