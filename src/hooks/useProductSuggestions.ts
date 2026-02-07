import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

export function useProductSuggestions(
  orderedProductIds: string[],
  orderedCategories: string[],
  limit = 6
) {
  return useQuery({
    queryKey: ['product-suggestions', orderedCategories, orderedProductIds],
    queryFn: async () => {
      if (orderedCategories.length === 0) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('category', orderedCategories)
        .not('id', 'in', `(${orderedProductIds.join(',')})`)
        .eq('in_stock', true)
        .limit(limit);

      if (error) throw error;
      return data as Product[];
    },
    enabled: orderedCategories.length > 0 && orderedProductIds.length > 0,
  });
}
