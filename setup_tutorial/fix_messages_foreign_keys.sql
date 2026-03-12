-- Fix for messages table foreign key constraints
-- This script addresses potential 409 conflict errors when inserting messages

-- First, check if the messages table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'messages'
) AS messages_table_exists;

-- If the messages table has issues with referencing auth.users directly,
-- we can modify the constraint to be more permissive or use a different approach

-- Option 1: Drop and recreate the messages table with correct references
-- WARNING: This will delete all existing messages!

-- DROP TABLE IF EXISTS public.messages CASCADE;

-- Create messages table with proper references
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID, -- Will reference profiles or auth.users
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

-- Create RLS policies
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

-- Comments
COMMENT ON TABLE public.messages IS 'Chat messages between customers and suppliers';
