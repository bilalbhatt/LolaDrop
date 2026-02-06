import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  totalUsers: number;
  newUsersToday: number;
  activeDeliveryPartners: number;
  pendingFeedback: number;
  pendingMessages: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Get products count
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get orders stats
      const { data: allOrders } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at');

      const orders = allOrders || [];
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => 
        ['placed', 'confirmed', 'packed', 'out_for_delivery'].includes(o.status)
      ).length;
      const todayOrders = orders.filter(o => 
        new Date(o.created_at) >= today
      ).length;
      const todayRevenue = orders
        .filter(o => new Date(o.created_at) >= today)
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      // Get users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get new users today
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      // Get active delivery partners
      const { count: activeDeliveryPartners } = await supabase
        .from('delivery_partners')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get pending feedback
      const { count: pendingFeedback } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get pending messages
      const { count: pendingMessages } = await supabase
        .from('user_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        totalProducts: totalProducts || 0,
        totalOrders,
        pendingOrders,
        todayOrders,
        todayRevenue,
        totalRevenue,
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        activeDeliveryPartners: activeDeliveryPartners || 0,
        pendingFeedback: pendingFeedback || 0,
        pendingMessages: pendingMessages || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
