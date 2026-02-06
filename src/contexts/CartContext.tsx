import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { CartItem, Product, KitWithItems } from '@/lib/types';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: CartItem[];
  cartId: string | null;
  isLoading: boolean;
  isAdding: boolean;
  addToCart: (productId: string, quantity?: number, kitId?: string, isKitItem?: boolean) => Promise<void>;
  addKitToCart: (kit: KitWithItems) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartId(null);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get user's cart
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cartError) throw cartError;
      
      if (cart) {
        setCartId(cart.id);
        
        // Fetch cart items with product details
        const { data: items, error: itemsError } = await supabase
          .from('cart_items')
          .select(`
            *,
            product:products(*)
          `)
          .eq('cart_id', cart.id);

        if (itemsError) throw itemsError;
        setCartItems(items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity = 1, kitId?: string, isKitItem = false) => {
    if (!cartId) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    setIsAdding(true);
    try {
      // Check if item already exists
      const existingItem = cartItems.find(
        item => item.product_id === productId && item.kit_id === (kitId || null)
      );

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: productId,
            quantity,
            kit_id: kitId || null,
            is_kit_item: isKitItem,
          });

        if (error) throw error;
        await fetchCart();
        toast.success('Added to cart!', {
          icon: '🛒',
          duration: 1500,
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setTimeout(() => setIsAdding(false), 300);
    }
  };

  const addKitToCart = async (kit: KitWithItems) => {
    if (!cartId) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    setIsAdding(true);
    try {
      // Add all kit items at once
      const kitItems = kit.kit_items.map(item => ({
        cart_id: cartId,
        product_id: item.product_id,
        quantity: item.quantity,
        kit_id: kit.id,
        is_kit_item: true,
      }));

      const { error } = await supabase
        .from('cart_items')
        .upsert(kitItems, { onConflict: 'cart_id,product_id,kit_id' });

      if (error) throw error;
      await fetchCart();
      toast.success(`${kit.name} added to cart!`, {
        icon: '📦',
        duration: 1500,
      });
    } catch (error) {
      console.error('Error adding kit to cart:', error);
      toast.error('Failed to add kit to cart');
    } finally {
      setTimeout(() => setIsAdding(false), 300);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const item = cartItems.find(i => i.id === itemId);
      if (item?.is_kit_item) {
        toast.error('Cannot remove mandatory kit items');
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove from cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const item = cartItems.find(i => i.id === itemId);
      if (item?.is_kit_item) {
        // For kit items, ensure minimum quantity
        const kitItem = cartItems.find(ci => ci.id === itemId);
        if (kitItem && quantity < kitItem.quantity) {
          toast.error('Cannot reduce below minimum kit quantity');
          return;
        }
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!cartId) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)
        .eq('is_kit_item', false);

      if (error) throw error;
      await fetchCart();
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (Number(price) * item.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartId,
        isLoading,
        isAdding,
        addToCart,
        addKitToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
