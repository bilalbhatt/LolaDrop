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
  delivery_address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user' | 'delivery_partner';
}

export interface Order {
  id: string;
  user_id: string;
  delivery_partner_id: string | null;
  status: 'placed' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_instructions: string | null;
  otp_code: string | null;
  payment_method: 'cod' | 'upi';
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  profile?: Profile;
  delivery_partner?: DeliveryPartner;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface Feedback {
  id: string;
  user_id: string;
  type: 'feedback' | 'suggestion' | 'complaint';
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserMessage {
  id: string;
  user_id: string;
  message: string;
  is_custom_order: boolean;
  status: 'pending' | 'reviewed' | 'processed';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryPartner {
  id: string;
  user_id: string;
  phone: string | null;
  vehicle_type: string | null;
  is_active: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  order_id: string | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_percentage: number;
  banner_image_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export const DELIVERY_CHARGE = 30;
export const FREE_DELIVERY_THRESHOLD = 550;
export const MIN_ORDER_AMOUNT = 300;
