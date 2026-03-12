-- Diagnostic queries to debug the 409 conflict error
-- Run these in your Supabase SQL Editor

-- 1. Check if the messages table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages';

-- 2. Check foreign key constraints on messages table
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'messages';

-- 3. Check if there are any triggers on the messages table
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'messages';

-- 4. Check RLS policies on messages table
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'messages';

-- 5. Try inserting a test message manually to see the exact error
-- Replace with actual IDs from your system
-- INSERT INTO messages (consumer_id, supplier_id, sender, text)
-- VALUES ('your-consumer-id', 'your-supplier-id', 'customer', 'test message');

-- 6. List some suppliers to verify they exist
SELECT id, business_name FROM suppliers LIMIT 5;

-- 7. Check if your user exists in auth.users
-- (You can only run this if you have admin access)
-- SELECT id, email, created_at FROM auth.users LIMIT 5;
