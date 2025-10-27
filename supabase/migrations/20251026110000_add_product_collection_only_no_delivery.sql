-- Migration: Add collection only and no delivery fields to products
ALTER TABLE public.products
ADD COLUMN collection_only BOOLEAN DEFAULT false,
ADD COLUMN no_delivery BOOLEAN DEFAULT false;
