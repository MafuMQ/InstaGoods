-- Add transaction_id and payment_method columns to orders table
-- This enables tracking of payment transaction details

-- Add transaction_id column for payment gateway transaction reference
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Add payment_method column to track how customer paid
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';

-- Add payment_status column for payment lifecycle tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));

-- Add payment_date column for when payment was completed
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Add INDEX for faster queries on payment_status and transaction_id
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON public.orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_date ON public.orders(payment_date);

-- Add comment for documentation
COMMENT ON COLUMN public.orders.transaction_id IS 'Payment gateway transaction ID for reference';
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used (card, bitcoin, ethereum, mobile, bank)';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status lifecycle (pending, processing, completed, failed, refunded)';
COMMENT ON COLUMN public.orders.payment_date IS 'Timestamp when payment was successfully completed';
