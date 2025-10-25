-- Update handle_new_user function to automatically create supplier records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Insert into suppliers table (assuming all new users are suppliers for this app)
  INSERT INTO public.suppliers (user_id, business_name, description, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Business') || '''s Business',
    'Welcome to InstaGoods! Please update your business information.',
    ''
  );
  
  -- Assign supplier role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'supplier'::app_role);
  
  RETURN NEW;
END;
$$;