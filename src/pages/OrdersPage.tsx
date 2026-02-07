import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserOrders } from '@/hooks/useOrders';
import { useProductSuggestions } from '@/hooks/useProductSuggestions';
import { ProductCard } from '@/components/products/ProductCard';
import { format } from 'date-fns';
import { Package, MapPin, IndianRupee, Key, Phone, MessageCircle, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const statusColors: Record<string, string> = {
  placed: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusSteps = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];

function OrderStatusTracker({ status }: { status: string }) {
  const currentIndex = statusSteps.indexOf(status);
  if (status === 'cancelled') {
    return (
      <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      {statusSteps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i <= currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
          {i < statusSteps.length - 1 && (
            <div
              className={`h-0.5 w-4 md:w-8 transition-colors ${
                i < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading } = useUserOrders(user?.id);
  const queryClient = useQueryClient();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Realtime subscription for order updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`orders-user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Get suggestion data from orders
  const { orderedProductIds, orderedCategories } = useMemo(() => {
    if (!orders?.length) return { orderedProductIds: [], orderedCategories: [] };
    const productIds = new Set<string>();
    const categories = new Set<string>();
    orders.forEach(order => {
      order.order_items?.forEach(item => {
        productIds.add(item.product_id);
        if (item.product?.category) categories.add(item.product.category);
      });
    });
    return {
      orderedProductIds: Array.from(productIds),
      orderedCategories: Array.from(categories),
    };
  }, [orders]);

  const { data: suggestions } = useProductSuggestions(orderedProductIds, orderedCategories);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            My Orders
          </h1>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : !orders?.length ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold">No orders yet</h3>
              <p className="text-muted-foreground mt-1">Start shopping to see your orders here</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">Order #{order.id.slice(0, 8)}</span>
                            <Badge className={statusColors[order.status]}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {order.payment_method.toUpperCase()}
                            </Badge>
                          </div>
                          <OrderStatusTracker status={order.status} />
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'PPp')}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-4 w-4" />
                            {order.delivery_address}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 font-bold text-lg text-primary">
                            <IndianRupee className="h-5 w-5" />
                            {Number(order.total_amount).toLocaleString()}
                          </div>
                          {order.status === 'out_for_delivery' && order.otp_code && (
                            <div className="flex items-center gap-1 text-sm bg-primary/10 px-2 py-1 rounded mt-2">
                              <Key className="h-4 w-4" />
                              OTP: <strong>{order.otp_code}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Partner Info */}
                      {order.delivery_partner_id && order.delivery_partner && (
                        <div className="bg-accent/50 rounded-lg p-3 flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Delivery Partner:</span>
                            <span className="text-sm">
                              {order.delivery_partner.profile?.full_name || 'Partner'}
                            </span>
                          </div>
                          {order.delivery_partner.phone && (
                            <>
                              <a
                                href={`tel:${order.delivery_partner.phone}`}
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <Phone className="h-4 w-4" />
                                {order.delivery_partner.phone}
                              </a>
                              <a
                                href={`https://wa.me/${order.delivery_partner.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                              >
                                <MessageCircle className="h-4 w-4" />
                                WhatsApp
                              </a>
                            </>
                          )}
                        </div>
                      )}

                      {/* Order Items - Collapsible */}
                      <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(order.id)}>
                        <div className="border-t pt-3">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 w-full justify-between">
                              <span className="text-sm font-medium">
                                Items ({order.order_items?.length || 0})
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>

                          {/* Show first 2 items always */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {order.order_items?.slice(0, 2).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between bg-muted/50 p-2 rounded"
                              >
                                <span className="text-sm">{item.product?.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {item.quantity} × ₹{Number(item.unit_price).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          <CollapsibleContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                              {order.order_items?.slice(2).map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between bg-muted/50 p-2 rounded"
                                >
                                  <span className="text-sm">{item.product?.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {item.quantity} × ₹{Number(item.unit_price).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Product Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                You might also like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {suggestions.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
