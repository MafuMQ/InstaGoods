-- Fix messages table to work without strict foreign key to auth.users
-- This removes the requirement for consumer_id to exist in auth.users

-- First, drop the existing messages table (WARNING: this will delete all messages!)
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create messages table without foreign key to auth.users
-- Instead, we reference the profiles table which is more reliable
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID, -- References profiles, not auth.users directly
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('customer', 'supplier')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_consumer_supplier 
    ON public.messages(consumer_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_messages_supplier_consumer 
    ON public.messages(supplier_id, consumer_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
    ON public.messages(created_at DESC);

-- RLS Policies

-- Allow customers to view their own messages
DROP POLICY IF EXISTS "Customers can view their own messages" ON public.messages;
CREATE POLICY "Customers can view their own messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = consumer_id);

-- Allow suppliers to view messages for their shop
DROP POLICY IF EXISTS "Suppliers can view their messages" ON public.messages;
CREATE POLICY "Suppliers can view their messages"
    ON public.messages FOR SELECT
    USING (
        supplier_id IN (
            SELECT id FROM public.suppliers 
            WHERE user_id = auth.uid()
        )
    );

-- Allow customers to insert messages
DROP POLICY IF EXISTS "Customers can insert messages" ON public.messages;
CREATE POLICY "Customers can insert messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = consumer_id);

-- Allow suppliers to insert messages
DROP POLICY IF EXISTS "Suppliers can insert messages" ON public.messages;
CREATE POLICY "Suppliers can insert messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        supplier_id IN (
            SELECT id FROM public.suppliers 
            WHERE user_id = auth.uid()
        )
    );

-- Add to realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.messages;

-- Verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages';
