
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
  ON public.notifications FOR ALL
  USING (is_admin());

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create promotions table
CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  discount_percentage numeric DEFAULT 0,
  banner_image_url text,
  is_active boolean NOT NULL DEFAULT true,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active promotions"
  ON public.promotions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage promotions"
  ON public.promotions FOR ALL
  USING (is_admin());

-- Add trigger for updated_at on promotions
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Allow users to see delivery partner info when assigned to their order
CREATE POLICY "Users can view assigned delivery partner"
  ON public.delivery_partners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.delivery_partner_id = delivery_partners.user_id
      AND orders.user_id = auth.uid()
    )
  );

-- Allow delivery partners to see customer profiles for their assigned orders
CREATE POLICY "Delivery partners can view customer profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.user_id = profiles.user_id
      AND orders.delivery_partner_id = auth.uid()
    )
  );

-- Allow users to see delivery partner profiles
CREATE POLICY "Users can view delivery partner profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.delivery_partners dp ON dp.user_id = o.delivery_partner_id
      WHERE o.user_id = auth.uid()
      AND dp.user_id = profiles.user_id
    )
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin());
