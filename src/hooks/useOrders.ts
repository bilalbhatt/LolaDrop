import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/lib/types';
import { toast } from 'sonner';

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
      return data as Order[];
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
      return data as Order[];
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
      const { error } = await supabase
        .from('orders')
        .update({ delivery_partner_id: partnerId, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Delivery partner assigned');
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
      items: { productId: string; quantity: number; unitPrice: number }[];
    }) => {
      // Generate 4-digit OTP
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          total_amount: orderData.totalAmount,
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

      // Create order items
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
          updated_at: new Date().toISOString() 
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
