-- ============================================================================
-- Comprehensive Fix: Supplier Signup Database Error
-- ============================================================================
-- This script fixes multiple issues that can cause "Database error saving new user"
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================================

-- ============================================================================
-- STEP 1: Add missing columns to suppliers table (if they don't exist)
-- ============================================================================

-- Add business_type column if it doesn't exist
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'sole_trader';

-- Add provider_type column (for provider segregation feature)
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS provider_type TEXT NOT NULL DEFAULT 'external'
CHECK (provider_type IN ('internal', 'external'));

-- Add provider_verification_level column (for tiered trust levels)
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS provider_verification_level TEXT DEFAULT 'basic'
CHECK (provider_verification_level IN ('basic', 'verified', 'premium'));

-- Add review_status column (for supplier approval workflow)
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending';

-- Add classification_reason column
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS classification_reason TEXT;

-- Add indexes for the new columns (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_suppliers_provider_type ON suppliers(provider_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_verification_level ON suppliers(provider_verification_level);

-- ============================================================================
-- STEP 2: Fix RLS policies on user_roles table
-- ============================================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can insert customer role during signup" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert roles during signup" ON public.user_roles;

-- Create a new policy that allows authenticated users to insert their own roles
-- This is needed because the handle_new_user trigger inserts the 'supplier' role
CREATE POLICY "Users can insert roles during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.role() = 'service_role'
  );

-- ============================================================================
-- STEP 3: Fix the handle_new_user trigger to work correctly
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Insert into suppliers with metadata from sign-up
  -- Using safe insert that works even if metadata fields are missing
  INSERT INTO public.suppliers (
    user_id, 
    business_name, 
    business_type,
    description, 
    location,
    phone,
    provider_type,
    provider_verification_level,
    review_status
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'business_name', 
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Business') || '''s Business'
    ),
    COALESCE(NEW.raw_user_meta_data->>'business_type', 'sole_trader'),
    'Welcome to InstaGoods! Please update your business information.',
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    NEW.raw_user_meta_data->>'phone',
    'external',
    'basic',
    'pending'
  );

  -- Insert into user_roles (assign supplier role)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'supplier');

  RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 4: Ensure the trigger exists and is properly attached
-- ============================================================================

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- DONE!
-- ============================================================================
-- After running this script, try signing up as a new supplier again.
-- The error should be resolved.
