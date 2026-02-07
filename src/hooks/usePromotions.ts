import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Promotion } from '@/lib/types';
import { toast } from 'sonner';

export function usePromotions() {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
  });
}

export function useActivePromotions() {
  return useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promo: {
      title: string;
      description?: string;
      discount_percentage?: number;
      banner_image_url?: string;
      is_active?: boolean;
      start_date?: string;
      end_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert(promo)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion created!');
    },
    onError: () => toast.error('Failed to create promotion'),
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Promotion> & { id: string }) => {
      const { error } = await supabase
        .from('promotions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion updated!');
    },
    onError: () => toast.error('Failed to update promotion'),
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion deleted!');
    },
    onError: () => toast.error('Failed to delete promotion'),
  });
}
