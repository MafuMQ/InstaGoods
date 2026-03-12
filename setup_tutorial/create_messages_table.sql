-- Create messages table for customer-supplier chat feature
-- Run this SQL in your Supabase SQL Editor
-- This script is idempotent - safe to run if table already exists

-- Create the messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('customer', 'supplier')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Customers can view their own messages' AND tablename = 'messages'
    ) THEN
        -- Create policies for messages
        -- Allow customers to view their own messages (messages they sent or received)
        CREATE POLICY "Customers can view their own messages"
            ON public.messages FOR SELECT
            USING (auth.uid() = consumer_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can view their messages' AND tablename = 'messages'
    ) THEN
        -- Allow suppliers to view messages for their shop
        CREATE POLICY "Suppliers can view their messages"
            ON public.messages FOR SELECT
            USING (
                supplier_id IN (
                    SELECT id FROM public.suppliers 
                    WHERE user_id = auth.uid()
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Customers can insert messages' AND tablename = 'messages'
    ) THEN
        -- Allow customers to insert messages to suppliers
        CREATE POLICY "Customers can insert messages"
            ON public.messages FOR INSERT
            WITH CHECK (auth.uid() = consumer_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Suppliers can insert messages' AND tablename = 'messages'
    ) THEN
        -- Allow suppliers to insert messages to customers
        CREATE POLICY "Suppliers can insert messages"
            ON public.messages FOR INSERT
            WITH CHECK (
                supplier_id IN (
                    SELECT id FROM public.suppliers 
                    WHERE user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_messages_consumer_supplier 
    ON public.messages(consumer_id, supplier_id);

CREATE INDEX IF NOT EXISTS idx_messages_supplier_consumer 
    ON public.messages(supplier_id, consumer_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
    ON public.messages(created_at DESC);

-- Try to add realtime support (ignore if already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Already in publication
END $$;

-- Comments
COMMENT ON TABLE public.messages IS 'Chat messages between customers and suppliers';
COMMENT ON COLUMN public.messages.consumer_id IS 'The customer who sent/received the message';
COMMENT ON COLUMN public.messages.supplier_id IS 'The supplier who sent/received the message';
COMMENT ON COLUMN public.messages.sender IS 'Who sent the message: customer or supplier';
COMMENT ON COLUMN public.messages.text IS 'The message content';
