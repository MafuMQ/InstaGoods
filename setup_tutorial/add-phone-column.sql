-- Add phone column to suppliers table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE public.suppliers
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Also update the trigger to include business_type and other fields
-- (This ensures the trigger works correctly if it fires)

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
  INSERT INTO public.suppliers (
    user_id, 
    business_name, 
    business_type,
    description, 
    location,
    phone,
    provider_type,
    provider_verification_level,
    review_status,
    classification_reason
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'full_name' || '''s Business'),
    COALESCE(NEW.raw_user_meta_data->>'business_type', 'sole_trader'),
    'Welcome to InstaGoods! Please update your business information.',
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    NEW.raw_user_meta_data->>'phone',
    'external',
    'basic',
    'pending',
    'Auto-created on signup'
  );

  -- Insert into user_roles (assign supplier role)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'supplier');

  RETURN NEW;
END;
$$;
