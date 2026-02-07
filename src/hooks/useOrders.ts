import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/lib/types';
import { toast } from 'sonner';
import { DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD } from '@/lib/types';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(
            *,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useUserOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Fetch orders with items
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For orders with delivery partner, fetch partner info
      const ordersWithPartners = await Promise.all(
        (data || []).map(async (order) => {
          if (order.delivery_partner_id) {
            const { data: partner } = await supabase
              .from('delivery_partners')
              .select('*')
              .eq('user_id', order.delivery_partner_id)
              .maybeSingle();

            if (partner) {
              const { data: partnerProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', partner.user_id)
                .maybeSingle();

              return {
                ...order,
                delivery_partner: { ...partner, profile: partnerProfile },
              };
            }
          }
          return order;
        })
      );

      return ordersWithPartners as Order[];
    },
    enabled: !!userId,
  });
}

export function useDeliveryPartnerOrders(partnerId: string | undefined) {
  return useQuery({
    queryKey: ['delivery-orders', partnerId],
    queryFn: async () => {
      if (!partnerId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('delivery_partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch customer profiles
      const ordersWithProfiles = await Promise.all(
        (data || []).map(async (order) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', order.user_id)
            .maybeSingle();

          return { ...order, profile };
        })
      );

      return ordersWithProfiles as Order[];
    },
    enabled: !!partnerId,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      toast.success('Order status updated');
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    },
  });
}

export function useAssignDeliveryPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, partnerId }: { orderId: string; partnerId: string }) => {
      // Get order details for notification
      const { data: order, error: orderFetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(*, product:products(*))
        `)
        .eq('id', orderId)
        .single();

      if (orderFetchError) throw orderFetchError;

      // Get customer profile
      const { data: customerProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', order.user_id)
        .maybeSingle();

      // Update order
      const { error } = await supabase
        .from('orders')
        .update({ delivery_partner_id: partnerId, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Create notification for delivery partner
      const itemsList = (order as any).order_items
        ?.map((item: any) => `${item.product?.name} × ${item.quantity}`)
        .join(', ') || 'No items';

      const message = [
        `📦 New order assigned!`,
        `📍 Address: ${order.delivery_address || 'Not specified'}`,
        `👤 Customer: ${customerProfile?.full_name || 'N/A'}`,
        `📞 Phone: ${customerProfile?.phone || 'Not provided'}`,
        `🛒 Items: ${itemsList}`,
        `💰 Amount: ₹${Number(order.total_amount).toLocaleString()} (${(order.payment_method || 'cod').toUpperCase()})`,
      ].join('\n');

      await supabase.from('notifications').insert({
        user_id: partnerId,
        title: `New Delivery: Order #${orderId.slice(0, 8)}`,
        message,
        order_id: orderId,
      });

      // Also notify the customer
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        title: 'Delivery Partner Assigned',
        message: `A delivery partner has been assigned to your order #${orderId.slice(0, 8)}. Your order is on its way!`,
        order_id: orderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Delivery partner assigned & notified');
    },
    onError: (error) => {
      console.error('Error assigning delivery partner:', error);
      toast.error('Failed to assign delivery partner');
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      userId: string;
      totalAmount: number;
      deliveryAddress: string;
      deliveryLatitude?: number;
      deliveryLongitude?: number;
      deliveryInstructions?: string;
      paymentMethod: 'cod' | 'upi';
      deliveryCharge: number;
      items: { productId: string; quantity: number; unitPrice: number }[];
    }) => {
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const finalAmount = orderData.totalAmount + orderData.deliveryCharge;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          total_amount: finalAmount,
          delivery_address: orderData.deliveryAddress,
          delivery_latitude: orderData.deliveryLatitude,
          delivery_longitude: orderData.deliveryLongitude,
          delivery_instructions: orderData.deliveryInstructions,
          payment_method: orderData.paymentMethod,
          otp_code: otpCode,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast.error('Failed to place order');
    },
  });
}

export function useVerifyDeliveryOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, otp }: { orderId: string; otp: string }) => {
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('otp_code')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      if (order.otp_code !== otp) {
        throw new Error('Invalid OTP');
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          payment_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      toast.success('Delivery confirmed!');
    },
    onError: (error: any) => {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Failed to verify OTP');
    },
  });
}
