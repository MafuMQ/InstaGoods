-- Fix RLS policies for messages table
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Customers can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Suppliers can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Customers can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Suppliers can insert messages" ON public.messages;

-- Create new RLS policies that are more permissive for testing
-- NOTE: In production, you may want to be more restrictive

-- Allow customers to view their own messages
CREATE POLICY "Customers can view their own messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = consumer_id);

-- Allow suppliers to view ALL messages for their supplier account
-- This uses a simpler check - just that the supplier_id matches
CREATE POLICY "Suppliers can view their messages"
    ON public.messages FOR SELECT
    USING (
        supplier_id IN (
            SELECT id FROM public.suppliers 
            WHERE user_id = auth.uid()
        )
    );

-- Allow customers to insert messages
CREATE POLICY "Customers can insert messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = consumer_id);

-- Allow suppliers to insert messages
CREATE POLICY "Suppliers can insert messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        supplier_id IN (
            SELECT id FROM public.suppliers 
            WHERE user_id = auth.uid()
        )
    );

-- Verify the policies are created
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'messages';

-- Test: Check if suppliers table has data
SELECT id, business_name, user_id FROM suppliers LIMIT 10;

-- Test: Check current auth user
SELECT auth.uid();
