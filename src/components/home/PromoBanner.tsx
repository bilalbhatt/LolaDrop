import { useActivePromotions } from '@/hooks/usePromotions';
import { Badge } from '@/components/ui/badge';
import { Percent, Tag } from 'lucide-react';

export function PromoBanner() {
  const { data: promotions } = useActivePromotions();

  if (!promotions?.length) return null;

  return (
    <section className="bg-gradient-orange py-3">
      <div className="container">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="flex items-center gap-2 bg-background/10 backdrop-blur-sm rounded-full px-4 py-2 whitespace-nowrap border border-background/20"
            >
              {promo.discount_percentage > 0 ? (
                <Percent className="h-4 w-4 text-secondary-foreground" />
              ) : (
                <Tag className="h-4 w-4 text-secondary-foreground" />
              )}
              <span className="text-sm font-medium text-secondary-foreground">
                {promo.title}
                {promo.discount_percentage > 0 && ` — ${promo.discount_percentage}% OFF`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
