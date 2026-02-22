-- Add estimated_delivery column to orders table
-- Run this in your Supabase SQL Editor

-- Make supplier_id nullable in orders table (it may not be known at order time)
ALTER TABLE public.orders 
ALTER COLUMN supplier_id DROP NOT NULL;

-- Add estimated_delivery column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE;

-- Add digital_access_code column for digital products
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS digital_access_code TEXT;

-- Add tracking_number column for shipped orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_customer_date 
ON public.orders(customer_id, order_date DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status 
ON public.orders(status);

-- Add comments for documentation
COMMENT ON COLUMN public.orders.estimated_delivery IS 'Estimated delivery date for the order';
COMMENT ON COLUMN public.orders.digital_access_code IS 'Digital access credentials for digital products';
COMMENT ON COLUMN public.orders.tracking_number IS 'Shipping tracking number for delivered orders';

-- Create loyalty_points table
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'bonus')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

-- Create policy for customers to view their own points
DROP POLICY IF EXISTS "Customers can view own loyalty points" ON public.loyalty_points;
CREATE POLICY "Customers can view own loyalty points" ON public.loyalty_points
  FOR SELECT USING (auth.uid() = customer_id);

-- Create credits table
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('added', 'spent', 'refund', 'bonus')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Create policy for customers to view their own credits
DROP POLICY IF EXISTS "Customers can view own credits" ON public.credits;
CREATE POLICY "Customers can view own credits" ON public.credits
  FOR SELECT USING (auth.uid() = customer_id);

-- Create user tier column in profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze' 
CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'));

-- Create user_credits column in profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits DECIMAL(10, 2) DEFAULT 0;

-- Create total_loyalty_points column in profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_loyalty_points INTEGER DEFAULT 0;

-- Create member_since column in profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_since TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing profiles with default values
UPDATE public.profiles 
SET member_since = COALESCE(created_at, now()) 
WHERE member_since IS NULL;
