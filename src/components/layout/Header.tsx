import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, Zap, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useMemo, useRef, useEffect } from 'react';

export function Header() {
  const { user, isAdmin, isDeliveryPartner, signOut } = useAuth();
  const { totalItems, isAdding } = useCart();
  const { data: products } = useProducts();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !products) return [];
    return products
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [searchQuery, products]);

  // Close search results on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSelect = (productId: string) => {
    setSearchQuery('');
    setShowResults(false);
    navigate('/products');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Lola<span className="text-primary">Drop</span>
          </span>
        </Link>

        {/* Search - Desktop */}
        <div className="hidden flex-1 max-w-xl md:flex" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for groceries, kits..."
              className="w-full pl-10 bg-muted/50 border-0 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 overflow-hidden">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                    onClick={() => handleSearchSelect(product.id)}
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-muted-foreground p-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">₹{Number(product.price).toFixed(0)}/{product.unit}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delivery Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-accent-foreground">Same Day Delivery</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className={`relative ${isAdding ? 'animate-bounce' : ''}`}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className={`absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-secondary text-secondary-foreground text-xs ${isAdding ? 'animate-ping' : ''}`}>
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/feedback">Feedback & Support</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/feedback?tab=messages">Make Your Own Order</Link>
                </DropdownMenuItem>
                {isDeliveryPartner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/delivery" className="text-cyan-600 font-medium">
                        Delivery Portal
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="text-primary font-medium">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="bg-gradient-hero hover:opacity-90">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-10" />
                </div>
                <nav className="flex flex-col gap-2">
                  <Link 
                    to="/" 
                    className="px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/kits" 
                    className="px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daily Kits
                  </Link>
                  <Link 
                    to="/products" 
                    className="px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Products
                  </Link>
                  <Link 
                    to="/feedback?tab=messages" 
                    className="px-4 py-2 rounded-lg hover:bg-accent transition-colors font-medium text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Make Your Own Order
                  </Link>
                  <Link 
                    to="/about" 
                    className="px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
