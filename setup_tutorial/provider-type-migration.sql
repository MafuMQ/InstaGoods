-- ============================================================================
-- Provider Type Assignment System - Database Migration
-- ============================================================================
-- This migration adds support for automatic classification of new businesses
-- as internal (retail chains with tax IDs) or external (freelancers/sole proprietors)
-- ============================================================================

-- ============================================================================
-- STEP 1: Add new columns to suppliers table
-- ============================================================================

-- Add business_type for classification
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS business_type TEXT NOT NULL DEFAULT 'sole_trader' 
CHECK (business_type IN ('retail_chain', 'franchise', 'smb', 'sole_trader', 'freelancer'));

-- Add tax_id for internal business verification
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS tax_id TEXT;

-- Add review_status for admin workflow
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'pending'
CHECK (review_status IN ('pending', 'approved', 'rejected', 'auto_approved'));

-- Add admin_notes for manual overrides
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add classification_reason for audit trail
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS classification_reason TEXT;

-- Add classified_by for audit trail (system or admin_id)
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS classified_by TEXT DEFAULT 'system';

-- Add classified_at timestamp
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS classified_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Ensure provider_type and provider_verification_level exist (may already exist from previous migration)
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS provider_type TEXT NOT NULL DEFAULT 'external' 
CHECK (provider_type IN ('internal', 'external'));

ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS provider_verification_level TEXT DEFAULT 'basic'
CHECK (provider_verification_level IN ('basic', 'verified', 'premium'));

-- ============================================================================
-- STEP 2: Create classification function (reusable by trigger and API)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.classify_supplier(
  p_business_name TEXT,
  p_business_type TEXT,
  p_tax_id TEXT
)
RETURNS TABLE(
  provider_type TEXT,
  provider_verification_level TEXT,
  classification_reason TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider_type TEXT;
  v_provider_verification_level TEXT;
  v_classification_reason TEXT;
  v_business_name_lower TEXT;
BEGIN
  -- Normalize business name for matching
  v_business_name_lower := LOWER(p_business_name);
  
  -- Classification Logic
  -- Priority 1: Major retail chains (internal + premium)
  IF v_business_name_lower IN (
    'pick n pay', 'pick n'' pay', 'spar', 'woolworths', 'dischem', 'dis-chem',
    'clicks', 'checkers', 'game', 'makro', 'build it', 'power shop',
    'cna', 'outdoor warehouse', 'game stores', ' Dion wired'
  ) OR p_tax_id IS NOT NULL AND LENGTH(p_tax_id) >= 10 THEN
    v_provider_type := 'internal';
    v_provider_verification_level := 'premium';
    v_classification_reason := 'Major retail chain or registered business with tax ID';
  
  -- Priority 2: Franchise businesses (internal + verified)
  ELSIF p_business_type = 'franchise' THEN
    v_provider_type := 'internal';
    v_provider_verification_level := 'verified';
    v_classification_reason := 'Franchise business';
  
  -- Priority 3: SMB with tax ID (internal + verified)
  ELSIF p_business_type = 'smb' AND p_tax_id IS NOT NULL THEN
    v_provider_type := 'internal';
    v_provider_verification_level := 'verified';
    v_classification_reason := 'Registered SMB with tax ID';
  
  -- Priority 4: Retail chain type (internal + verified)
  ELSIF p_business_type = 'retail_chain' THEN
    v_provider_type := 'internal';
    v_provider_verification_level := 'verified';
    v_classification_reason := 'Retail chain business type';
  
  -- Priority 5: Freelancer (external + basic)
  ELSIF p_business_type = 'freelancer' THEN
    v_provider_type := 'external';
    v_provider_verification_level := 'basic';
    v_classification_reason := 'Freelancer - default external classification';
  
  -- Priority 6: Sole trader (external + basic)
  ELSIF p_business_type = 'sole_trader' THEN
    v_provider_type := 'external';
    v_provider_verification_level := 'basic';
    v_classification_reason := 'Sole proprietor - default external classification';
  
  -- Priority 7: SMB without tax ID (external + basic)
  ELSIF p_business_type = 'smb' THEN
    v_provider_type := 'external';
    v_provider_verification_level := 'basic';
    v_classification_reason := 'SMB without verified tax ID - flagged for review';
  
  -- Default fallback
  ELSE
    v_provider_type := 'external';
    v_provider_verification_level := 'basic';
    v_classification_reason := 'Default classification - no specific type matched';
  END IF;

  -- Return the classification result
  RETURN QUERY SELECT 
    v_provider_type, 
    v_provider_verification_level, 
    v_classification_reason;
END;
$$;

-- ============================================================================
-- STEP 3: Create audit log table for classification decisions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.classification_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'auto_classified', 'admin_override', 'system_update'
  previous_provider_type TEXT,
  new_provider_type TEXT,
  previous_verification_level TEXT,
  new_verification_level TEXT,
  reason TEXT,
  performed_by TEXT, -- 'system' or admin user_id
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.classification_audit_log ENABLE ROW LEVEL SECURITY;

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_classification_audit_supplier ON classification_audit_log(supplier_id);
CREATE INDEX IF NOT EXISTS idx_classification_audit_performed_at ON classification_audit_log(performed_at);

-- ============================================================================
-- STEP 4: Update the handle_new_user trigger to include classification
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_name TEXT;
  v_business_type TEXT;
  v_tax_id TEXT;
  v_provider_type TEXT;
  v_verification_level TEXT;
  v_classification_reason TEXT;
  v_supplier_id UUID;
BEGIN
  -- Get business info from metadata
  v_business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'full_name' || '''s Business');
  v_business_type := COALESCE(NEW.raw_user_meta_data->>'business_type', 'sole_trader');
  v_tax_id := NEW.raw_user_meta_data->>'tax_id';
  
  -- Get classification
  SELECT 
    provider_type,
    provider_verification_level,
    classification_reason
  INTO 
    v_provider_type,
    v_verification_level,
    v_classification_reason
  FROM public.classify_supplier(v_business_name, v_business_type, v_tax_id);

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Insert into suppliers with auto-classification
  INSERT INTO public.suppliers (
    user_id, 
    business_name, 
    description, 
    location,
    provider_type,
    provider_verification_level,
    business_type,
    tax_id,
    review_status,
    classification_reason,
    classified_by,
    classified_at
  )
  VALUES (
    NEW.id,
    v_business_name,
    COALESCE(NEW.raw_user_meta_data->>'description', 'Welcome to InstaGoods! Please update your business information.'),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    v_provider_type,
    v_verification_level,
    v_business_type,
    v_tax_id,
    CASE 
      WHEN v_provider_type = 'internal' AND v_verification_level = 'premium' THEN 'auto_approved'
      ELSE 'pending'
    END,
    v_classification_reason,
    'system',
    now()
  )
  RETURNING id INTO v_supplier_id;

  -- Log the classification
  INSERT INTO public.classification_audit_log (
    supplier_id,
    action,
    new_provider_type,
    new_verification_level,
    reason,
    performed_by
  ) VALUES (
    v_supplier_id,
    'auto_classified',
    v_provider_type,
    v_verification_level,
    v_classification_reason,
    'system'
  );

  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'supplier');

  RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 5: Create function for admin classification override
-- ============================================================================

CREATE OR REPLACE FUNCTION public.override_supplier_classification(
  p_supplier_id UUID,
  p_provider_type TEXT,
  p_provider_verification_level TEXT,
  p_admin_notes TEXT,
  p_admin_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_provider_type TEXT;
  v_current_verification_level TEXT;
BEGIN
  -- Get current values
  SELECT provider_type, provider_verification_level
  INTO v_current_provider_type, v_current_verification_level
  FROM public.suppliers
  WHERE id = p_supplier_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Supplier not found: %', p_supplier_id;
  END IF;

  -- Update supplier
  UPDATE public.suppliers
  SET 
    provider_type = p_provider_type,
    provider_verification_level = p_provider_verification_level,
    admin_notes = p_admin_notes,
    review_status = 'approved',
    classified_by = p_admin_id::TEXT,
    classified_at = now()
  WHERE id = p_supplier_id;

  -- Log the override
  INSERT INTO public.classification_audit_log (
    supplier_id,
    action,
    previous_provider_type,
    new_provider_type,
    previous_verification_level,
    new_verification_level,
    reason,
    performed_by,
    metadata
  ) VALUES (
    p_supplier_id,
    'admin_override',
    v_current_provider_type,
    p_provider_type,
    v_current_verification_level,
    p_provider_verification_level,
    p_admin_notes,
    p_admin_id::TEXT,
    jsonb_build_object(
      'admin_notes', p_admin_notes,
      'overridden_at', now()
    )
  );
END;
$$;

-- ============================================================================
-- STEP 6: Create function for auto-upgrade based on performance
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_supplier_verification_from_metrics(
  p_supplier_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_count INTEGER;
  v_avg_rating NUMERIC;
  v_current_level TEXT;
  v_new_level TEXT;
BEGIN
  -- Get supplier metrics
  SELECT 
    COUNT(DISTINCT o.id)::INTEGER,
    COALESCE(AVG(pr.rating), 0)::NUMERIC(3,2),
    provider_verification_level
  INTO v_order_count, v_avg_rating, v_current_level
  FROM public.suppliers s
  LEFT JOIN public.orders o ON o.supplier_id = s.id
  LEFT JOIN public.product_reviews pr ON pr.supplier_id = s.id
  WHERE s.id = p_supplier_id
  GROUP BY s.id;

  -- Determine new level
  IF v_order_count >= 10 AND v_avg_rating >= 4.0 THEN
    v_new_level := 'premium';
  ELSIF v_order_count >= 5 AND v_avg_rating >= 3.5 THEN
    v_new_level := 'verified';
  ELSE
    v_new_level := v_current_level;
  END IF;

  -- Only update if changed
  IF v_new_level != v_current_level THEN
    UPDATE public.suppliers
    SET provider_verification_level = v_new_level
    WHERE id = p_supplier_id;

    -- Log the upgrade
    INSERT INTO public.classification_audit_log (
      supplier_id,
      action,
      previous_verification_level,
      new_verification_level,
      reason,
      performed_by,
      metadata
    ) VALUES (
      p_supplier_id,
      'system_update',
      v_current_level,
      v_new_level,
      'Auto-upgraded based on performance metrics',
      'system',
      jsonb_build_object(
        'order_count', v_order_count,
        'avg_rating', v_avg_rating
      )
    );
  END IF;
END;
$$;

-- ============================================================================
-- STEP 7: Create views for admin management
-- ============================================================================

-- View for admin supplier management with all details
CREATE OR REPLACE VIEW public.supplier_admin_view AS
SELECT 
  s.id,
  s.user_id,
  s.business_name,
  s.description,
  s.location,
  s.provider_type,
  s.provider_verification_level,
  s.business_type,
  s.tax_id,
  s.review_status,
  s.admin_notes,
  s.classification_reason,
  s.classified_by,
  s.classified_at,
  s.is_active,
  s.created_at,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(AVG(pr.rating), 0)::NUMERIC(3,2) as avg_rating,
  COUNT(DISTINCT pr.id) as total_reviews
FROM public.suppliers s
LEFT JOIN public.orders o ON o.supplier_id = s.id
LEFT JOIN public.product_reviews pr ON pr.supplier_id = s.id
GROUP BY s.id;

-- View for pending reviews
CREATE OR REPLACE VIEW public.supplier_pending_review_view AS
SELECT 
  id,
  business_name,
  description,
  location,
  provider_type,
  provider_verification_level,
  business_type,
  classification_reason,
  created_at,
  classified_at
FROM public.suppliers
WHERE review_status = 'pending'
ORDER BY created_at ASC;

-- ============================================================================
-- STEP 8: Add RLS policies
-- ============================================================================

-- Allow suppliers to view their own classification
CREATE POLICY "Suppliers can view own classification"
  ON public.suppliers FOR SELECT
  USING (user_id = auth.uid());

-- Allow suppliers to update their own business info (but not classification)
CREATE POLICY "Suppliers can update own profile"
  ON public.suppliers FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() 
    AND provider_type IS NOT DISTINCT FROM old.provider_type
    AND provider_verification_level IS NOT DISTINCT FROM old.provider_verification_level
  );

-- Allow anyone to view supplier_admin_view (for admins)
CREATE POLICY "Anyone can view supplier admin view"
  ON public.supplier_admin_view FOR SELECT
  USING (true);

-- Allow anyone to view pending review view
CREATE POLICY "Anyone can view pending review view"
  ON public.supplier_pending_review_view FOR SELECT
  USING (true);

-- Allow viewing audit log (admins only via function)
CREATE POLICY "System can insert classification audit log"
  ON public.classification_audit_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own classification audit"
  ON public.classification_audit_log FOR SELECT
  USING (
    performed_by = auth.uid()::TEXT 
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- STEP 9: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_suppliers_business_type ON suppliers(business_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_review_status ON suppliers(review_status);
CREATE INDEX IF NOT EXISTS idx_suppliers_classified_at ON suppliers(classified_at);

-- ============================================================================
-- STEP 10: Update existing suppliers with classification
-- ============================================================================

-- Classify existing suppliers that don't have provider_type
UPDATE public.suppliers
SET 
  (provider_type, provider_verification_level, classification_reason, review_status, classified_by, classified_at) = (
    SELECT 
      provider_type,
      provider_verification_level,
      classification_reason,
      CASE WHEN provider_type = 'internal' AND provider_verification_level = 'premium' THEN 'auto_approved' ELSE 'approved' END,
      'system',
      now()
    FROM public.classify_supplier(business_name, COALESCE(business_type, 'sole_trader'), tax_id)
  )
WHERE provider_type IS NULL OR provider_type = 'external';

-- Log the bulk classification
INSERT INTO public.classification_audit_log (
  supplier_id,
  action,
  new_provider_type,
  new_verification_level,
  reason,
  performed_by
)
SELECT 
  id,
  'system_update',
  provider_type,
  provider_verification_level,
  'Bulk classification of existing suppliers',
  'system'
FROM public.suppliers
WHERE classification_reason IS NULL;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Provider Type Assignment System migration completed successfully!';
END
$$;
