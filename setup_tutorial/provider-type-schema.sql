-- ============================================================================
-- Database Schema Update: Provider Type Segregation
-- ============================================================================
-- This script adds support for distinguishing between InstaGoods-managed
-- services and external third-party provider services.
-- ============================================================================

-- Add provider_type column to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS provider_type TEXT NOT NULL DEFAULT 'external' 
CHECK (provider_type IN ('internal', 'external'));

-- Add provider_verification_level for tiered trust levels
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS provider_verification_level TEXT DEFAULT 'basic'
CHECK (provider_verification_level IN ('basic', 'verified', 'premium'));

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_suppliers_provider_type ON suppliers(provider_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_verification_level ON suppliers(provider_verification_level);

-- Create external_partners view for the Partners page
CREATE OR REPLACE VIEW external_partners AS
SELECT 
    s.id,
    s.business_name,
    s.description,
    s.location,
    s.logo_url,
    s.banner_url,
    s.provider_type,
    s.provider_verification_level,
    s.is_active,
    COUNT(DISTINCT p.id) as product_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.main_category = 'Services') as service_count,
    COALESCE(AVG(pr.rating), 0) as avg_rating,
    COUNT(DISTINCT pr.id) as review_count
FROM suppliers s
LEFT JOIN products p ON p.supplier_id = s.id AND p.is_active = true
LEFT JOIN product_reviews pr ON pr.supplier_id = s.id
WHERE s.provider_type = 'external' AND s.is_active = true
GROUP BY s.id, s.business_name, s.description, s.location, s.logo_url, 
         s.banner_url, s.provider_type, s.provider_verification_level, s.is_active;

-- Create internal_services view for InstaGoods-curated services
CREATE OR REPLACE VIEW internal_services AS
SELECT 
    s.id,
    s.business_name,
    s.description,
    s.location,
    s.logo_url,
    s.banner_url,
    s.provider_type,
    s.provider_verification_level,
    s.is_active,
    COUNT(DISTINCT p.id) as product_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.main_category = 'Services') as service_count,
    COALESCE(AVG(pr.rating), 0) as avg_rating,
    COUNT(DISTINCT pr.id) as review_count
FROM suppliers s
LEFT JOIN products p ON p.supplier_id = s.id AND p.is_active = true
LEFT JOIN product_reviews pr ON pr.supplier_id = s.id
WHERE s.provider_type = 'internal' AND s.is_active = true
GROUP BY s.id, s.business_name, s.description, s.location, s.logo_url, 
         s.banner_url, s.provider_type, s.provider_verification_level, s.is_active;

-- ============================================================================
-- RLS Policies for Provider Type
-- ============================================================================

-- Allow anyone to view provider_type
CREATE POLICY "Anyone can view supplier provider type"
ON suppliers FOR SELECT
USING (true);

-- Suppliers can update their own provider_type (admin should set initially)
CREATE POLICY "Suppliers can update own provider type"
ON suppliers FOR UPDATE
USING (auth.uid() = id);

-- ============================================================================
-- Update existing suppliers with provider types based on known patterns
-- ============================================================================

-- Major retail chains are internal/curated partners
UPDATE suppliers 
SET provider_type = 'internal', provider_verification_level = 'premium'
WHERE business_name IN (
    'Pick n'' Pay', 
    'Spar', 
    'Woolworths', 
    'DisChem', 
    'Clicks',
    'Checkers',
    'Game',
    'Makro'
);

-- Individual service providers and freelancers are external
UPDATE suppliers 
SET provider_type = 'external', provider_verification_level = 'verified'
WHERE provider_type IS NULL OR provider_type = 'external';

-- ============================================================================
-- Seed Data: Add sample external partners for testing
-- ============================================================================

INSERT INTO suppliers (
    id,
    business_name,
    description,
    location,
    latitude,
    longitude,
    provider_type,
    provider_verification_level,
    is_active
) VALUES 
(
    gen_random_uuid(),
    'ProServe Solutions',
    'Professional home services including plumbing, electrical, and general repairs',
    'Johannesburg, Gauteng',
    -26.2041,
    28.0473,
    'external',
    'premium',
    true
),
(
    gen_random_uuid(),
    'TechFix Experts',
    'Computer repair, IT support, and technology services',
    'Sandton, Gauteng',
    -26.1076,
    28.0567,
    'external',
    'verified',
    true
),
(
    gen_random_uuid(),
    'CleanHome Services',
    'Professional cleaning services for homes and offices',
    'Pretoria, Gauteng',
    -25.7479,
    28.2292,
    'external',
    'verified',
    true
) ON CONFLICT DO NOTHING;

-- Add RLS policies for the new views
CREATE POLICY "Anyone can view external partners"
ON external_partners FOR SELECT
USING (true);

CREATE POLICY "Anyone can view internal services"
ON internal_services FOR SELECT
USING (true);
