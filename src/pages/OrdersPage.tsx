import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { Package, MapPin, IndianRupee, Key } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  placed: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading } = useUserOrders(user?.id);

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
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Order #{order.id.slice(0, 8)}</span>
                          <Badge className={statusColors[order.status]}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {order.payment_method.toUpperCase()}
                          </Badge>
                        </div>
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

                    {/* Order Items */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">Items</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {order.order_items?.map((item) => (
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
