-- Migration: Update products delivery/collection logic for new supplier form (20251026)
ALTER TABLE public.products
  DROP COLUMN IF EXISTS collection_only;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS no_delivery BOOLEAN DEFAULT false;

-- (Optional: If you want to remove other deprecated fields, add DROP COLUMN statements here)
