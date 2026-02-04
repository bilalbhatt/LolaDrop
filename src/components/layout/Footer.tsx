import { Zap, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Lola<span className="text-primary">Kart</span>
              </span>
            </div>
            <p className="text-sm text-background/70">
              Your daily essentials, delivered same day. Fresh groceries, unbeatable prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/kits" className="hover:text-primary transition-colors">Daily Kits</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@lolakart.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>123 Market Street, Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm text-background/50">
          <p>© 2024 LolaKart. All rights reserved. Same day delivery promise!</p>
        </div>
      </div>
    </footer>
  );
}
