import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Kits from "./pages/Kits";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";
import DeliveryPartnerPortal from "./pages/DeliveryPartnerPortal";
import FeedbackPage from "./pages/FeedbackPage";
import OrdersPage from "./pages/OrdersPage";
import Checkout from "./pages/Checkout";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import KitDetail from "./pages/KitDetail";
import BecomeSeller from "./pages/BecomeSeller";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/kits" element={<Kits />} />
              <Route path="/kits/:kitId" element={<KitDetail />} />
              <Route path="/become-seller" element={<BecomeSeller />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/delivery" element={<DeliveryPartnerPortal />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<ComingSoon />} />
              <Route path="/shipping" element={<ComingSoon />} />
              <Route path="/returns" element={<ComingSoon />} />
              <Route path="/contact" element={<ComingSoon />} />
              {/* Redirect all unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
