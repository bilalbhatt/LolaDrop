import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDeliveryPartnerOrders, useUpdateOrderStatus, useVerifyDeliveryOTP } from '@/hooks/useOrders';
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications';
import { Order } from '@/lib/types';
import { format } from 'date-fns';
import { Package, MapPin, Phone, Navigation, CheckCircle, Truck, Clock, Bell, MessageCircle, IndianRupee, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const statusColors: Record<string, string> = {
  placed: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function DeliveryPartnerPortal() {
  const { user, isDeliveryPartner, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: orders, isLoading } = useDeliveryPartnerOrders(user?.id);
  const { data: notifications } = useNotifications(user?.id);
  const unreadCount = useUnreadCount(user?.id);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();
  const updateStatus = useUpdateOrderStatus();
  const verifyOTP = useVerifyDeliveryOTP();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !isDeliveryPartner)) {
      navigate('/');
    }
  }, [authLoading, user, isDeliveryPartner, navigate]);

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isDeliveryPartner) {
    return null;
  }

  const handleStatusUpdate = (orderId: string, status: Order['status']) => {
    updateStatus.mutate({ orderId, status });
  };

  const handleDeliveryConfirm = () => {
    if (!selectedOrder || !otp) return;
    verifyOTP.mutate(
      { orderId: selectedOrder.id, otp },
      {
        onSuccess: () => {
          setSelectedOrder(null);
          setOtp('');
        },
      }
    );
  };

  const pendingOrders = orders?.filter(o => 
    ['confirmed', 'packed', 'out_for_delivery'].includes(o.status)
  ) || [];

  const completedOrders = orders?.filter(o => o.status === 'delivered') || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Delivery Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Manage your assigned deliveries</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-3 border-b flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => markAllRead.mutate(user.id)}>
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="max-h-80">
                    {!notifications?.length ? (
                      <p className="text-center text-muted-foreground text-sm p-4">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${!n.is_read ? 'bg-accent/30' : ''}`}
                          onClick={() => !n.is_read && markRead.mutate(n.id)}
                        >
                          <p className="font-medium text-sm">{n.title}</p>
                          <p className="text-xs text-muted-foreground whitespace-pre-line mt-1">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(n.created_at), 'PP p')}
                          </p>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <Badge className="bg-cyan-600">Delivery Partner</Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{pendingOrders.length}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{completedOrders.length}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Deliveries */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Deliveries
            </h2>

            {pendingOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending deliveries</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Order #{order.id.slice(0, 8)}</span>
                            <Badge className={statusColors[order.status]}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="flex items-start gap-1 text-sm">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{order.delivery_address || 'No address'}</span>
                          </div>

                          {/* Customer Info */}
                          {order.profile && (
                            <div className="bg-accent/50 rounded-lg p-2 space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-primary" />
                                <span className="font-medium">{order.profile.full_name || 'Customer'}</span>
                              </div>
                              {order.profile.phone && (
                                <div className="flex items-center gap-3">
                                  <a href={`tel:${order.profile.phone}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                                    <Phone className="h-3 w-3" />
                                    {order.profile.phone}
                                  </a>
                                  <a
                                    href={`https://wa.me/${order.profile.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                    WhatsApp
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {order.delivery_instructions && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Note:</strong> {order.delivery_instructions}
                            </p>
                          )}

                          {/* Amount */}
                          <div className="flex items-center gap-1 font-semibold text-primary">
                            <IndianRupee className="h-4 w-4" />
                            {Number(order.total_amount).toLocaleString()}
                            <span className="text-xs text-muted-foreground font-normal ml-1">
                              ({(order.payment_method || 'cod').toUpperCase()})
                            </span>
                          </div>

                          {/* All Items */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {order.order_items?.map((item) => (
                              <Badge key={item.id} variant="outline">
                                {item.product?.name} × {item.quantity}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {order.delivery_latitude && order.delivery_longitude && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${order.delivery_latitude},${order.delivery_longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Navigation className="h-4 w-4 mr-1" />
                                Navigate
                              </a>
                            </Button>
                          )}

                          {order.status === 'confirmed' && (
                            <Button size="sm" onClick={() => handleStatusUpdate(order.id, 'packed')}>
                              <Package className="h-4 w-4 mr-1" />
                              Mark Picked
                            </Button>
                          )}

                          {order.status === 'packed' && (
                            <Button size="sm" onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}>
                              <Truck className="h-4 w-4 mr-1" />
                              Out for Delivery
                            </Button>
                          )}

                          {order.status === 'out_for_delivery' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm Delivery
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* OTP Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the OTP provided by the customer to confirm delivery.
            </p>
            <Input
              placeholder="Enter 4-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={4}
            />
            <Button 
              className="w-full" 
              onClick={handleDeliveryConfirm}
              disabled={otp.length !== 4 || verifyOTP.isPending}
            >
              {verifyOTP.isPending ? 'Verifying...' : 'Confirm Delivery'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
