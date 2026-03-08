-- Add RLS policy for customers to insert their own orders
-- This allows customers to create orders after successful payment

-- Create policy for customers to insert orders
CREATE POLICY "Customers can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
  );

-- Also add a policy for customers to view their own orders (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Customers can view their own orders' AND tablename = 'orders'
  ) THEN
    CREATE POLICY "Customers can view their own orders"
      ON public.orders FOR SELECT
      USING (
        customer_id = auth.uid()
      );
  END IF;
END
$$;
