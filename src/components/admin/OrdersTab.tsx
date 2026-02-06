import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrders, useUpdateOrderStatus, useAssignDeliveryPartner } from '@/hooks/useOrders';
import { useDeliveryPartners } from '@/hooks/useDeliveryPartners';
import { Order } from '@/lib/types';
import { format } from 'date-fns';
import { MapPin, Phone, Package, Eye, Truck, IndianRupee } from 'lucide-react';

const statusColors: Record<string, string> = {
  placed: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusOrder = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];

export function OrdersTab() {
  const { data: orders, isLoading } = useOrders();
  const { data: partners } = useDeliveryPartners();
  const updateStatus = useUpdateOrderStatus();
  const assignPartner = useAssignDeliveryPartner();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const filteredOrders = orders?.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  ) || [];

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    updateStatus.mutate({ orderId, status: newStatus });
  };

  const handleAssignPartner = (orderId: string, partnerId: string) => {
    assignPartner.mutate({ orderId, partnerId });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="placed">Placed</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="packed">Packed</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-muted-foreground text-sm">
          {filteredOrders.length} orders
        </span>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{order.id.slice(0, 8)}</span>
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
                      {order.delivery_address || 'No address'}
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-primary">
                      <IndianRupee className="h-4 w-4" />
                      {Number(order.total_amount).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.id, value as Order['status'])}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOrder.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace('_', ' ')}
                              </SelectItem>
                            ))}
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={order.delivery_partner_id || ''}
                          onValueChange={(value) => handleAssignPartner(order.id, value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Assign Partner" />
                          </SelectTrigger>
                          <SelectContent>
                            {partners?.filter(p => p.is_active).map((partner) => (
                              <SelectItem key={partner.id} value={partner.user_id}>
                                {partner.profile?.full_name || partner.phone || 'Partner'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order #{order.id.slice(0, 8)}</DialogTitle>
                        </DialogHeader>
                        <OrderDetails order={order} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Order Info</h4>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Status:</span> {order.status}</p>
            <p><span className="text-muted-foreground">Payment:</span> {order.payment_method.toUpperCase()}</p>
            <p><span className="text-muted-foreground">Payment Status:</span> {order.payment_status}</p>
            <p><span className="text-muted-foreground">Total:</span> ₹{Number(order.total_amount).toLocaleString()}</p>
            <p><span className="text-muted-foreground">OTP:</span> {order.otp_code}</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Delivery Info</h4>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Address:</span> {order.delivery_address}</p>
            {order.delivery_instructions && (
              <p><span className="text-muted-foreground">Instructions:</span> {order.delivery_instructions}</p>
            )}
            {order.delivery_latitude && order.delivery_longitude && (
              <a
                href={`https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <MapPin className="h-4 w-4" />
                View on Google Maps
              </a>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Order Items</h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2 text-sm">Product</th>
                <th className="text-center p-2 text-sm">Qty</th>
                <th className="text-right p-2 text-sm">Price</th>
                <th className="text-right p-2 text-sm">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2 text-sm">{item.product?.name}</td>
                  <td className="p-2 text-sm text-center">{item.quantity}</td>
                  <td className="p-2 text-sm text-right">₹{Number(item.unit_price).toLocaleString()}</td>
                  <td className="p-2 text-sm text-right">₹{Number(item.total_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
