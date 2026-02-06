import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryPartner } from '@/lib/types';
import { toast } from 'sonner';

export function useDeliveryPartners() {
  return useQuery({
    queryKey: ['delivery-partners'],
    queryFn: async () => {
      const { data: partners, error } = await supabase
        .from('delivery_partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately for each partner
      const partnerIds = partners?.map(p => p.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', partnerIds);

      // Merge profiles with partners
      const partnersWithProfiles = partners?.map(partner => ({
        ...partner,
        profile: profiles?.find(p => p.user_id === partner.user_id),
      })) || [];
      return partnersWithProfiles as DeliveryPartner[];
    },
  });
}

export function useCreateDeliveryPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerData: {
      email: string;
      password: string;
      fullName: string;
      phone: string;
      vehicleType: string;
    }) => {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: partnerData.email,
        password: partnerData.password,
        options: {
          data: {
            full_name: partnerData.fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Wait a moment for the trigger to create profile and user_role
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the user's role to delivery_partner
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: 'delivery_partner' })
        .eq('user_id', authData.user.id);

      if (roleError) throw roleError;

      // Create delivery partner record
      const { error: partnerError } = await supabase
        .from('delivery_partners')
        .insert({
          user_id: authData.user.id,
          phone: partnerData.phone,
          vehicle_type: partnerData.vehicleType,
        });

      if (partnerError) throw partnerError;

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      toast.success('Delivery partner created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating delivery partner:', error);
      toast.error(error.message || 'Failed to create delivery partner');
    },
  });
}

export function useTogglePartnerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partnerId, isActive }: { partnerId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('delivery_partners')
        .update({ is_active: isActive })
        .eq('id', partnerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-partners'] });
      toast.success('Partner status updated');
    },
    onError: (error) => {
      console.error('Error updating partner status:', error);
      toast.error('Failed to update partner status');
    },
  });
}
