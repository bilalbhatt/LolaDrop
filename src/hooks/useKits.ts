import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KitWithItems, Kit, KitItem, Product } from '@/lib/types';

export function useKits() {
  return useQuery({
    queryKey: ['kits'],
    queryFn: async (): Promise<KitWithItems[]> => {
      const { data: kits, error: kitsError } = await supabase
        .from('kits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (kitsError) throw kitsError;

      const kitsWithItems: KitWithItems[] = await Promise.all(
        (kits || []).map(async (kit) => {
          const { data: kitItems, error: itemsError } = await supabase
            .from('kit_items')
            .select(`
              *,
              product:products(*)
            `)
            .eq('kit_id', kit.id);

          if (itemsError) throw itemsError;

          const total_price = (kitItems || []).reduce((sum, item) => {
            const price = item.product?.price || 0;
            return sum + (Number(price) * item.quantity);
          }, 0);

          return {
            ...kit,
            kit_items: kitItems || [],
            total_price,
          };
        })
      );

      return kitsWithItems;
    },
  });
}

export function useKit(kitId: string) {
  return useQuery({
    queryKey: ['kit', kitId],
    queryFn: async (): Promise<KitWithItems | null> => {
      const { data: kit, error: kitError } = await supabase
        .from('kits')
        .select('*')
        .eq('id', kitId)
        .single();

      if (kitError) throw kitError;
      if (!kit) return null;

      const { data: kitItems, error: itemsError } = await supabase
        .from('kit_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('kit_id', kit.id);

      if (itemsError) throw itemsError;

      const total_price = (kitItems || []).reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + (Number(price) * item.quantity);
      }, 0);

      return {
        ...kit,
        kit_items: kitItems || [],
        total_price,
      };
    },
    enabled: !!kitId,
  });
}
