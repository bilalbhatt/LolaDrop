import { Link } from 'react-router-dom';
import { 
  ShoppingBasket, Cookie, Sparkles, Home, 
  Cake, GraduationCap, Package 
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Grocery', icon: <ShoppingBasket className="h-5 w-5" /> },
  { name: 'Snacks and Drinks', icon: <Cookie className="h-5 w-5" /> },
  { name: 'Beauty and Personal Care', icon: <Sparkles className="h-5 w-5" /> },
  { name: 'Household, Stationery and Lifestyle', icon: <Home className="h-5 w-5" /> },
  { name: 'Bakery and Confectionery', icon: <Cake className="h-5 w-5" /> },
  { name: 'Stationery for Kids', icon: <GraduationCap className="h-5 w-5" />, badge: '🎒 School Special' },
];

export function CategoryBar() {
  return (
    <section className="bg-card border-b sticky top-16 z-40">
      <div className="container">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground whitespace-nowrap text-sm font-medium text-foreground transition-all duration-200"
            >
              <span className="text-primary group-hover:text-primary-foreground transition-colors">
                {cat.icon}
              </span>
              <span>{cat.name}</span>
              {cat.badge && (
                <span className="text-xs bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full font-semibold group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground">
                  {cat.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
