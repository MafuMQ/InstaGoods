-- Add marketplace visibility column to products table
ALTER TABLE public.products 
ADD COLUMN is_marketplace_visible BOOLEAN DEFAULT true;

-- Update the RLS policy for products to consider marketplace visibility
DROP POLICY "Anyone can view active products" ON public.products;

CREATE POLICY "Anyone can view active and marketplace visible products"
  ON public.products FOR SELECT
  USING (is_active = true AND is_marketplace_visible = true);

-- Suppliers can still view all their own products regardless of marketplace visibility
-- This is already covered by the existing "Suppliers can manage their own products" policy