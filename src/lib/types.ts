export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  category: string | null;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
  discount_percentage?: number;
  original_price?: number;
}

export interface Kit {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  latitude?: number;
  longitude?: number;
  delivery_address?: string;
}

export interface KitItem {
  id: string;
  kit_id: string;
  product_id: string;
  quantity: number;
  is_mandatory: boolean;
  created_at: string;
  product?: Product;
}

export interface KitWithItems extends Kit {
  kit_items: KitItem[];
  total_price: number;
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  kit_id: string | null;
  is_kit_item: boolean;
  created_at: string;
  product?: Product;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
}
