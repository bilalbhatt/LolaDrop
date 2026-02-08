import { useActivePromotions } from '@/hooks/usePromotions';
import { Sparkles, Gift, Percent, Star } from 'lucide-react';

export function PromoBanner() {
  const { data: promotions } = useActivePromotions();

  if (!promotions?.length) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-secondary via-lola-orange-600 to-secondary py-3">
      {/* Animated sparkle background */}
      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute top-1 left-[10%] h-3 w-3 text-lola-yellow-400 animate-pulse opacity-60" />
        <Star className="absolute bottom-1 left-[30%] h-2 w-2 text-lola-yellow-400 animate-pulse opacity-40" style={{ animationDelay: '0.5s' }} />
        <Star className="absolute top-2 right-[20%] h-3 w-3 text-lola-yellow-400 animate-pulse opacity-50" style={{ animationDelay: '1s' }} />
        <Sparkles className="absolute bottom-0 right-[40%] h-4 w-4 text-lola-yellow-400 animate-pulse opacity-30" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container relative">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="flex items-center gap-2 bg-background/15 backdrop-blur-sm rounded-full px-5 py-2 whitespace-nowrap border border-lola-yellow-400/30 shadow-sm"
            >
              {promo.discount_percentage && promo.discount_percentage > 0 ? (
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-lola-yellow-400">
                  <Percent className="h-3.5 w-3.5 text-foreground" />
                </div>
              ) : (
                <Gift className="h-5 w-5 text-lola-yellow-400" />
              )}
              <span className="font-promo text-sm md:text-base font-semibold text-white tracking-wide">
                {promo.title}
                {promo.discount_percentage && promo.discount_percentage > 0 && (
                  <span className="ml-1 text-lola-yellow-400 font-bold">
                    — {promo.discount_percentage}% OFF
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
