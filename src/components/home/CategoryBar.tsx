import { useProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { Package, Milk, Wheat, Droplets, Apple, Cookie, Coffee, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

const categoryIcons: Record<string, React.ReactNode> = {
  dairy: <Milk className="h-5 w-5" />,
  grains: <Wheat className="h-5 w-5" />,
  oils: <Droplets className="h-5 w-5" />,
  fruits: <Apple className="h-5 w-5" />,
  snacks: <Cookie className="h-5 w-5" />,
  beverages: <Coffee className="h-5 w-5" />,
  spices: <Sparkles className="h-5 w-5" />,
};

export function CategoryBar() {
  const { data: products } = useProducts();

  const categories = useMemo(() => {
    if (!products) return [];
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).slice(0, 8);
  }, [products]);

  if (categories.length === 0) return null;

  return (
    <section className="bg-card border-b sticky top-16 z-40">
      <div className="container">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted hover:bg-accent whitespace-nowrap text-sm font-medium text-foreground transition-colors"
            >
              {categoryIcons[cat.toLowerCase()] || <Package className="h-4 w-4" />}
              <span className="capitalize">{cat}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
