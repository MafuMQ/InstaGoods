-- Add KYC (Know Your Customer) fields to profiles table
-- This migration adds identity verification and address fields required for customer registration

-- Add KYC columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS address_street TEXT,
ADD COLUMN IF NOT EXISTS address_city TEXT,
ADD COLUMN IF NOT EXISTS address_state TEXT,
ADD COLUMN IF NOT EXISTS address_postal_code TEXT,
ADD COLUMN IF NOT EXISTS address_country TEXT DEFAULT 'South Africa';

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Create index on date_of_birth for age verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON public.profiles(date_of_birth);

-- Update the handle_new_user trigger function to include KYC fields from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    first_name,
    last_name,
    phone,
    date_of_birth,
    address_street,
    address_city,
    address_state,
    address_postal_code,
    address_country
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NULLIF(NEW.raw_user_meta_data->>'date_of_birth', '')::DATE,
    COALESCE(NEW.raw_user_meta_data->>'address_street', ''),
    COALESCE(NEW.raw_user_meta_data->>'address_city', ''),
    COALESCE(NEW.raw_user_meta_data->>'address_state', ''),
    COALESCE(NEW.raw_user_meta_data->>'address_postal_code', ''),
    COALESCE(NEW.raw_user_meta_data->>'address_country', 'South Africa')
  );
  RETURN NEW;
END;
$$;

-- Create a function to update KYC profile data
CREATE OR REPLACE FUNCTION public.update_customer_kyc(
  p_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT,
  p_date_of_birth DATE,
  p_address_street TEXT,
  p_address_city TEXT,
  p_address_state TEXT,
  p_address_postal_code TEXT,
  p_address_country TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    first_name = p_first_name,
    last_name = p_last_name,
    phone = p_phone,
    date_of_birth = p_date_of_birth,
    address_street = p_address_street,
    address_city = p_address_city,
    address_state = p_address_state,
    address_postal_code = p_address_postal_code,
    address_country = p_address_country,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users for the KYC update function
GRANT EXECUTE ON FUNCTION public.update_customer_kyc TO authenticated;

-- Add comment to document the KYC fields
COMMENT ON COLUMN public.profiles.first_name IS 'Customer first name for KYC verification';
COMMENT ON COLUMN public.profiles.last_name IS 'Customer last name for KYC verification';
COMMENT ON COLUMN public.profiles.phone IS 'Customer phone number for KYC verification';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'Customer date of birth for age verification (must be 18+)';
COMMENT ON COLUMN public.profiles.address_street IS 'Customer street address for delivery/collection';
COMMENT ON COLUMN public.profiles.address_city IS 'Customer city for delivery/collection';
COMMENT ON COLUMN public.profiles.address_state IS 'Customer state/province for delivery/collection';
COMMENT ON COLUMN public.profiles.address_postal_code IS 'Customer postal code for delivery/collection';
COMMENT ON COLUMN public.profiles.address_country IS 'Customer country for delivery/collection';
