-- Migration: Add delivery/location/collection fields to products
ALTER TABLE public.products
ADD COLUMN available_everywhere BOOLEAN DEFAULT false,
ADD COLUMN delivery_location TEXT,
ADD COLUMN delivery_lat DOUBLE PRECISION,
ADD COLUMN delivery_lng DOUBLE PRECISION,
ADD COLUMN delivery_radius_km INTEGER,
ADD COLUMN delivery_fee DECIMAL(10,2),
ADD COLUMN collection_available BOOLEAN DEFAULT false;
