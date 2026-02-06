-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delivery_partner_id uuid,
  status text NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled')),
  total_amount numeric NOT NULL DEFAULT 0,
  delivery_address text,
  delivery_latitude numeric,
  delivery_longitude numeric,
  delivery_instructions text,
  otp_code text,
  payment_method text DEFAULT 'cod' CHECK (payment_method IN ('cod', 'upi')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'feedback' CHECK (type IN ('feedback', 'suggestion', 'complaint')),
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  admin_response text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_messages table for custom orders
CREATE TABLE public.user_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL,
  is_custom_order boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'processed')),
  admin_response text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create delivery_partners table
CREATE TABLE public.delivery_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  phone text,
  vehicle_type text,
  is_active boolean DEFAULT true,
  current_latitude numeric,
  current_longitude numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;

-- Orders RLS policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (is_admin());
CREATE POLICY "Delivery partners can view assigned orders" ON public.orders FOR SELECT 
  USING (delivery_partner_id = auth.uid());
CREATE POLICY "Delivery partners can update assigned orders" ON public.orders FOR UPDATE 
  USING (delivery_partner_id = auth.uid());

-- Order items RLS policies
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT 
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT 
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (is_admin());
CREATE POLICY "Delivery partners can view order items" ON public.order_items FOR SELECT 
  USING (order_id IN (SELECT id FROM orders WHERE delivery_partner_id = auth.uid()));

-- Feedback RLS policies
CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all feedback" ON public.feedback FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update feedback" ON public.feedback FOR UPDATE USING (is_admin());

-- User messages RLS policies
CREATE POLICY "Users can view their own messages" ON public.user_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create messages" ON public.user_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all messages" ON public.user_messages FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update messages" ON public.user_messages FOR UPDATE USING (is_admin());

-- Delivery partners RLS policies
CREATE POLICY "Admins can manage delivery partners" ON public.delivery_partners FOR ALL USING (is_admin());
CREATE POLICY "Partners can view their own info" ON public.delivery_partners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Partners can update their location" ON public.delivery_partners FOR UPDATE USING (auth.uid() = user_id);

-- Create function to check if user is delivery partner
CREATE OR REPLACE FUNCTION public.is_delivery_partner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'delivery_partner')
$$;

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_messages_updated_at BEFORE UPDATE ON public.user_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_partners_updated_at BEFORE UPDATE ON public.delivery_partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;